const express = require("express");
const router = express.Router();
const controller = require("../controller/productPurchase.controller");

router.post("/", controller.createProductPurchase);
router.get("/", controller.getAllProductPurchases);
router.get("/:id", controller.getProductPurchaseById);
router.put("/:id", controller.updateProductPurchase);
router.delete("/:id", controller.deleteProductPurchase);

module.exports = router;
