const express = require("express");
const router = express.Router();
const productController = require("../controller/product.controller");

router.post("/", productController.createProduct);
router.get("/", productController.getAllProducts);
router.put("/:id", productController.updateProduct);
router.delete("/:id", productController.deleteProduct);
router.get("/low-stock", productController.getLowStockProducts);
router.get("/out-of-stock", productController.getOutOfStockProducts);
router.get("/:id", productController.getProductById);

module.exports = router;
