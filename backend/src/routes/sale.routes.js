const express = require("express");
const router = express.Router();
const saleController = require("../controller/sale.controller");
const {
  validateCreateSale,
  validateUpdateSale,
} = require("../validators/sale.validator");
const { authenticate } = require("../middlewares/auth");

router.post("/", authenticate, validateCreateSale, saleController.createSale);
router.get("/", authenticate, saleController.getAllSales);
router.delete("/bulk", authenticate, saleController.bulkDeleteSales);
router.get("/:id", authenticate, saleController.getSaleById);
router.put("/:id", authenticate, validateUpdateSale, saleController.updateSale);
router.put("/:id/status", authenticate, saleController.updateSaleStatus);
router.delete("/:id", authenticate, saleController.deleteSale);
router.post("/import", authenticate, saleController.importSales);

module.exports = router;
