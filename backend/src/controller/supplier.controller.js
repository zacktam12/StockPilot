const supplierService = require("../services/supplier.service");

// Get all suppliers (with optional search/filter)
exports.getAllSuppliers = async (req, res, next) => {
  try {
    const { search = "" } = req.query;
    const suppliers = await supplierService.getAllSuppliers(search);
    res.json(suppliers);
  } catch (error) {
    next(error);
  }
};

// Get supplier by ID
exports.getSupplierById = async (req, res, next) => {
  try {
    const supplier = await supplierService.getSupplierById(req.params.id);
    if (!supplier || supplier.isDeleted) {
      return res.status(404).json({ message: "Supplier not found" });
    }
    res.json(supplier);
  } catch (error) {
    next(error);
  }
};

// Create supplier
exports.createSupplier = async (req, res, next) => {
  try {
    const supplier = await supplierService.createSupplier(req.body);
    res.status(201).json(supplier);
  } catch (error) {
    next(error);
  }
};

// Update supplier
exports.updateSupplier = async (req, res, next) => {
  try {
    const supplier = await supplierService.updateSupplier(
      req.params.id,
      req.body
    );
    res.json(supplier);
  } catch (error) {
    next(error);
  }
};

// Soft delete supplier
exports.deleteSupplier = async (req, res, next) => {
  try {
    await supplierService.deleteSupplier(req.params.id);
    res.json({ message: "Supplier deleted" });
  } catch (error) {
    next(error);
  }
};
