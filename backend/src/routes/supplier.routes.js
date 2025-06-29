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

// Bulk operations
router.post("/bulk-delete", supplierController.bulkDeleteSuppliers);
router.post("/bulk-update", supplierController.bulkUpdateSuppliers);

// Import/Export operations
router.post("/import", supplierController.importSuppliers);
router.get("/export", supplierController.exportSuppliers);

module.exports = router;
