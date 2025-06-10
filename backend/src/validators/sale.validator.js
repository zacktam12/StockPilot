const Joi = require("joi");

// Validation for creating a sale
const createSaleSchema = Joi.object({
  userId: Joi.number().integer().required(),
  customerId: Joi.number().integer().optional().allow(null),
  totalPrice: Joi.number().precision(2).required(),
  discount: Joi.number().precision(2).optional(),
  tax: Joi.number().precision(2).optional(),
  paymentMethod: Joi.string().optional(),
  status: Joi.string().valid("completed", "pending", "cancelled").optional(),
  notes: Joi.string().optional(),
});

// Validation for updating a sale
const updateSaleSchema = Joi.object({
  customerId: Joi.number().integer().optional().allow(null),
  totalPrice: Joi.number().precision(2).optional(),
  discount: Joi.number().precision(2).optional(),
  tax: Joi.number().precision(2).optional(),
  paymentMethod: Joi.string().optional(),
  status: Joi.string().valid("completed", "pending", "cancelled").optional(),
  notes: Joi.string().optional(),
});

const validateCreateSale = (req, res, next) => {
  const { error } = createSaleSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      message: "Validation error",
      errors: error.details.map((d) => d.message),
    });
  }
  next();
};

const validateUpdateSale = (req, res, next) => {
  const { error } = updateSaleSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      message: "Validation error",
      errors: error.details.map((d) => d.message),
    });
  }
  next();
};

module.exports = {
  validateCreateSale,
  validateUpdateSale,
};
