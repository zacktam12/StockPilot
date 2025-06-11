const express = require("express");
const router = express.Router();
const productSaleController = require("../controller/productSale.controller");
const {
  validateCreateProductSale,
  validateUpdateProductSale,
} = require("../validators/productSale.validator");

router.post(
  "/",
  validateCreateProductSale,
  productSaleController.createProductSale
);
router.put(
  "/:id",
  validateUpdateProductSale,
  productSaleController.updateProductSale
);

// router.post("/", controller.createProductSale);
router.get("/", productSaleController.getAllProductSales);
router.get("/:id", productSaleController.getProductSaleById);
router.put("/:id", productSaleController.updateProductSale);
router.delete("/:id", productSaleController.deleteProductSale);

module.exports = router;
