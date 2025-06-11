const Joi = require("joi");

// Schema for creating a category
const createCategorySchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  description: Joi.string().allow("", null),
});

// Schema for updating a category
const updateCategorySchema = Joi.object({
  name: Joi.string().min(2).max(100),
  description: Joi.string().allow("", null),
});

// Middleware: Validate category creation
const validateCreateCategory = (req, res, next) => {
  const { error } = createCategorySchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      message: "Validation error",
      errors: error.details.map((detail) => detail.message),
    });
  }
  next();
};

// Middleware: Validate category update
const validateUpdateCategory = (req, res, next) => {
  const { error } = updateCategorySchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      message: "Validation error",
      errors: error.details.map((detail) => detail.message),
    });
  }
  next();
};

module.exports = {
  validateCreateCategory,
  validateUpdateCategory,
};
