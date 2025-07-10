const Joi = require("joi");

// Schema for updating settings
const updateSettingsSchema = Joi.object({
  appName: Joi.string().min(2).max(100),
  theme: Joi.string().valid("light", "dark"),
  lowStockThreshold: Joi.number().integer().min(0),
  currency: Joi.string().min(1).max(10),
  taxRate: Joi.number().min(0).max(100),
  lowStockAlerts: Joi.boolean(),
  salesReports: Joi.boolean(),
  newCustomerAlerts: Joi.boolean(),
  systemUpdates: Joi.boolean(),
  passwordExpiry: Joi.number().integer().min(1),
  sessionTimeout: Joi.number().integer().min(1),
  loginAttempts: Joi.number().integer().min(1),
});

// Middleware: Validate settings update
const validateUpdateSettings = (req, res, next) => {
  const { error } = updateSettingsSchema.validate(req.body);
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
  validateUpdateSettings,
};
