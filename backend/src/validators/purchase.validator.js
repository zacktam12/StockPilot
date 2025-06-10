const Joi = require("joi");

// Schema for creating a purchase
const createPurchaseSchema = Joi.object({
  userId: Joi.number().integer().positive().required(),
  supplierId: Joi.number().integer().positive().required(),
  totalCost: Joi.number().precision(2).min(0).required(),
  discount: Joi.number().precision(2).min(0).optional(),
  tax: Joi.number().precision(2).min(0).optional(),
  status: Joi.string().valid("pending", "received", "cancelled").optional(),
  notes: Joi.string().allow("", null),
});

// Schema for updating a purchase
const updatePurchaseSchema = Joi.object({
  userId: Joi.number().integer().positive(),
  supplierId: Joi.number().integer().positive(),
  totalCost: Joi.number().precision(2).min(0),
  discount: Joi.number().precision(2).min(0),
  tax: Joi.number().precision(2).min(0),
  status: Joi.string().valid("pending", "received", "cancelled"),
  notes: Joi.string().allow("", null),
});

// Middleware: Validate purchase creation
const validateCreatePurchase = (req, res, next) => {
  const { error } = createPurchaseSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      message: "Validation error",
      errors: error.details.map((detail) => detail.message),
    });
  }
  next();
};

// Middleware: Validate purchase update
const validateUpdatePurchase = (req, res, next) => {
  const { error } = updatePurchaseSchema.validate(req.body);
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
  validateCreatePurchase,
  validateUpdatePurchase,
};
