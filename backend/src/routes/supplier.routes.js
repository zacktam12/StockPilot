const express = require("express");
const router = express.Router();
const supplierController = require("../controller/supplier.controller");
const { authenticate } = require("../middlewares/auth");
const {
  validateCreateSupplier,
  validateUpdateSupplier,
} = require("../validators/supplier.validator");

// All routes require authentication
router.use(authenticate);

router.get("/", supplierController.getAllSuppliers);
router.get("/:id", supplierController.getSupplierById);
router.post("/", validateCreateSupplier, supplierController.createSupplier);
router.put("/:id", validateUpdateSupplier, supplierController.updateSupplier);
router.delete("/:id", supplierController.deleteSupplier);

module.exports = router;
