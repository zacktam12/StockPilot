const Joi = require("joi");

const createCustomerSchema = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().email().optional().allow(null, ""),
  phone: Joi.string().optional().allow(null, ""),
  address: Joi.string().optional().allow(null, ""),
});

const updateCustomerSchema = Joi.object({
  name: Joi.string().optional(),
  email: Joi.string().email().optional().allow(null, ""),
  phone: Joi.string().optional().allow(null, ""),
  address: Joi.string().optional().allow(null, ""),
});

module.exports = {
  createCustomerSchema,
  updateCustomerSchema,
};
