const Joi = require("joi");

// Schema for creating a product purchase
const createProductPurchaseSchema = Joi.object({
  productId: Joi.string().required(),
  purchaseId: Joi.string().required(),
  purchase_price: Joi.number().precision(2).min(0).required(),
  purchase_quantity: Joi.number().integer().positive().required(),
});

// Schema for updating a product purchase
const updateProductPurchaseSchema = Joi.object({
  productId: Joi.string(),
  purchaseId: Joi.string(),
  purchase_price: Joi.number().precision(2).min(0),
  purchase_quantity: Joi.number().integer().positive(),
});

// Middleware: Validate product purchase creation
const validateCreateProductPurchase = (req, res, next) => {
  const { error } = createProductPurchaseSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      message: "Validation error",
      errors: error.details.map((detail) => detail.message),
    });
  }
  next();
};

// Middleware: Validate product purchase update
const validateUpdateProductPurchase = (req, res, next) => {
  const { error } = updateProductPurchaseSchema.validate(req.body);
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
  validateCreateProductPurchase,
  validateUpdateProductPurchase,
};
