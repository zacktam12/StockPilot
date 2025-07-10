const express = require("express");
const router = express.Router();
const purchaseController = require("../controller/purchase.controller");
const {
  validateCreatePurchase,
  validateUpdatePurchase,
} = require("../validators/purchase.validator");

router.post("/", validateCreatePurchase, purchaseController.createPurchase);
router.get("/", purchaseController.getAllPurchases);
router.get("/:id", purchaseController.getPurchaseById);
router.put("/:id", validateUpdatePurchase, purchaseController.updatePurchase);
router.delete("/:id", purchaseController.deletePurchase);
router.post("/import", purchaseController.importPurchases);
router.patch("/:id/status", purchaseController.updatePurchaseStatus);

module.exports = router;
