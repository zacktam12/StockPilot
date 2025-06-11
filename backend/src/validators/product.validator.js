const Joi = require("joi");

const createProductSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  description: Joi.string().max(500),
  sku: Joi.string().max(50),
  barcode: Joi.string().max(50),
  price: Joi.number().positive().required(),
  cost: Joi.number().positive(),
  quantity: Joi.number().integer().min(0).default(0),
  minStock: Joi.number().integer().min(0),
  maxStock: Joi.number().integer().min(0),
  categoryId: Joi.number().integer().positive().required(),
});

const updateProductSchema = Joi.object({
  name: Joi.string().min(2).max(100),
  description: Joi.string().max(500),
  sku: Joi.string().max(50),
  barcode: Joi.string().max(50),
  price: Joi.number().positive(),
  cost: Joi.number().positive(),
  quantity: Joi.number().integer().min(0),
  minStock: Joi.number().integer().min(0),
  maxStock: Joi.number().integer().min(0),
  categoryId: Joi.number().integer().positive(),
});

const validateCreateProduct = (req, res, next) => {
  const { error } = createProductSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      message: "Validation error",
      errors: error.details.map((detail) => detail.message),
    });
  }
  next();
};

const validateUpdateProduct = (req, res, next) => {
  const { error } = updateProductSchema.validate(req.body);
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
  validateCreateProduct,
  validateUpdateProduct,
};
