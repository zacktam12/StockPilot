const express = require("express");
const router = express.Router();
const productPurchaseController = require("../controller/productPurchase.controller");
const {
  validateCreateProductPurchase,
  validateUpdateProductPurchase,
} = require("../validators/productPurchase.validator");

router.post(
  "/",
  validateCreateProductPurchase,
  productPurchaseController.createProductPurchase
);
router.put(
  "/:id",
  validateUpdateProductPurchase,
  productPurchaseController.updateProductPurchase
);
// router.post("/", productPurchaseController.createProductPurchase);
router.get("/", productPurchaseController.getAllProductPurchases);
router.get("/:id", productPurchaseController.getProductPurchaseById);
router.put("/:id", productPurchaseController.updateProductPurchase);
router.delete("/:id", productPurchaseController.deleteProductPurchase);

module.exports = router;
