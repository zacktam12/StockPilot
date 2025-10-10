const Joi = require("joi");

// Enhanced validation for creating a sale
const createSaleSchema = Joi.object({
  userId: Joi.string()
    .uuid()
    .optional()
    .messages({
      'string.guid': 'User ID must be a valid UUID'
    }),
  
  customerId: Joi.string()
    .uuid()
    .optional()
    .allow(null, "")
    .messages({
      'string.guid': 'Customer ID must be a valid UUID'
    }),
  
  customer_id: Joi.string()
    .uuid()
    .optional()
    .allow(null, "")
    .messages({
      'string.guid': 'Customer ID must be a valid UUID'
    }),
  
  totalPrice: Joi.number()
    .precision(2)
    .min(0)
    .max(999999.99)
    .optional()
    .messages({
      'number.min': 'Total price cannot be negative',
      'number.max': 'Total price cannot exceed $999,999.99'
    }),
  
  items: Joi.array()
    .items(
      Joi.object({
        product_id: Joi.string()
          .uuid()
          .required()
          .messages({
            'string.guid': 'Product ID must be a valid UUID',
            'any.required': 'Product ID is required'
          }),
        
        quantity: Joi.number()
          .integer()
          .positive()
          .max(9999)
          .required()
          .messages({
            'number.positive': 'Quantity must be a positive number',
            'number.max': 'Quantity cannot exceed 9999',
            'any.required': 'Quantity is required'
          }),
        
        price: Joi.number()
          .precision(2)
          .positive()
          .max(999999.99)
          .required()
          .messages({
            'number.positive': 'Price must be a positive number',
            'number.max': 'Price cannot exceed $999,999.99',
            'any.required': 'Price is required'
          }),
        
        discount: Joi.number()
          .precision(2)
          .min(0)
          .max(100)
          .optional()
          .messages({
            'number.min': 'Discount cannot be negative',
            'number.max': 'Discount cannot exceed 100%'
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
      'array.max': 'Cannot have more than 100 items in a single sale'
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
  
  discountPercentage: Joi.number()
    .precision(2)
    .min(0)
    .max(100)
    .optional()
    .messages({
      'number.min': 'Discount percentage cannot be negative',
      'number.max': 'Discount percentage cannot exceed 100%'
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
  
  taxPercentage: Joi.number()
    .precision(2)
    .min(0)
    .max(50)
    .optional()
    .messages({
      'number.min': 'Tax percentage cannot be negative',
      'number.max': 'Tax percentage cannot exceed 50%'
    }),
  
  paymentMethod: Joi.string()
    .valid('cash', 'card', 'check', 'bank_transfer', 'digital_wallet', 'store_credit')
    .optional()
    .messages({
      'any.only': 'Payment method must be one of: cash, card, check, bank_transfer, digital_wallet, store_credit'
    }),
  
  status: Joi.string()
    .valid('completed', 'pending', 'cancelled', 'refunded', 'partially_refunded')
    .default('completed')
    .messages({
      'any.only': 'Status must be one of: completed, pending, cancelled, refunded, partially_refunded'
    }),
  
  notes: Joi.string()
    .trim()
    .max(1000)
    .optional()
    .messages({
      'string.max': 'Notes cannot exceed 1000 characters'
    }),
  
  orderNumber: Joi.string()
    .trim()
    .max(50)
    .optional()
    .messages({
      'string.max': 'Order number cannot exceed 50 characters'
    }),
  
  shippingAddress: Joi.object({
    street: Joi.string().trim().max(200).optional(),
    city: Joi.string().trim().max(50).optional(),
    state: Joi.string().trim().max(50).optional(),
    zipCode: Joi.string().trim().max(20).optional(),
    country: Joi.string().trim().max(50).optional()
  }).optional(),
  
  deliveryDate: Joi.date()
    .min('now')
    .optional()
    .messages({
      'date.min': 'Delivery date cannot be in the past'
    }),
  
  tags: Joi.array()
    .items(Joi.string().trim().max(50))
    .max(10)
    .optional()
    .messages({
      'array.max': 'Cannot have more than 10 tags'
    })
});

// Update schema with same validation as create but all fields optional
const updateSaleSchema = createSaleSchema.fork(
  Object.keys(createSaleSchema.describe().keys),
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

const validateCreateSale = (req, res, next) => {
  try {
    // Sanitize input first
    req.body = sanitizeInput(req.body);
    
    const { error, value } = createSaleSchema.validate(req.body, { 
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

const validateUpdateSale = (req, res, next) => {
  try {
    // Sanitize input first
    req.body = sanitizeInput(req.body);
    
    // Remove id from body if present to avoid Joi validation error
    if ("id" in req.body) {
      delete req.body.id;
    }
    
    const { error, value } = updateSaleSchema.validate(req.body, { 
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

// Validate sale ID parameter
const validateSaleId = (req, res, next) => {
  const { id } = req.params;
  
  if (!id || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
    return res.status(400).json({
      success: false,
      message: "Invalid sale ID",
    });
  }
  
  next();
};

// Validate sale items
const validateSaleItems = (req, res, next) => {
  try {
    const { items } = req.body;
    
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "At least one item is required for a sale",
      });
    }
    
    // Check for duplicate products
    const productIds = items.map(item => item.product_id);
    const uniqueProductIds = [...new Set(productIds)];
    
    if (productIds.length !== uniqueProductIds.length) {
      return res.status(400).json({
        success: false,
        message: "Duplicate products are not allowed in the same sale",
      });
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
  validateCreateSale,
  validateUpdateSale,
  validateSaleId,
  validateSaleItems,
};
