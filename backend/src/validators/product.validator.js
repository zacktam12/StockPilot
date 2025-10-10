const Joi = require("joi");

// Enhanced product validation schema with comprehensive validation
const createProductSchema = Joi.object({
  name: Joi.string()
    .trim()
    .min(2)
    .max(100)
    .pattern(/^[a-zA-Z0-9\s\-&.,()]+$/)
    .required()
    .messages({
      'string.pattern.base': 'Product name can only contain letters, numbers, spaces, and basic punctuation',
      'string.min': 'Product name must be at least 2 characters long',
      'string.max': 'Product name cannot exceed 100 characters'
    }),
  
  description: Joi.string()
    .trim()
    .max(1000)
    .allow(null).allow("")
    .messages({
      'string.max': 'Description cannot exceed 1000 characters'
    }),
  
  sku: Joi.string()
    .trim()
    .max(50)
    .pattern(/^[A-Z0-9\-_]+$/)
    .allow(null).allow("")
    .messages({
      'string.pattern.base': 'SKU can only contain uppercase letters, numbers, hyphens, and underscores'
    }),
  
  barcode: Joi.string()
    .trim()
    .max(50)
    .pattern(/^[0-9]+$/)
    .allow(null).allow("")
    .messages({
      'string.pattern.base': 'Barcode can only contain numbers'
    }),
  
  price: Joi.number()
    .min(0.01)
    .max(999999.99)
    .precision(2)
    .required()
    .messages({
      'number.min': 'Price must be at least $0.01',
      'number.max': 'Price cannot exceed $999,999.99'
    }),
  
  cost: Joi.number()
    .min(0)
    .max(999999.99)
    .precision(2)
    .allow(null).allow("")
    .messages({
      'number.min': 'Cost cannot be negative',
      'number.max': 'Cost cannot exceed $999,999.99'
    }),
  
  quantity: Joi.number()
    .integer()
    .min(0)
    .max(999999)
    .default(0)
    .messages({
      'number.min': 'Quantity cannot be negative',
      'number.max': 'Quantity cannot exceed 999,999'
    }),
  
  minStock: Joi.number()
    .integer()
    .min(0)
    .max(999999)
    .allow(null).allow("")
    .messages({
      'number.min': 'Minimum stock cannot be negative',
      'number.max': 'Minimum stock cannot exceed 999,999'
    }),
  
  maxStock: Joi.number()
    .integer()
    .min(0)
    .max(999999)
    .allow(null).allow("")
    .messages({
      'number.min': 'Maximum stock cannot be negative',
      'number.max': 'Maximum stock cannot exceed 999,999'
    }),
  
  categoryId: Joi.string()
    .uuid()
    .required()
    .messages({
      'string.guid': 'Category ID must be a valid UUID'
    }),
  
  image: Joi.string()
    .uri()
    .allow(null).allow("")
    .messages({
      'string.uri': 'Image must be a valid URL'
    }),
  
  image_url: Joi.string()
    .uri()
    .allow(null).allow("")
    .messages({
      'string.uri': 'Image URL must be a valid URL'
    }),
  
  status: Joi.string()
    .valid('active', 'inactive', 'discontinued')
    .default('active'),
  
  weight: Joi.number()
    .min(0)
    .max(999.99)
    .precision(2)
    .allow(null).allow("")
    .messages({
      'number.min': 'Weight cannot be negative',
      'number.max': 'Weight cannot exceed 999.99'
    }),
  
  dimensions: Joi.object({
    length: Joi.number().min(0).max(999.99).precision(2),
    width: Joi.number().min(0).max(999.99).precision(2),
    height: Joi.number().min(0).max(999.99).precision(2)
  }).allow(null),
  
  tags: Joi.array()
    .items(Joi.string().trim().max(50))
    .max(10)
    .allow(null)
    .optional()
    .messages({
      'array.max': 'Cannot have more than 10 tags'
    }),
  
  notes: Joi.string()
    .trim()
    .max(500)
    .allow(null)
    .allow("")
    .messages({
      'string.max': 'Notes cannot exceed 500 characters'
    }),
  
  // Add snake_case field names for frontend compatibility
  min_stock: Joi.number()
    .integer()
    .min(0)
    .max(999999)
    .allow(null).allow("")
    .messages({
      'number.min': 'Minimum stock cannot be negative',
      'number.max': 'Minimum stock cannot exceed 999,999'
    }),
  
  max_stock: Joi.number()
    .integer()
    .min(0)
    .max(999999)
    .allow(null).allow("")
    .messages({
      'number.min': 'Maximum stock cannot be negative',
      'number.max': 'Maximum stock cannot exceed 999,999'
    }),
  
  category_id: Joi.string()
    .uuid()
    .allow(null).allow("")
    .messages({
      'string.guid': 'Category ID must be a valid UUID'
    })
});

// Update schema with same validation as create but all fields optional
// Also include snake_case field names for frontend compatibility
const updateProductSchema = createProductSchema.fork(
  Object.keys(createProductSchema.describe().keys),
  (schema) => schema.optional()
).keys({
  // Add snake_case field names for frontend compatibility
  min_stock: Joi.number()
    .integer()
    .min(0)
    .max(999999)
    .allow(null).allow("")
    .messages({
      'number.min': 'Minimum stock cannot be negative',
      'number.max': 'Minimum stock cannot exceed 999,999'
    }),
  
  max_stock: Joi.number()
    .integer()
    .min(0)
    .max(999999)
    .allow(null).allow("")
    .messages({
      'number.min': 'Maximum stock cannot be negative',
      'number.max': 'Maximum stock cannot exceed 999,999'
    }),
  
  category_id: Joi.string()
    .uuid()
    .allow(null).allow("")
    .messages({
      'string.guid': 'Category ID must be a valid UUID'
    }),
  
  image_url: Joi.string()
    .uri()
    .allow(null).allow("")
    .messages({
      'string.uri': 'Image URL must be a valid URL'
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

const validateCreateProduct = (req, res, next) => {
  try {
    // Sanitize input first
    req.body = sanitizeInput(req.body);
    
    const { error, value } = createProductSchema.validate(req.body, { 
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

const validateUpdateProduct = (req, res, next) => {
  try {
    // Sanitize input first
    req.body = sanitizeInput(req.body);
    
    // Remove id from body if present to avoid Joi validation error
    if ("id" in req.body) {
      delete req.body.id;
    }
    
    const { error, value } = updateProductSchema.validate(req.body, { 
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

// Validate product ID parameter
const validateProductId = (req, res, next) => {
  const { id } = req.params;
  
  if (!id || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
    return res.status(400).json({
      success: false,
      message: "Invalid product ID",
    });
  }
  
  next();
};

// Validate SKU uniqueness
const validateSKUUniqueness = async (req, res, next) => {
  try {
    const { sku } = req.body;
    if (!sku) return next();
    
    const { PrismaClient } = require("@prisma/client");
    const prisma = new PrismaClient();
    
    const existingProduct = await prisma.product.findFirst({
      where: { 
        sku: sku.toUpperCase(),
        isDeleted: false
      }
    });
    
    if (existingProduct && existingProduct.id !== req.params.id) {
      return res.status(409).json({
        success: false,
        message: "SKU already exists",
        field: "sku"
      });
    }
    
    await prisma.$disconnect();
    next();
  } catch (error) {
    next();
  }
};

module.exports = {
  validateCreateProduct,
  validateUpdateProduct,
  validateProductId,
  validateSKUUniqueness,
};
