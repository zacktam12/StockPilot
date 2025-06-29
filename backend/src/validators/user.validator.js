const Joi = require("joi");

const registerSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  firstName: Joi.string().min(2).max(50),
  lastName: Joi.string().min(2).max(50),
  phone: Joi.string()
    .allow("", null)
    .pattern(/^[+]?[\d\s\-\(\)]{0,20}$/),
  roleId: Joi.string().required(), // Changed from number to string
  status: Joi.string()
    .valid("Active", "Inactive", "Deactivated", "Banned")
    .default("Active"),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

const updateUserSchema = Joi.object({
  firstName: Joi.string().min(2).max(50),
  lastName: Joi.string().min(2).max(50),
  email: Joi.string().email(),
  phone: Joi.string()
    .allow("", null)
    .pattern(/^[+]?[\d\s\-\(\)]{0,20}$/),
  roleId: Joi.string().allow("", null), // Made optional
  status: Joi.string().valid("Active", "Inactive", "Deactivated", "Banned"),
  password: Joi.string().min(6).optional(),
});

const validateRegister = (req, res, next) => {
  const { error } = registerSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      message: "Validation error",
      errors: error.details.map((detail) => detail.message),
    });
  }
  next();
};

const validateLogin = (req, res, next) => {
  const { error } = loginSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      message: "Validation error",
      errors: error.details.map((detail) => detail.message),
    });
  }
  next();
};

const validateUpdateUser = (req, res, next) => {
  console.log("Validating update user data:", req.body);
  const { error } = updateUserSchema.validate(req.body);
  if (error) {
    console.log("Validation errors:", error.details);
    return res.status(400).json({
      success: false,
      message: "Validation error",
      errors: error.details.map((detail) => detail.message),
    });
  }
  next();
};

module.exports = {
  validateRegister,
  validateLogin,
  validateUpdateUser,
};
