const Joi = require("joi");

// Validation for creating a sale
const createSaleSchema = Joi.object({
  userId: Joi.string().uuid().optional(), // Make userId optional
  customerId: Joi.string().uuid().optional().allow(null),
  customer_id: Joi.string().uuid().optional().allow(null), // Support both camelCase and snake_case
  totalPrice: Joi.number().precision(2).optional(), // Make totalPrice optional since it's calculated from items
  items: Joi.array()
    .items(
      Joi.object({
        product_id: Joi.string().uuid().required(), // Accept UUID strings for product_id
        quantity: Joi.number().integer().positive().required(),
        price: Joi.number().precision(2).positive().required(),
      })
    )
    .min(1)
    .required(), // Require at least one item
  discount: Joi.number().precision(2).optional(),
  tax: Joi.number().precision(2).optional(),
  paymentMethod: Joi.string().optional(),
  status: Joi.string().valid("completed", "pending", "cancelled").optional(),
  notes: Joi.string().optional(),
});

// Validation for updating a sale
const updateSaleSchema = Joi.object({
  customerId: Joi.string().uuid().optional().allow(null),
  customer_id: Joi.string().uuid().optional().allow(null), // Support both camelCase and snake_case
  totalPrice: Joi.number().precision(2).optional(),
  items: Joi.array()
    .items(
      Joi.object({
        product_id: Joi.string().uuid().required(),
        quantity: Joi.number().integer().positive().required(),
        price: Joi.number().precision(2).positive().required(),
      })
    )
    .min(1)
    .optional(), // Make items optional for updates
  discount: Joi.number().precision(2).optional(),
  tax: Joi.number().precision(2).optional(),
  paymentMethod: Joi.string().optional(),
  status: Joi.string().valid("completed", "pending", "cancelled").optional(),
  notes: Joi.string().optional(),
});

const validateCreateSale = (req, res, next) => {
  console.log("DEBUG: Received sale data:", JSON.stringify(req.body, null, 2));
  const { error } = createSaleSchema.validate(req.body);
  if (error) {
    console.log("DEBUG: Validation error details:", error.details);
    return res.status(400).json({
      success: false,
      message: "Validation error",
      errors: error.details.map((d) => d.message),
    });
  }
  console.log("DEBUG: Validation passed successfully");
  next();
};

const validateUpdateSale = (req, res, next) => {
  console.log(
    "DEBUG: Received update sale data:",
    JSON.stringify(req.body, null, 2)
  );
  console.log("DEBUG: Sale ID from params:", req.params.id);

  const { error } = updateSaleSchema.validate(req.body);
  if (error) {
    console.log("DEBUG: Update validation error details:", error.details);
    console.log("DEBUG: Validation error message:", error.message);
    console.log("DEBUG: Validation error path:", error.details[0]?.path);
    console.log(
      "DEBUG: Validation error value:",
      error.details[0]?.context?.value
    );

    return res.status(400).json({
      success: false,
      message: "Validation error",
      errors: error.details.map((d) => d.message),
      details: error.details.map((d) => ({
        message: d.message,
        path: d.path,
        value: d.context?.value,
      })),
    });
  }
  console.log("DEBUG: Update validation passed successfully");
  next();
};

module.exports = {
  validateCreateSale,
  validateUpdateSale,
};
