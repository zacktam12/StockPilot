const Joi = require("joi");

// Enhanced customer validation schema with comprehensive validation
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
      'string.max': 'Name cannot exceed 100 characters'
    }),
  
  email: Joi.string()
    .trim()
    .email({ tlds: { allow: false } })
    .max(255)
    .allow(null, "")
    .messages({
      'string.email': 'Please enter a valid email address',
      'string.max': 'Email cannot exceed 255 characters'
    }),
  
  phone: Joi.string()
    .trim()
    .pattern(/^[\+]?[1-9][\d]{0,15}$/)
    .max(20)
    .allow(null, "")
    .messages({
      'string.pattern.base': 'Please enter a valid phone number (international format supported)',
      'string.max': 'Phone number cannot exceed 20 characters'
    }),
  
  address: Joi.string()
    .trim()
    .max(500)
    .allow(null, "")
    .messages({
      'string.max': 'Address cannot exceed 500 characters'
    }),
  
  company: Joi.string()
    .trim()
    .max(100)
    .allow(null, "")
    .messages({
      'string.max': 'Company name cannot exceed 100 characters'
    }),
  
  city: Joi.string()
    .trim()
    .max(50)
    .allow(null, "")
    .messages({
      'string.max': 'City name cannot exceed 50 characters'
    }),
  
  state: Joi.string()
    .trim()
    .max(50)
    .allow(null, "")
    .messages({
      'string.max': 'State name cannot exceed 50 characters'
    }),
  
  zipCode: Joi.string()
    .trim()
    .pattern(/^[0-9]{5}(-[0-9]{4})?$/)
    .allow(null, "")
    .messages({
      'string.pattern.base': 'ZIP code must be in format 12345 or 12345-6789'
    }),
  
  country: Joi.string()
    .trim()
    .max(50)
    .allow(null, "")
    .messages({
      'string.max': 'Country name cannot exceed 50 characters'
    }),
  
  status: Joi.string()
    .valid('active', 'inactive', 'blocked')
    .default('active'),
  
  customerType: Joi.string()
    .valid('individual', 'business', 'wholesale')
    .default('individual'),
  
  creditLimit: Joi.number()
    .min(0)
    .max(999999.99)
    .precision(2)
    .allow(null, "")
    .messages({
      'number.min': 'Credit limit cannot be negative',
      'number.max': 'Credit limit cannot exceed $999,999.99'
    }),
  
  taxId: Joi.string()
    .trim()
    .pattern(/^[0-9\-]+$/)
    .max(20)
    .allow(null, "")
    .messages({
      'string.pattern.base': 'Tax ID can only contain numbers and hyphens'
    }),
  
  dateOfBirth: Joi.date()
    .max('now')
    .allow(null, "")
    .messages({
      'date.max': 'Date of birth cannot be in the future'
    }),
  
  notes: Joi.string()
    .trim()
    .max(1000)
    .allow(null, "")
    .messages({
      'string.max': 'Notes cannot exceed 1000 characters'
    }),
  
  tags: Joi.array()
    .items(Joi.string().trim().max(50))
    .max(10)
    .allow(null, [])
    .messages({
      'array.max': 'Cannot have more than 10 tags'
    }),
  
  preferences: Joi.object({
    newsletter: Joi.boolean().default(false),
    smsNotifications: Joi.boolean().default(false),
    emailNotifications: Joi.boolean().default(true),
    preferredContactMethod: Joi.string().valid('email', 'phone', 'sms').default('email')
  }).allow(null)
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
    console.error('Customer validation error:', err);
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
    if (!email) return next();
    
    const { PrismaClient } = require("@prisma/client");
    const prisma = new PrismaClient();
    
    const existingCustomer = await prisma.customer.findFirst({
      where: { 
        email: email.toLowerCase(),
        isDeleted: false
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
    console.error('Email validation error:', error);
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
