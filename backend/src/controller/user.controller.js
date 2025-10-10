const userService = require("../services/user.service");
const bcrypt = require("bcrypt");
const { generateToken } = require("../config/jwt");
const crypto = require("crypto");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const { sendMail } = require("../utils/mail.js");

// Enhanced error handling function
const handleUserError = (error, res) => {
  // Handle specific Prisma errors
  if (error.code === 'P2002') {
    return res.status(409).json({
      success: false,
      message: 'User with this information already exists',
      field: error.meta?.target?.[0] || 'unknown'
    });
  }
  
  if (error.code === 'P2025') {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }
  
  if (error.code === 'P2003') {
    return res.status(400).json({
      success: false,
      message: 'Invalid role reference'
    });
  }
  
  // Handle validation errors
  if (error.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: error.details || [error.message]
    });
  }
  
  // Handle authentication errors
  if (error.message && error.message.includes('Invalid credentials')) {
    return res.status(401).json({
      success: false,
      message: 'Invalid email or password'
    });
  }
  
  // Handle account lockout errors
  if (error.message && error.message.includes('Account locked')) {
    return res.status(423).json({
      success: false,
      message: 'Account is locked due to too many failed attempts'
    });
  }
  
  // Default error response
  return res.status(500).json({
    success: false,
    message: 'Internal server error'
  });
};

function generateResetToken() {
  return crypto.randomBytes(32).toString("hex");
}

// 🔐 Login
exports.loginFailed = async (req, res, next) => {
  try {
    const { email, attemptNumber } = req.body;

    // Check if user exists
    const user = await userService.getUserByEmail(email);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Update user's failed login attempts
    await userService.updateFailedLoginAttempts(user.id, attemptNumber);

    // Check if user should be locked out
    if (attemptNumber >= 5) {
      // Lock user account for 60 seconds
      await userService.lockUser(user.id, 60);
      return res.status(403).json({
        success: false,
        message:
          "Account locked due to too many failed attempts. Please wait 60 seconds before trying again.",
      });
    }

    res.json({
      success: true,
      message: "Login attempt recorded",
      remainingAttempts: 5 - attemptNumber,
    });
  } catch (error) {
    next(error);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await userService.getUserByEmail(email);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials" });
    }

    const token = generateToken({ id: user.id, roleId: user.roleId });

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        phone: user.phone || "",
        profilePicture: user.profilePicture || "",
        role: user.role?.role_type || "user",
        createdAt: user.createdAt,
        lastLoginAt: user.lastLoginAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

// 🧾 Register with auto-generated Employee ID
exports.register = async (req, res, next) => {
  try {
    const { email, password, firstName, lastName, phone, roleId } = req.body;

    // 1. Check for existing user
    const existingUser = await userService.getUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Email already registered",
      });
    }

    // 2. Generate Employee ID directly in the controller
    const generateEmployeeId = () => {
      const prefix = "EMP";
      const randomPart = Math.random().toString(36).slice(2, 6).toUpperCase();
      return `${prefix}-${randomPart}`; // e.g., "EMP-3XK9"
    };
    const employeeId = generateEmployeeId();

    // 3. Create user with all fields
    const user = await userService.createUser({
      email,
      password: await bcrypt.hash(password, 10),
      firstName,
      lastName,
      phone,
      roleId,
      employeeId, // Auto-injected
    });

    // 4. Generate token (unchanged)
    const token = generateToken({ id: user.id, roleId: user.roleId });

    // 5. Enhanced response
    res.status(201).json({
      success: true,
      message: "User registered successfully",
      token,
      user: {
        id: user.id,
        email: user.email,
        employeeId: user.employeeId, // Now included
        role: user.role?.role_type,
        firstName: user.firstName,
        lastName: user.lastName,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ➕ Create
exports.createUser = async (req, res, next) => {
  try {
    // Hash password before creating user
    const userData = { ...req.body };
    if (userData.password) {
      userData.password = await bcrypt.hash(userData.password, 10);
    }
    
    const result = await userService.createUser(userData);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
};

// 📋 Get all (with pagination)
exports.getAllUsers = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = "",
      status = "",
      roleId = "",
      sortField = "createdAt",
      sortOrder = "desc"
    } = req.query;

    // Validate pagination parameters
    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit) || 10));

    const result = await userService.getAllUsers({
      page: pageNum,
      limit: limitNum,
      search,
      status,
      roleId,
      sortField,
      sortOrder
    });

    res.json({
      success: true,
      data: result.users,
      pagination: {
        currentPage: pageNum,
        totalPages: Math.ceil(result.total / limitNum),
        totalItems: result.total,
        itemsPerPage: limitNum,
        hasNext: pageNum < Math.ceil(result.total / limitNum),
        hasPrev: pageNum > 1
      },
      summary: result.summary || {}
    });
  } catch (error) {
    handleUserError(error, res);
  }
};

// 📍 Get by ID
exports.getUserById = async (req, res, next) => {
  try {
    const result = await userService.getUserById(req.params.id);
    if (!result) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    handleUserError(error, res);
  }
};

// 🔁 Update
exports.updateUser = async (req, res, next) => {
  try {
    const result = await userService.updateUser(req.params.id, req.body);
    
    if (!result) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }
    res.json({
      success: true,
      message: 'User updated successfully',
      data: result
    });
  } catch (error) {
    handleUserError(error, res);
  }
};

// 🗑️ Soft delete (Deactivate user)
exports.deleteUser = async (req, res, next) => {
  try {
    const deactivatedBy = req.user?.id || null; // Get the admin who is deactivating
    const result = await userService.deleteUser(req.params.id, deactivatedBy);
    res.json({
      success: true,
      message: "User deactivated successfully",
      data: result
    });
  } catch (error) {
    handleUserError(error, res);
  }
};

// ♻️ Reactivate user
exports.reactivateUser = async (req, res, next) => {
  try {
    const result = await userService.reactivateUser(req.params.id);
    res.json(result);
  } catch (error) {
    handleUserError(error, res);
  }
};

// 📥 Import Users from CSV
exports.importUsers = async (req, res, next) => {
  try {
    const { users } = req.body;

    if (!users || !Array.isArray(users)) {
      return res.status(400).json({
        success: false,
        message: "Invalid data format. Expected an array of users.",
      });
    }

    const result = await userService.importUsers(users);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
};

// 👉 Forgot Password handler
exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    // Normalize email to lowercase for consistent lookup
    const normalizedEmail = email.trim().toLowerCase();
    const user = await userService.getUserByEmail(normalizedEmail);

    // Always return success to prevent email enumeration
    // Only send email if user actually exists
    if (user) {
      // Generate reset token and expiry
      const resetToken = generateResetToken();
      const tokenExpiry = new Date(Date.now() + 1000 * 60 * 10); // 10 minutes from now

      // Generate 6-digit code
      const resetCode = Math.floor(100000 + Math.random() * 900000);

      // Store reset code and expiry
      await prisma.user.update({
        where: { id: user.id },
        data: {
          resetToken: resetCode.toString(),
          resetTokenExpiry: tokenExpiry,
        },
      });

      // Send email with reset code
      try {
        await sendMail({
          to: normalizedEmail,
          subject: "Your Password Reset Code",
          html: `
        <p>Hello ${user.firstName || "User"},</p>
        <p>Your password reset code is:</p>
        <h2 style="color:#007bff">${resetCode}</h2>
        <p>This code will expire in 10 minutes.</p>
        <p>If you didn't request this, please ignore this email.</p>
      `,
        });
      } catch (emailError) {
        // Still return success to prevent email enumeration
        // The reset code is still generated and stored in the database
      }
    }

    // Always return success message (prevents email enumeration attacks)
    const message = user 
      ? "Password reset code has been generated. Please contact administrator if you don't receive the email."
      : "If an account with that email exists, you will receive a password reset code.";
    
    return res.json({
      success: true,
      message,
    });
  } catch (error) {
    next(error);
  }
};

// GET /auth/verify-employee-id/:id

exports.verifyEmployeeId = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res
        .status(400)
        .json({ success: false, message: "Employee ID is required" });
    }
    const employeeId = id.trim();
    const user = await prisma.user.findFirst({
      where: { employeeId: employeeId },
    });
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "Employee ID not found" });
    }
    res.json({
      success: true,
      message: "Employee ID found",
      user: {
        id: user.id,
        email: user.email,
        employeeId: user.employeeId,
        name: user.name,
        department: user.department,
      },
    });
  } catch (error) {
    next(error);
  }
};

// POST /auth/contact-admin
exports.contactAdmin = async (req, res, next) => {
  try {
    const {
      firstName,
      lastName,
      employeeId,
      phone,
      lastKnownEmail,
      reason,
      additionalInfo,
    } = req.body;

    // Validate required fields
    if (!firstName || !lastName || !phone || !reason) {
      return res.status(400).json({ 
        success: false, 
        message: "First name, last name, phone number, and reason are required" 
      });
    }

    // Try to find matching user in database
    let matchedUser = null;
    
    // Priority 1: Search by employee ID if provided
    if (employeeId && employeeId.trim()) {
      matchedUser = await prisma.user.findFirst({
        where: { employeeId: employeeId.trim() },
        include: { role: true }
      });
    }
    
    // Priority 2: Search by email if provided
    if (!matchedUser && lastKnownEmail && lastKnownEmail.trim()) {
      matchedUser = await prisma.user.findFirst({
        where: { email: lastKnownEmail.trim().toLowerCase() },
        include: { role: true }
      });
    }
    
    // Priority 3: Search by phone number
    if (!matchedUser && phone && phone.trim()) {
      matchedUser = await prisma.user.findFirst({
        where: { phone: phone.trim() },
        include: { role: true }
      });
    }
    
    // Priority 4: Search by first and last name
    if (!matchedUser) {
      matchedUser = await prisma.user.findFirst({
        where: {
          firstName: { contains: firstName.trim(), mode: 'insensitive' },
          lastName: { contains: lastName.trim(), mode: 'insensitive' }
        },
        include: { role: true }
      });
    }

    // Prepare email content
    const { sendAdminNotification } = require("../utils/mail.js");
    
    const subject = `🔐 Account Recovery Request - ${firstName} ${lastName}`;
    
    const matchInfo = matchedUser ? `
      <div style="background: #d1fae5; border-left: 4px solid #10b981; padding: 15px; margin: 20px 0;">
        <h3 style="color: #065f46; margin: 0 0 10px 0;">✓ User Match Found in Database</h3>
        <ul style="margin: 0; padding-left: 20px; color: #047857;">
          <li><strong>Email:</strong> ${matchedUser.email}</li>
          <li><strong>Employee ID:</strong> ${matchedUser.employeeId || 'N/A'}</li>
          <li><strong>Name:</strong> ${matchedUser.firstName} ${matchedUser.lastName}</li>
          <li><strong>Phone:</strong> ${matchedUser.phone || 'N/A'}</li>
          <li><strong>Role:</strong> ${matchedUser.role?.role_type || 'N/A'}</li>
          <li><strong>Status:</strong> ${matchedUser.status}</li>
          <li><strong>User ID:</strong> ${matchedUser.id}</li>
        </ul>
      </div>
    ` : `
      <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0;">
        <h3 style="color: #92400e; margin: 0 0 10px 0;">⚠️ No Exact Match Found</h3>
        <p style="margin: 0; color: #78350f;">Manual verification required. User might be new or information might not match database records.</p>
      </div>
    `;
    
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; }
            .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
            .info-box { background: white; border-radius: 8px; padding: 20px; margin: 15px 0; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
            .label { font-weight: bold; color: #4b5563; }
            .value { color: #1f2937; margin-bottom: 10px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="margin: 0;">🔐 Account Recovery Request</h1>
              <p style="margin: 10px 0 0 0; opacity: 0.9;">A user needs help accessing their account</p>
            </div>
            <div class="content">
              ${matchInfo}
              
              <div class="info-box">
                <h3 style="margin-top: 0; color: #1f2937;">📝 Request Details</h3>
                <div class="value"><span class="label">Name:</span> ${firstName} ${lastName}</div>
                <div class="value"><span class="label">Employee ID Provided:</span> ${employeeId || 'Not provided'}</div>
                <div class="value"><span class="label">Phone Number:</span> ${phone}</div>
                <div class="value"><span class="label">Last Known Email:</span> ${lastKnownEmail || 'Not provided'}</div>
              </div>
              
              <div class="info-box">
                <h3 style="margin-top: 0; color: #1f2937;">📋 Recovery Reason</h3>
                <div class="value">${reason}</div>
              </div>
              
              ${additionalInfo ? `
              <div class="info-box">
                <h3 style="margin-top: 0; color: #1f2937;">💬 Additional Information</h3>
                <div class="value">${additionalInfo}</div>
              </div>
              ` : ''}
              
              <div style="background: #eff6ff; border: 2px solid #3b82f6; border-radius: 8px; padding: 20px; margin-top: 20px;">
                <h3 style="margin: 0 0 10px 0; color: #1e40af;">⚡ Action Required</h3>
                <p style="margin: 0; color: #1e3a8a;">
                  ${matchedUser ? 
                    `Please verify the user's identity and assist with account recovery for <strong>${matchedUser.email}</strong>` : 
                    `Please manually search for this user and assist with account recovery`
                  }
                </p>
              </div>
              
              <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 12px;">
                <p style="margin: 0;"><strong>Request Timestamp:</strong> ${new Date().toLocaleString()}</p>
                ${matchedUser ? `<p style="margin: 5px 0 0 0;"><strong>Matched User ID:</strong> ${matchedUser.id}</p>` : ''}
              </div>
            </div>
          </div>
        </body>
      </html>
    `;
    
    const text = `
Account Recovery Request

${matchedUser ? '✓ USER MATCH FOUND' : '⚠️ NO EXACT MATCH FOUND'}
${matchedUser ? `
Matched User:
- Email: ${matchedUser.email}
- Employee ID: ${matchedUser.employeeId || 'N/A'}
- Name: ${matchedUser.firstName} ${matchedUser.lastName}
- Phone: ${matchedUser.phone || 'N/A'}
- Role: ${matchedUser.role?.role_type || 'N/A'}
- Status: ${matchedUser.status}
- User ID: ${matchedUser.id}
` : ''}

Request Details:
- Name: ${firstName} ${lastName}
- Employee ID Provided: ${employeeId || 'Not provided'}
- Phone Number: ${phone}
- Last Known Email: ${lastKnownEmail || 'Not provided'}
- Reason: ${reason}
${additionalInfo ? `- Additional Info: ${additionalInfo}` : ''}

Timestamp: ${new Date().toLocaleString()}
    `;

    // Send email to admin
    const result = await sendAdminNotification(subject, text, html);
    
    if (result.success) {
      res.json({
        success: true,
        message: "Your recovery request has been sent to the administrator. They will contact you within 24 hours.",
        userMatched: !!matchedUser
      });
    } else {
      res.status(500).json({ 
        success: false, 
        message: "Failed to send recovery request. Please try again or contact support directly." 
      });
    }
  } catch (error) {
    next(error);
  }
};

// Login with reset code (6-digit)
exports.resetCodeLogin = async (req, res, next) => {
  try {
    const { email, code } = req.body;
    if (!email || !code) {
      return res.status(400).json({
        success: false,
        message: "Email and code are required",
      });
    }

    // Normalize email
    const normalizedEmail = email.trim().toLowerCase();
    const user = await userService.getUserByEmail(normalizedEmail);

    if (!user || !user.resetToken || !user.resetTokenExpiry) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired code",
      });
    }

    // Check code and expiry
    const now = new Date();
    if (
      user.resetToken !== code ||
      !user.resetTokenExpiry ||
      now > user.resetTokenExpiry
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired code",
      });
    }

    // Optionally clear the reset token after successful login
    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken: null,
        resetTokenExpiry: null,
      },
    });

    // Generate JWT token
    const token = generateToken({ id: user.id, roleId: user.roleId });

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role?.role_type || "user",
      },
    });
  } catch (error) {
    next(error);
  }
};

// POST /auth/reset-password-with-code
exports.resetPasswordWithCode = async (req, res, next) => {
  try {
    const { email, code, newPassword } = req.body;
    if (!email || !code || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Email, code, and new password are required",
      });
    }
    const normalizedEmail = email.trim().toLowerCase();
    const user = await userService.getUserByEmail(normalizedEmail);
    if (!user || !user.resetToken || !user.resetTokenExpiry) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired code",
      });
    }
    const now = new Date();
    if (
      user.resetToken !== code ||
      !user.resetTokenExpiry ||
      now > user.resetTokenExpiry
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired code",
      });
    }
    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetTokenExpiry: null,
        lastLoginAt: new Date(), // Update last login time
      },
    });

    // Generate JWT token for automatic login
    const token = generateToken({ id: user.id, roleId: user.roleId });

    res.json({
      success: true,
      message: "Password has been reset successfully.",
      token, // Return token for automatic login
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        phone: user.phone || "",
        profilePicture: user.profilePicture || "",
        role: user.role?.role_type || "user",
        employeeId: user.employeeId || "",
        createdAt: user.createdAt,
        lastLoginAt: new Date(),
      },
    });
  } catch (error) {
    next(error);
  }
};

// Update current user profile
exports.updateCurrentUser = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const updateData = req.body;
    // Remove fields that should not be updated by the user
    delete updateData.employeeId;
    delete updateData.role;
    delete updateData.profilePicture; // Use the dedicated endpoint for this
    // You may want to add more field restrictions as needed
    if (updateData.password) {
      const bcrypt = require("bcryptjs");
      updateData.password = await bcrypt.hash(updateData.password, 10);
    }
    const { prisma } = require("../config/db");
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
    });
    const { password, ...userWithoutPassword } = updatedUser;
    res.json({ success: true, data: userWithoutPassword });
  } catch (error) {
    next(error);
  }
};

// Update current user profile
exports.updateProfile = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { firstName, lastName, email, phone, profilePicture } = req.body;

    // Check if email is being changed and if it already exists
    if (email) {
      const existingUser = await prisma.user.findFirst({
        where: { 
          email: email.toLowerCase(),
          NOT: { id: userId }
        }
      });
      
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'Email already exists'
        });
      }
    }

    // Update user profile
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        firstName: firstName || undefined,
        lastName: lastName || undefined,
        email: email ? email.toLowerCase() : undefined,
        phone: phone || undefined,
        profilePicture: profilePicture || undefined,
      },
      include: {
        role: true
      }
    });

    // Remove password from response
    const { password, ...userWithoutPassword } = updatedUser;

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        id: userWithoutPassword.id,
        email: userWithoutPassword.email,
        firstName: userWithoutPassword.firstName,
        lastName: userWithoutPassword.lastName,
        phone: userWithoutPassword.phone,
        profilePicture: userWithoutPassword.profilePicture,
        role: userWithoutPassword.role?.role_type,
        createdAt: userWithoutPassword.createdAt,
        lastLoginAt: userWithoutPassword.lastLoginAt,
      }
    });
  } catch (error) {
    next(error);
  }
};

// Change password for authenticated user
exports.changePassword = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { currentPassword, newPassword } = req.body;

    // Get user with password to verify current password
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Hash new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedNewPassword }
    });

    res.json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    next(error);
  }
};