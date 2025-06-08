const express = require("express");
const router = express.Router();
const controller = require("../controller/productSale.controller");

router.post("/", controller.createProductSale);
router.get("/", controller.getAllProductSales);
router.get("/:id", controller.getProductSaleById);
router.put("/:id", controller.updateProductSale);
router.delete("/:id", controller.deleteProductSale);

module.exports = router;
