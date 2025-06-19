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

// Update product (Admin-only)
router.put(
  "/:id",
  authenticate,
  authorize("admin"),
  validateUpdateProduct,
  productController.updateProduct
);

// Get all products (Admin and Staff)
router.get(
  "/",
  authenticate,
  authorize("admin", "staff"),
  productController.getAllProducts
);

// Delete product (Admin-only)
router.delete(
  "/:id",
  authenticate,
  authorize("admin"),
  productController.deleteProduct
);

// Get low-stock products (Admin and Staff)
router.get(
  "/low-stock",
  authenticate,
  authorize("admin", "staff"),
  productController.getLowStockProducts
);

// Get out-of-stock products (Admin and Staff)
router.get(
  "/out-of-stock",
  authenticate,
  authorize("admin", "staff"),
  productController.getOutOfStockProducts
);

// Get product by ID (Admin and Staff)
router.get(
  "/:id",
  authenticate,
  authorize("admin", "staff"),
  productController.getProductById
);

module.exports = router;
module.exports.getAllProducts = getAllProducts;
