const Joi = require("joi");

// Schema for creating a role
const createRoleSchema = Joi.object({
  
  role_type: Joi.string().min(2).max(50).required(),
  createdAt: Joi.date().optional(), // Can be auto-set in DB
  createdBy: Joi.string().optional(),
  isDeleted: Joi.boolean().optional(),
});

// Schema for updating a role
const updateRoleSchema = Joi.object({
  role_type: Joi.string().min(2).max(50),
  deletedAt: Joi.date().optional(),
  deletedBy: Joi.string().optional(),
  isDeleted: Joi.boolean().optional(),
});

// Middleware: Validate role creation
const validateCreateRole = (req, res, next) => {
  const { error } = createRoleSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      message: "Validation error",
      errors: error.details.map((d) => d.message),
    });
  }
  next();
};

// Middleware: Validate role update
const validateUpdateRole = (req, res, next) => {
  const { error } = updateRoleSchema.validate(req.body);
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
  validateCreateRole,
  validateUpdateRole,
};
