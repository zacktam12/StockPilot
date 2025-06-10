const Joi = require("joi");

// Schema for creating a product sale
const createProductSaleSchema = Joi.object({
  productId: Joi.number().integer().positive().required(),
  saleId: Joi.number().integer().positive().required(),
  sale_quantity: Joi.number().integer().positive().required(),
  sale_price: Joi.number().precision(2).min(0).required(),
});

// Schema for updating a product sale
const updateProductSaleSchema = Joi.object({
  productId: Joi.number().integer().positive(),
  saleId: Joi.number().integer().positive(),
  sale_quantity: Joi.number().integer().positive(),
  sale_price: Joi.number().precision(2).min(0),
});

// Middleware: Validate product sale creation
const validateCreateProductSale = (req, res, next) => {
  const { error } = createProductSaleSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      message: "Validation error",
      errors: error.details.map((detail) => detail.message),
    });
  }
  next();
};

// Middleware: Validate product sale update
const validateUpdateProductSale = (req, res, next) => {
  const { error } = updateProductSaleSchema.validate(req.body);
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
  validateCreateProductSale,
  validateUpdateProductSale,
};
