const express = require("express");
const router = express.Router();
const purchaseController = require("../controller/purchase.controller");
const {
  validateCreatePurchase,
  validateUpdatePurchase,
} = require("../validators/purchase.validator");

router.post("/", validateCreatePurchase, purchaseController.createPurchase);
router.put("/:id", validateUpdatePurchase, purchaseController.updatePurchase);
// router.post("/", purchaseController.createPurchase);
router.get("/", purchaseController.getAllPurchases);
router.get("/:id", purchaseController.getPurchaseById);
router.put("/:id", purchaseController.updatePurchase);
router.delete("/:id", purchaseController.deletePurchase);

module.exports = router;
