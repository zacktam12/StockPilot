const Joi = require("joi");

// Enhanced schema for creating a category
const createCategorySchema = Joi.object({
  name: Joi.string()
    .trim()
    .min(2)
    .max(100)
    .pattern(/^[a-zA-Z0-9\s\-_&().]+$/)
    .required()
    .messages({
      'string.min': 'Category name must be at least 2 characters long',
      'string.max': 'Category name cannot exceed 100 characters',
      'string.pattern.base': 'Category name can only contain letters, numbers, spaces, hyphens, underscores, ampersands, parentheses, and periods',
      'any.required': 'Category name is required'
    }),
  
  description: Joi.string()
    .trim()
    .max(500)
    .allow("", null)
    .messages({
      'string.max': 'Description cannot exceed 500 characters'
    }),
  
  slug: Joi.string()
    .trim()
    .lowercase()
    .pattern(/^[a-z0-9\-_]+$/)
    .max(100)
    .optional()
    .messages({
      'string.pattern.base': 'Slug can only contain lowercase letters, numbers, hyphens, and underscores',
      'string.max': 'Slug cannot exceed 100 characters'
    }),
  
  parentId: Joi.string()
    .uuid()
    .allow(null)
    .optional()
    .messages({
      'string.guid': 'Parent category ID must be a valid UUID'
    }),
  
  icon: Joi.string()
    .trim()
    .max(50)
    .optional()
    .messages({
      'string.max': 'Icon name cannot exceed 50 characters'
    }),
  
  color: Joi.string()
    .trim()
    .pattern(/^#[0-9A-Fa-f]{6}$/)
    .optional()
    .messages({
      'string.pattern.base': 'Color must be a valid hex color code (e.g., #FF5733)'
    }),
  
  sortOrder: Joi.number()
    .integer()
    .min(0)
    .max(9999)
    .default(0)
    .messages({
      'number.min': 'Sort order cannot be negative',
      'number.max': 'Sort order cannot exceed 9999'
    }),
  
  isActive: Joi.boolean()
    .default(true),
  
  isVisible: Joi.boolean()
    .default(true),
  
  metaTitle: Joi.string()
    .trim()
    .max(60)
    .optional()
    .messages({
      'string.max': 'Meta title cannot exceed 60 characters'
    }),
  
  metaDescription: Joi.string()
    .trim()
    .max(160)
    .optional()
    .messages({
      'string.max': 'Meta description cannot exceed 160 characters'
    }),
  
  tags: Joi.array()
    .items(Joi.string().trim().max(30))
    .max(10)
    .optional()
    .messages({
      'array.max': 'Cannot have more than 10 tags'
    }),
  
  image: Joi.string()
    .uri()
    .optional()
    .messages({
      'string.uri': 'Image must be a valid URL'
    }),
  
  customFields: Joi.object()
    .pattern(
      Joi.string().max(50),
      Joi.alternatives().try(
        Joi.string().max(255),
        Joi.number(),
        Joi.boolean(),
        Joi.array().items(Joi.string().max(100))
      )
    )
    .max(20)
    .optional()
    .messages({
      'object.max': 'Cannot have more than 20 custom fields'
    })
});

// Update schema with same validation as create but all fields optional
const updateCategorySchema = createCategorySchema.fork(
  Object.keys(createCategorySchema.describe().keys),
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

const validateCreateCategory = (req, res, next) => {
  try {
    // Sanitize input first
    req.body = sanitizeInput(req.body);
    
    const { error, value } = createCategorySchema.validate(req.body, { 
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
    console.error('Category validation error:', err);
    return res.status(500).json({
      success: false,
      message: "Internal validation error",
    });
  }
};

const validateUpdateCategory = (req, res, next) => {
  try {
    // Sanitize input first
    req.body = sanitizeInput(req.body);
    
    // Remove id from body if present to avoid Joi validation error
    if ("id" in req.body) {
      delete req.body.id;
    }
    
    const { error, value } = updateCategorySchema.validate(req.body, { 
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
    console.error('Category validation error:', err);
    return res.status(500).json({
      success: false,
      message: "Internal validation error",
    });
  }
};

// Validate category ID parameter
const validateCategoryId = (req, res, next) => {
  const { id } = req.params;
  
  if (!id || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
    return res.status(400).json({
      success: false,
      message: "Invalid category ID",
    });
  }
  
  next();
};

// Validate category name uniqueness
const validateCategoryNameUniqueness = async (req, res, next) => {
  try {
    const { name } = req.body;
    const { id } = req.params; // For updates, exclude current category
    
    if (name) {
      const categoryRepository = require("../repositories/category.repository");
      const existingCategory = await categoryRepository.findByName(name);
      
      if (existingCategory && (!id || existingCategory.id !== id)) {
        return res.status(409).json({
          success: false,
          message: "Category name already exists",
          field: "name"
        });
      }
    }
    
    next();
  } catch (error) {
    console.error('Category name uniqueness validation error:', error);
    return res.status(500).json({
      success: false,
      message: "Internal validation error",
    });
  }
};

// Validate slug uniqueness
const validateSlugUniqueness = async (req, res, next) => {
  try {
    const { slug } = req.body;
    const { id } = req.params; // For updates, exclude current category
    
    if (slug) {
      const categoryRepository = require("../repositories/category.repository");
      const existingCategory = await categoryRepository.findBySlug(slug);
      
      if (existingCategory && (!id || existingCategory.id !== id)) {
        return res.status(409).json({
          success: false,
          message: "Category slug already exists",
          field: "slug"
        });
      }
    }
    
    next();
  } catch (error) {
    console.error('Category slug uniqueness validation error:', error);
    return res.status(500).json({
      success: false,
      message: "Internal validation error",
    });
  }
};

// Validate parent category exists and is not circular
const validateParentCategory = async (req, res, next) => {
  try {
    const { parentId } = req.body;
    const { id } = req.params; // For updates, check for circular reference
    
    if (parentId) {
      const categoryRepository = require("../repositories/category.repository");
      
      // Check if parent category exists
      const parentCategory = await categoryRepository.findById(parentId);
      if (!parentCategory || parentCategory.isDeleted) {
        return res.status(400).json({
          success: false,
          message: "Parent category not found",
          field: "parentId"
        });
      }
      
      // Check for circular reference (only for updates)
      if (id) {
        const isCircular = await categoryRepository.isCircularReference(id, parentId);
        if (isCircular) {
          return res.status(400).json({
            success: false,
            message: "Cannot set parent category: would create circular reference",
            field: "parentId"
          });
        }
      }
    }
    
    next();
  } catch (error) {
    console.error('Parent category validation error:', error);
    return res.status(500).json({
      success: false,
      message: "Internal validation error",
    });
  }
};

module.exports = {
  validateCreateCategory,
  validateUpdateCategory,
  validateCategoryId,
  validateCategoryNameUniqueness,
  validateSlugUniqueness,
  validateParentCategory,
};
