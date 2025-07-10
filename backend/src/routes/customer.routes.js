const express = require("express");
const router = express.Router();
const customerController = require("../controller/customer.controller");
const { authenticate, authorize } = require("../middlewares/auth");

// Create customer (Admin and Staff)
router.post(
  "/",
  authenticate,
  authorize("admin", "staff"),
  customerController.create
);

// Get all customers (Admin and Staff)
router.get(
  "/",
  authenticate,
  authorize("admin", "staff"),
  customerController.getAll
);

// Get customer by ID (Admin and Staff)
router.get(
  "/:id",
  authenticate,
  authorize("admin", "staff"),
  customerController.getById
);

// Update customer (Admin and Staff)
router.put(
  "/:id",
  authenticate,
  authorize("admin", "staff"),
  customerController.update
);

// Delete customer (Admin-only)
router.delete(
  "/:id",
  authenticate,
  authorize("admin"),
  customerController.delete
);

// Bulk import customers (Admin-only)
router.post(
  "/bulk",
  authenticate,
  authorize("admin"),
  customerController.bulkImportCustomers
);

// Bulk delete customers (Admin-only)
router.delete(
  "/bulk",
  authenticate,
  authorize("admin"),
  customerController.bulkDeleteCustomers
);

module.exports = router;
