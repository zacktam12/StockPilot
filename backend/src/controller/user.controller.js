const userService = require("../services/user.service");
const bcrypt = require("bcrypt");
const { generateToken } = require("../config/jwt");
const crypto = require("crypto");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const { sendMail } = require("../utils/mail.js");

// Enhanced error handling function
const handleUserError = (error, res) => {
  console.error('User Controller Error:', error);
  
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
        role: user.role?.role_type || "user",
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
    const result = await userService.createUser(req.body);
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
      department = "",
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
      department,
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

// 🗑️ Soft delete
exports.deleteUser = async (req, res, next) => {
  try {
    await userService.deleteUser(req.params.id);
    res.json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    next(error);
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

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "No user found with this email",
      });
    }

    // Generate reset token and expiry (optional)
    const resetToken = generateResetToken();
    const tokenExpiry = new Date(Date.now() + 1000 * 60 * 10); // 10 minutes from now

    // Save resetToken and expiry (optional: hash token for security)
    const resetCode = Math.floor(100000 + Math.random() * 900000); // 6-digit code

    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken: resetCode.toString(),
        resetTokenExpiry: tokenExpiry,
      },
    });

    await sendMail({
      to: normalizedEmail,
      subject: "Your Password Reset Code",
      html: `
    <p>Hello ${user.firstName || "User"},</p>
    <p>Your password reset code is:</p>
    <h2 style="color:#007bff">${resetCode}</h2>
    <p>This code will expire in 10 minutes.</p>
  `,
    });

    return res.json({
      success: true,
      message: "Password reset instructions sent to email.",
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
    console.log("Looking for employeeId:", employeeId);
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
      fullName,
      department,
      phoneNumber,
      lastKnownEmail,
      reason,
      additionalInfo,
    } = req.body;
    if (!fullName || !department || !phoneNumber || !reason) {
      return res
        .status(400)
        .json({ success: false, message: "Missing required fields" });
    }
    // Simulate sending admin contact request
    console.log("Admin contact request:", req.body);
    res.json({ success: true, message: "Admin contact request submitted" });
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
      },
    });
    res.json({
      success: true,
      message: "Password has been reset successfully.",
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