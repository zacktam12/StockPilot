const Joi = require("joi");

const supplierSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  email: Joi.string().email().allow(null, ""),
  phone: Joi.string().max(30).allow(null, ""),
  address: Joi.string().max(255).allow(null, ""),
});

const validateCreateSupplier = (req, res, next) => {
  const { error } = supplierSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      message: "Validation error",
      errors: error.details.map((d) => d.message),
    });
  }
  next();
};

const validateUpdateSupplier = (req, res, next) => {
  const { error } = supplierSchema.validate(req.body, { presence: "optional" });
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
  validateCreateSupplier,
  validateUpdateSupplier,
};
