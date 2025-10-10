const Joi = require("joi");

const registerSchema = Joi.object({
  email: Joi.string()
    .email()
    .max(255)
    .required()
    .messages({
      'string.email': 'Please enter a valid email address',
      'string.max': 'Email cannot exceed 255 characters',
      'any.required': 'Email is required'
    }),
  
  password: Joi.string()
    .min(8)
    .max(128)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .required()
    .messages({
      'string.min': 'Password must be at least 8 characters long',
      'string.max': 'Password cannot exceed 128 characters',
      'string.pattern.base': 'Password must contain at least one lowercase letter, one uppercase letter, one number, and one special character',
      'any.required': 'Password is required'
    }),
  
  firstName: Joi.string()
    .trim()
    .min(2)
    .max(50)
    .pattern(/^[a-zA-Z\s\-'.]+$/)
    .required()
    .messages({
      'string.min': 'First name must be at least 2 characters long',
      'string.max': 'First name cannot exceed 50 characters',
      'string.pattern.base': 'First name can only contain letters, spaces, hyphens, apostrophes, and periods',
      'any.required': 'First name is required'
    }),
  
  lastName: Joi.string()
    .trim()
    .min(2)
    .max(50)
    .pattern(/^[a-zA-Z\s\-'.]+$/)
    .required()
    .messages({
      'string.min': 'Last name must be at least 2 characters long',
      'string.max': 'Last name cannot exceed 50 characters',
      'string.pattern.base': 'Last name can only contain letters, spaces, hyphens, apostrophes, and periods',
      'any.required': 'Last name is required'
    }),
  
  phone: Joi.string()
    .trim()
    .pattern(/^[+]?[\d\s\-\(\)]{10,20}$/)
    .allow("", null)
    .messages({
      'string.pattern.base': 'Phone number must be between 10-20 characters and contain only digits, spaces, hyphens, parentheses, and optional + prefix'
    }),
  
  employeeId: Joi.string()
    .trim()
    .max(20)
    .pattern(/^[A-Z0-9\-_]+$/)
    .optional()
    .messages({
      'string.pattern.base': 'Employee ID can only contain uppercase letters, numbers, hyphens, and underscores',
      'string.max': 'Employee ID cannot exceed 20 characters'
    }),
  
  roleId: Joi.string()
    .uuid()
    .required()
    .messages({
      'string.guid': 'Role ID must be a valid UUID',
      'any.required': 'Role is required'
    }),
  
  status: Joi.string()
    .valid('Active', 'Inactive', 'Deactivated', 'Banned')
    .default('Active')
    .messages({
      'any.only': 'Status must be one of: Active, Inactive, Deactivated, Banned'
    })
  
  // Removed fields that don't exist in Prisma schema:
  // - department
  // - position
  // - hireDate
  // - salary
  // - address
  // - emergencyContact
  // - notes
  // - permissions
  
  // Removed fields that don't exist in Prisma schema:
  // - isEmailVerified
  // - emailVerificationToken  
  // - passwordResetToken (use resetToken instead)
  // - passwordResetExpires (use resetTokenExpiry instead)
  // - twoFactorEnabled
  // - twoFactorSecret
  // These fields were causing Prisma validation errors
});

const loginSchema = Joi.object({
  email: Joi.string()
    .email()
    .required()
    .messages({
      'string.email': 'Please enter a valid email address',
      'any.required': 'Email is required'
    }),
  
  password: Joi.string()
    .required()
    .messages({
      'any.required': 'Password is required'
    }),
  
  rememberMe: Joi.boolean()
    .optional()
    .default(false),
  
  twoFactorCode: Joi.string()
    .length(6)
    .pattern(/^\d{6}$/)
    .optional()
    .messages({
      'string.length': 'Two-factor code must be 6 digits',
      'string.pattern.base': 'Two-factor code must contain only digits'
    })
});

// Update schema - email not editable, password and roleId optional
const updateUserSchema = registerSchema.fork(
  ['email', 'password', 'roleId'], // Make email, password and roleId optional for updates
  (schema) => schema.optional()
);

// Password reset schema
const passwordResetSchema = Joi.object({
  email: Joi.string()
    .email()
    .required()
    .messages({
      'string.email': 'Please enter a valid email address',
      'any.required': 'Email is required'
    })
});

const passwordUpdateSchema = Joi.object({
  currentPassword: Joi.string()
    .required()
    .messages({
      'any.required': 'Current password is required'
    }),
  
  newPassword: Joi.string()
    .min(8)
    .max(128)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .required()
    .messages({
      'string.min': 'New password must be at least 8 characters long',
      'string.max': 'New password cannot exceed 128 characters',
      'string.pattern.base': 'New password must contain at least one lowercase letter, one uppercase letter, one number, and one special character',
      'any.required': 'New password is required'
    }),
  
  confirmPassword: Joi.string()
    .valid(Joi.ref('newPassword'))
    .required()
    .messages({
      'any.only': 'Confirm password must match new password',
      'any.required': 'Confirm password is required'
    })
});

// Input sanitization function
const sanitizeInput = (data) => {
  const sanitized = {};
  for (const [key, value] of Object.entries(data)) {
    if (typeof value === 'string') {
      // Remove potential XSS attempts and normalize whitespace
      sanitized[key] = value
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/javascript:/gi, '')
        .replace(/on\w+\s*=/gi, '')
        .trim()
        .replace(/\s+/g, ' ');
    } else if (Array.isArray(value)) {
      // Sanitize array items
      sanitized[key] = value.map(item => 
        typeof item === 'string' 
          ? item.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
                .replace(/javascript:/gi, '')
                .replace(/on\w+\s*=/gi, '')
                .trim()
          : typeof item === 'object' && item !== null
            ? sanitizeInput(item)
            : item
      );
    } else if (typeof value === 'object' && value !== null) {
      // Sanitize object properties
      sanitized[key] = sanitizeInput(value);
    } else {
      sanitized[key] = value;
    }
  }
  return sanitized;
};

const validateRegister = (req, res, next) => {
  try {
    // Sanitize input first
    req.body = sanitizeInput(req.body);
    
    const { error, value } = registerSchema.validate(req.body, { 
      abortEarly: false,
      stripUnknown: true 
    });
    
    if (error) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: error.details.map((d) => ({
          field: d.path.join('.'),
          message: d.message
        })),
      });
    }
    
    // Replace req.body with validated and sanitized data
    req.body = value;
    next();
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Internal validation error",
    });
  }
};

const validateLogin = (req, res, next) => {
  try {
    // Sanitize input first
    req.body = sanitizeInput(req.body);
    
    const { error, value } = loginSchema.validate(req.body, { 
      abortEarly: false,
      stripUnknown: true 
    });
    
    if (error) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: error.details.map((d) => ({
          field: d.path.join('.'),
          message: d.message
        })),
      });
    }
    
    // Replace req.body with validated and sanitized data
    req.body = value;
    next();
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Internal validation error",
    });
  }
};

const validateUpdateUser = (req, res, next) => {
  try {
    
    // Sanitize input first
    req.body = sanitizeInput(req.body);
    
    // Remove id from body if present to avoid Joi validation error
    if ("id" in req.body) {
      delete req.body.id;
    }
    
    const { error, value } = updateUserSchema.validate(req.body, { 
      presence: "optional",
      abortEarly: false,
      stripUnknown: true 
    });
    
    if (error) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: error.details.map((d) => ({
          field: d.path.join('.'),
          message: d.message
        })),
      });
    }
    
    // Replace req.body with validated and sanitized data
    req.body = value;
    next();
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Internal validation error",
    });
  }
};

const validatePasswordReset = (req, res, next) => {
  try {
    const { error, value } = passwordResetSchema.validate(req.body, { 
      abortEarly: false,
      stripUnknown: true 
    });
    
    if (error) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: error.details.map((d) => ({
          field: d.path.join('.'),
          message: d.message
        })),
      });
    }
    
    req.body = value;
    next();
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Internal validation error",
    });
  }
};

const validatePasswordUpdate = (req, res, next) => {
  try {
    const { error, value } = passwordUpdateSchema.validate(req.body, { 
      abortEarly: false,
      stripUnknown: true 
    });
    
    if (error) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: error.details.map((d) => ({
          field: d.path.join('.'),
          message: d.message
        })),
      });
    }
    
    req.body = value;
    next();
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Internal validation error",
    });
  }
};

// Validate user ID parameter
const validateUserId = (req, res, next) => {
  const { id } = req.params;
  
  if (!id || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
    return res.status(400).json({
      success: false,
      message: "Invalid user ID",
    });
  }
  
  next();
};

// Validate email uniqueness
const validateEmailUniqueness = async (req, res, next) => {
  try {
    const { email } = req.body;
    const { id } = req.params; // For updates, exclude current user
    
    if (email) {
      const userRepository = require("../repositories/user.repository");
      const existingUser = await userRepository.findByEmail(email);
      
      if (existingUser && (!id || existingUser.id !== id)) {
        return res.status(409).json({
          success: false,
          message: "Email already exists",
          field: "email"
        });
      }
    }
    
    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal validation error",
    });
  }
};

// Validate employee ID uniqueness
const validateEmployeeIdUniqueness = async (req, res, next) => {
  try {
    const { employeeId } = req.body;
    const { id } = req.params; // For updates, exclude current user
    
    if (employeeId) {
      const userRepository = require("../repositories/user.repository");
      const existingUser = await userRepository.findByEmployeeId(employeeId);
      
      if (existingUser && (!id || existingUser.id !== id)) {
        return res.status(409).json({
          success: false,
          message: "Employee ID already exists",
          field: "employeeId"
        });
      }
    }
    
    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal validation error",
    });
  }
};

module.exports = {
  validateRegister,
  validateLogin,
  validateUpdateUser,
  validatePasswordReset,
  validatePasswordUpdate,
  validateUserId,
  validateEmailUniqueness,
  validateEmployeeIdUniqueness,
};
