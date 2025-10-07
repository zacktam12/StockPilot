const Joi = require("joi");

// Enhanced schema for creating a purchase
const createPurchaseSchema = Joi.object({
  userId: Joi.string()
    .uuid()
    .optional()
    .messages({
      'string.guid': 'User ID must be a valid UUID'
    }),
  
  supplierId: Joi.string()
    .uuid()
    .required()
    .messages({
      'string.guid': 'Supplier ID must be a valid UUID',
      'any.required': 'Supplier ID is required'
    }),
  
  totalCost: Joi.number()
    .precision(2)
    .min(0)
    .max(999999.99)
    .optional()
    .messages({
      'number.min': 'Total cost cannot be negative',
      'number.max': 'Total cost cannot exceed $999,999.99'
    }),
  
  discount: Joi.number()
    .precision(2)
    .min(0)
    .max(999999.99)
    .optional()
    .messages({
      'number.min': 'Discount cannot be negative',
      'number.max': 'Discount cannot exceed $999,999.99'
    }),
  
  tax: Joi.number()
    .precision(2)
    .min(0)
    .max(999999.99)
    .optional()
    .messages({
      'number.min': 'Tax cannot be negative',
      'number.max': 'Tax cannot exceed $999,999.99'
    }),
  
  status: Joi.string()
    .valid('pending', 'received', 'cancelled', 'partially_received', 'on_hold')
    .default('pending')
    .messages({
      'any.only': 'Status must be one of: pending, received, cancelled, partially_received, on_hold'
    }),
  
  notes: Joi.string()
    .trim()
    .max(1000)
    .allow("", null)
    .messages({
      'string.max': 'Notes cannot exceed 1000 characters'
    }),
  
  poNumber: Joi.string()
    .trim()
    .max(50)
    .optional()
    .messages({
      'string.max': 'PO number cannot exceed 50 characters'
    }),
  
  items: Joi.array()
    .items(
      Joi.object({
        productId: Joi.string()
          .uuid()
          .required()
          .messages({
            'string.guid': 'Product ID must be a valid UUID',
            'any.required': 'Product ID is required'
          }),
        
        purchase_price: Joi.number()
          .precision(2)
          .positive()
          .max(999999.99)
          .required()
          .messages({
            'number.positive': 'Purchase price must be positive',
            'number.max': 'Purchase price cannot exceed $999,999.99',
            'any.required': 'Purchase price is required'
          }),
        
        purchase_quantity: Joi.number()
          .integer()
          .positive()
          .max(9999)
          .required()
          .messages({
            'number.positive': 'Purchase quantity must be positive',
            'number.max': 'Purchase quantity cannot exceed 9999',
            'any.required': 'Purchase quantity is required'
          }),
        
        received_quantity: Joi.number()
          .integer()
          .min(0)
          .max(9999)
          .default(0)
          .messages({
            'number.min': 'Received quantity cannot be negative',
            'number.max': 'Received quantity cannot exceed 9999'
          }),
        
        notes: Joi.string()
          .trim()
          .max(500)
          .optional()
          .messages({
            'string.max': 'Item notes cannot exceed 500 characters'
          })
      })
    )
    .min(1)
    .max(100)
    .required()
    .messages({
      'array.min': 'At least one item is required',
      'array.max': 'Cannot have more than 100 items in a single purchase'
    })
});

// Update schema with same validation as create but all fields optional
const updatePurchaseSchema = createPurchaseSchema.fork(
  Object.keys(createPurchaseSchema.describe().keys),
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

const validateCreatePurchase = (req, res, next) => {
  try {
    // Sanitize input first
    req.body = sanitizeInput(req.body);
    
    const { error, value } = createPurchaseSchema.validate(req.body, { 
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
    console.error('Purchase validation error:', err);
    return res.status(500).json({
      success: false,
      message: "Internal validation error",
    });
  }
};

const validateUpdatePurchase = (req, res, next) => {
  try {
    // Sanitize input first
    req.body = sanitizeInput(req.body);
    
    // Remove id from body if present to avoid Joi validation error
    if ("id" in req.body) {
      delete req.body.id;
    }
    
    const { error, value } = updatePurchaseSchema.validate(req.body, { 
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
    console.error('Purchase validation error:', err);
    return res.status(500).json({
      success: false,
      message: "Internal validation error",
    });
  }
};

// Validate purchase ID parameter
const validatePurchaseId = (req, res, next) => {
  const { id } = req.params;
  
  if (!id || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
    return res.status(400).json({
      success: false,
      message: "Invalid purchase ID",
    });
  }
  
  next();
};

// Validate purchase items
const validatePurchaseItems = (req, res, next) => {
  try {
    const { items } = req.body;
    
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "At least one item is required for a purchase",
      });
    }
    
    // Check for duplicate products
    const productIds = items.map(item => item.productId);
    const uniqueProductIds = [...new Set(productIds)];
    
    if (productIds.length !== uniqueProductIds.length) {
      return res.status(400).json({
        success: false,
        message: "Duplicate products are not allowed in the same purchase",
      });
    }
    
    next();
  } catch (error) {
    console.error('Purchase items validation error:', error);
    return res.status(500).json({
      success: false,
      message: "Internal validation error",
    });
  }
};

module.exports = {
  validateCreatePurchase,
  validateUpdatePurchase,
  validatePurchaseId,
  validatePurchaseItems,
};
