const express = require("express");
const router = express.Router();
const productController = require("../controller/product.controller");
const {
  validateCreateProduct,
  validateUpdateProduct,
} = require("../validators/product.validator");
const { authenticate, authorize } = require("../middlewares/auth");

// Create product (Admin-only)
router.post(
  "/",
  authenticate,
  authorize("admin"),
  validateCreateProduct,
  productController.createProduct
);

// Get all products (Admin and Staff) - with pagination and filtering
router.get(
  "/",
  authenticate,
  authorize("admin", "staff"),
  productController.getAllProducts
);

// Get low stock products (Admin and Staff)
router.get(
  "/low-stock",
  authenticate,
  authorize("admin", "staff"),
  productController.getLowStockProducts
);

// Get product by ID (Admin and Staff)
router.get(
  "/:id",
  authenticate,
  authorize("admin", "staff"),
  productController.getProductById
);

// Update product (Admin-only)
router.put(
  "/:id",
  authenticate,
  authorize("admin"),
  validateUpdateProduct,
  productController.updateProduct
);

// Update stock (Admin and Staff)
router.patch(
  "/:id/stock",
  authenticate,
  authorize("admin", "staff"),
  productController.updateStock
);

// Increment stock (Admin and Staff)
router.patch(
  "/:id/stock/increment",
  authenticate,
  authorize("admin", "staff"),
  productController.incrementStock
);

// Decrement stock (Admin and Staff)
router.patch(
  "/:id/stock/decrement",
  authenticate,
  authorize("admin", "staff"),
  productController.decrementStock
);

// Delete product (Admin-only)
router.delete(
  "/:id",
  authenticate,
  authorize("admin"),
  productController.deleteProduct
);

module.exports = router;
