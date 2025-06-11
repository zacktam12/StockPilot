const express = require("express");
const router = express.Router();
const saleController = require("../controller/sale.controller");
const {
  validateCreateSale,
  validateUpdateSale,
} = require("../validators/sale.validator");

router.post("/", validateCreateSale, saleController.createSale);
router.put("/:id", validateUpdateSale, saleController.updateSale);
router.get("/", saleController.getAllSales);
router.get("/:id", saleController.getSaleById);
router.put("/:id", saleController.updateSale);
router.delete("/:id", saleController.deleteSale);

module.exports = router;
