const Joi = require("joi");

const createProductSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  description: Joi.string().max(500),
  sku: Joi.string().max(50),
  barcode: Joi.string().max(50),
  price: Joi.number().min(0).required(),
  cost: Joi.number().min(0),
  quantity: Joi.number().integer().min(0).default(0),
  minStock: Joi.number().integer().min(0),
  maxStock: Joi.number().integer().min(0),
  categoryId: Joi.string().required(),
  image: Joi.string().optional(),
  image_url: Joi.string().optional(),
});

const updateProductSchema = Joi.object({
  name: Joi.string().min(2).max(100),
  description: Joi.string().max(500),
  sku: Joi.string().max(50),
  barcode: Joi.string().max(50),
  price: Joi.number().min(0),
  cost: Joi.number().min(0),
  quantity: Joi.number().integer().min(0),
  minStock: Joi.number().integer().min(0),
  maxStock: Joi.number().integer().min(0),
  categoryId: Joi.string(),
  image: Joi.string().optional(),
  image_url: Joi.string().optional(),
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
  console.log("validateUpdateProduct called with body:", req.body);

  // Remove id from body if present to avoid Joi validation error
  if ("id" in req.body) {
    delete req.body.id;
  }

  console.log("Body after removing id:", req.body);

  const { error } = updateProductSchema.validate(req.body);
  if (error) {
    console.log("Validation error:", error.details);
    return res.status(400).json({
      success: false,
      message: "Validation error",
      errors: error.details.map((detail) => detail.message),
    });
  }
  console.log("Validation passed");
  next();
};

module.exports = {
  validateCreateProduct,
  validateUpdateProduct,
};
