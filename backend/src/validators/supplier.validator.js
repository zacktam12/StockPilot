const Joi = require("joi");

// Enhanced supplier schema with better validation
const supplierSchema = Joi.object({
  name: Joi.string()
    .trim()
    .min(2)
    .max(100)
    .pattern(/^[a-zA-Z0-9\s\-&.,()]+$/)
    .required()
    .messages({
      'string.pattern.base': 'Name can only contain letters, numbers, spaces, and basic punctuation',
      'string.min': 'Name must be at least 2 characters long',
      'string.max': 'Name cannot exceed 100 characters'
    }),
  contactName: Joi.string()
    .trim()
    .max(100)
    .pattern(/^[a-zA-Z\s\-'.]+$/)
    .allow(null, "")
    .messages({
      'string.pattern.base': 'Contact name can only contain letters, spaces, hyphens, apostrophes, and periods'
    }),
  email: Joi.string()
    .trim()
    .email({ tlds: { allow: false } })
    .max(255)
    .allow(null, "")
    .messages({
      'string.email': 'Please provide a valid email address'
    }),
  phone: Joi.string()
    .trim()
    .pattern(/^[\+]?[1-9][\d]{0,15}$/)
    .max(30)
    .allow(null, "")
    .messages({
      'string.pattern.base': 'Please provide a valid phone number'
    }),
  address: Joi.string()
    .trim()
    .max(255)
    .allow(null, "")
    .messages({
      'string.max': 'Address cannot exceed 255 characters'
    }),
  companyName: Joi.string()
    .trim()
    .max(100)
    .pattern(/^[a-zA-Z0-9\s\-&.,()]+$/)
    .allow(null, "")
    .messages({
      'string.pattern.base': 'Company name can only contain letters, numbers, spaces, and basic punctuation'
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
    } else {
      sanitized[key] = value;
    }
  }
  return sanitized;
};

const validateCreateSupplier = (req, res, next) => {
  try {
    // Sanitize input first
    req.body = sanitizeInput(req.body);
    
    const { error, value } = supplierSchema.validate(req.body, { 
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
    console.error('Validation error:', err);
    return res.status(500).json({
      success: false,
      message: "Internal validation error",
    });
  }
};

const validateUpdateSupplier = (req, res, next) => {
  try {
    // Sanitize input first
    req.body = sanitizeInput(req.body);
    
    const { error, value } = supplierSchema.validate(req.body, { 
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
    console.error('Validation error:', err);
    return res.status(500).json({
      success: false,
      message: "Internal validation error",
    });
  }
};

// Validate supplier ID parameter
const validateSupplierId = (req, res, next) => {
  const { id } = req.params;
  
  // UUID format validation (consistent with other validators)
  if (!id || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
    return res.status(400).json({
      success: false,
      message: "Invalid supplier ID",
    });
  }
  
  next();
};

module.exports = {
  validateCreateSupplier,
  validateUpdateSupplier,
  validateSupplierId,
};
