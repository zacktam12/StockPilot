const express = require("express");
const router = express.Router();
const saleController = require("../controller/sale.controller");

router.post("/", saleController.createSale);
router.get("/", saleController.getAllSales);
router.get("/:id", saleController.getSaleById);
router.put("/:id", saleController.updateSale);
router.delete("/:id", saleController.deleteSale);

module.exports = router;
