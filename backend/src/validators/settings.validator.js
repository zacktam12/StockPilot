const Joi = require("joi");

// Schema for updating settings
const updateSettingsSchema = Joi.object({
  // Basic Settings
  appName: Joi.string().min(2).max(100).optional(),
  theme: Joi.string().valid("light", "dark", "auto").optional(),
  lowStockThreshold: Joi.number().integer().min(0).optional(),
  currency: Joi.string().min(1).max(10).optional(),
  taxRate: Joi.number().min(0).max(100).optional(),
  
  // Company Information
  companyName: Joi.string().max(200).optional(),
  companyEmail: Joi.string().email().optional(),
  companyPhone: Joi.string().max(50).optional(),
  companyAddress: Joi.string().max(500).optional(),
  companyTaxId: Joi.string().max(50).optional(),
  companyWebsite: Joi.string().uri().optional(),
  companyLogo: Joi.string().uri().optional(),
  
  
  // Security
  twoFactorAuth: Joi.boolean().optional(),
  passwordExpiry: Joi.number().integer().min(1).max(365).optional(),
  sessionTimeout: Joi.number().integer().min(1).max(1440).optional(),
  loginAttempts: Joi.number().integer().min(1).max(10).optional(),
  
  // Additional Settings
  timezone: Joi.string().max(100).optional(),
  dateFormat: Joi.string().valid("MM/DD/YYYY", "DD/MM/YYYY", "YYYY-MM-DD").optional(),
  timeFormat: Joi.string().valid("12", "24").optional(),
  language: Joi.string().valid("en", "es", "fr", "de").optional(),
  autoBackup: Joi.boolean().optional(),
  backupFrequency: Joi.string().valid("daily", "weekly", "monthly").optional(),
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
