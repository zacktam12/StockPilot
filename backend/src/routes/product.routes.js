const express = require("express");
const router = express.Router();
const productController = require("../controller/product.controller");
const {
  validateCreateProduct,
  validateUpdateProduct,
} = require("../validators/product.validator");
const { authenticate, authorize } = require("../middlewares/auth");

router.post(
  "/",
  authenticate,
  authorize("admin"),
  validateCreateProduct,
  productController.createProduct
);
router.put(
  "/:id",
  authenticate,
  authorize("admin"),
  validateUpdateProduct,
  productController.updateProduct
);
router.get(
  "/",
  authenticate,
  authorize("admin", "staff"),
  productController.getAllProducts
);
// router.put("/:id", productController.updateProduct);
router.delete(
  "/:id",
  authenticate,
  authorize("admin"),
  productController.deleteProduct
);
router.get("/low-stock", productController.getLowStockProducts);
router.get("/out-of-stock", productController.getOutOfStockProducts);
router.get("/:id", productController.getProductById);

module.exports = router;
