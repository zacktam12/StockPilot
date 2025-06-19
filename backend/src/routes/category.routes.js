const express = require("express");
const router = express.Router();
const categoryController = require("../controller/category.controller");
const {
  validateCreateCategory,
  validateUpdateCategory,
} = require("../validators/category.validator");
const { authenticate, authorize } = require("../middlewares/auth");

// Create category (Admin-only)
router.post(
  "/",
  authenticate,
  authorize("admin"),
  validateCreateCategory,
  categoryController.createCategory
);

// Update category (Admin and Staff)
router.put(
  "/:id",
  authenticate,
  authorize("admin", "staff"),
  validateUpdateCategory,
  categoryController.updateCategory
);

// Get all categories (Admin and Staff)
router.get(
  "/",
  authenticate,
  authorize("admin", "staff"),
  categoryController.getAllCategories
);

// Get category by ID (Admin and Staff)
router.get(
  "/:id",
  authenticate,
  authorize("admin", "staff"),
  categoryController.getCategoryById
);

// Soft delete category (Admin-only)
router.delete(
  "/:id",
  authenticate,
  authorize("admin"),
  categoryController.deleteCategory
);

module.exports = router;
