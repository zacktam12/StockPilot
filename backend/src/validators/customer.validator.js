const Joi = require("joi");

// Customer validation schema matching the Prisma database schema
// Database fields: id, name, email, phone, address, createdAt
const createCustomerSchema = Joi.object({
  name: Joi.string()
    .trim()
    .min(2)
    .max(100)
    .pattern(/^[a-zA-Z\s\-'.]+$/)
    .required()
    .messages({
      'string.pattern.base': 'Name can only contain letters, spaces, hyphens, apostrophes, and periods',
      'string.min': 'Name must be at least 2 characters long',
      'string.max': 'Name cannot exceed 100 characters',
      'any.required': 'Name is required'
    }),
  
  email: Joi.string()
    .trim()
    .email({ tlds: { allow: false } })
    .max(255)
    .required()
    .messages({
      'string.email': 'Please enter a valid email address',
      'string.max': 'Email cannot exceed 255 characters',
      'any.required': 'Email is required'
    }),
  
  phone: Joi.string()
    .trim()
    .pattern(/^[\+]?[1-9][\d]{0,15}$/)
    .max(20)
    .allow(null, "")
    .optional()
    .messages({
      'string.pattern.base': 'Please enter a valid phone number (international format supported)',
      'string.max': 'Phone number cannot exceed 20 characters'
    }),
  
  address: Joi.string()
    .trim()
    .max(500)
    .allow(null, "")
    .optional()
    .messages({
      'string.max': 'Address cannot exceed 500 characters'
    })
});

// Update schema with same validation as create but all fields optional
const updateCustomerSchema = createCustomerSchema.fork(
  Object.keys(createCustomerSchema.describe().keys),
  (schema) => schema.optional()
);

// Input sanitization function
const sanitizeInput = (data) => {
  const sanitized = {};
  for (const [key, value] of Object.entries(data)) {
    if (typeof value === 'string') {
      // Remove potential XSS attempts and normalize whitespace
      let sanitizedValue = value
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/javascript:/gi, '')
        .replace(/on\w+\s*=/gi, '')
        .trim()
        .replace(/\s+/g, ' ');
      
      // Convert email to lowercase for consistent storage
      if (key === 'email') {
        sanitizedValue = sanitizedValue.toLowerCase();
      }
      
      sanitized[key] = sanitizedValue;
    } else if (Array.isArray(value)) {
      // Sanitize array items
      sanitized[key] = value.map(item => 
        typeof item === 'string' 
          ? item.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
                .replace(/javascript:/gi, '')
                .replace(/on\w+\s*=/gi, '')
                .trim()
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

const validateCreateCustomer = (req, res, next) => {
  try {
    // Sanitize input first
    req.body = sanitizeInput(req.body);
    
    const { error, value } = createCustomerSchema.validate(req.body, { 
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

const validateUpdateCustomer = (req, res, next) => {
  try {
    // Sanitize input first
    req.body = sanitizeInput(req.body);
    
    // Remove id from body if present to avoid Joi validation error
    if ("id" in req.body) {
      delete req.body.id;
    }
    
    const { error, value } = updateCustomerSchema.validate(req.body, { 
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
    console.error('Customer validation error:', err);
    return res.status(500).json({
      success: false,
      message: "Internal validation error",
    });
  }
};

// Validate customer ID parameter
const validateCustomerId = (req, res, next) => {
  const { id } = req.params;
  
  if (!id || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
    return res.status(400).json({
      success: false,
      message: "Invalid customer ID",
    });
  }
  
  next();
};

// Validate email uniqueness
const validateEmailUniqueness = async (req, res, next) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return next();
    }
    
    const { PrismaClient } = require("@prisma/client");
    const prisma = new PrismaClient();
    
    const existingCustomer = await prisma.customer.findFirst({
      where: { 
        email: email.toLowerCase()
      }
    });
    
    if (existingCustomer && existingCustomer.id !== req.params.id) {
      return res.status(409).json({
        success: false,
        message: "Email already exists",
        field: "email"
      });
    }
    
    await prisma.$disconnect();
    next();
  } catch (error) {
    next();
  }
};

module.exports = {
  createCustomerSchema,
  updateCustomerSchema,
  validateCreateCustomer,
  validateUpdateCustomer,
  validateCustomerId,
  validateEmailUniqueness,
};
