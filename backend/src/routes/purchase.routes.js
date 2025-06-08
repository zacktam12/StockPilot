const express = require("express");
const router = express.Router();
const purchaseController = require("../controller/purchase.controller");

router.post("/", purchaseController.createPurchase);
router.get("/", purchaseController.getAllPurchases);
router.get("/:id", purchaseController.getPurchaseById);
router.put("/:id", purchaseController.updatePurchase);
router.delete("/:id", purchaseController.deletePurchase);

module.exports = router;
