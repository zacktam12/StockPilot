const supplierService = require("../services/supplier.service");

// Get all suppliers (with optional search/filter)
exports.getAllSuppliers = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = "",
      sortField = "",
      sortOrder = "",
    } = req.query;

    const result = await supplierService.getAllSuppliers(
      Number(page),
      Number(limit),
      search,
      sortField,
      sortOrder
    );

    res.json(result);
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

// Bulk delete suppliers
exports.bulkDeleteSuppliers = async (req, res, next) => {
  try {
    const { ids } = req.body;
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        message: "Invalid request. 'ids' array is required.",
      });
    }

    await supplierService.bulkDeleteSuppliers(ids);
    res.json({
      message: `${ids.length} supplier(s) deleted successfully`,
    });
  } catch (error) {
    next(error);
  }
};

// Bulk update suppliers
exports.bulkUpdateSuppliers = async (req, res, next) => {
  try {
    const { ids, data } = req.body;
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        message: "Invalid request. 'ids' array is required.",
      });
    }

    if (!data || typeof data !== "object") {
      return res.status(400).json({
        message: "Invalid request. 'data' object is required.",
      });
    }

    await supplierService.bulkUpdateSuppliers(ids, data);
    res.json({
      message: `${ids.length} supplier(s) updated successfully`,
    });
  } catch (error) {
    next(error);
  }
};

// Import suppliers from CSV
exports.importSuppliers = async (req, res, next) => {
  try {
    const { suppliers } = req.body;

    if (!suppliers || !Array.isArray(suppliers)) {
      return res.status(400).json({
        message: "Invalid data format. Expected an array of suppliers.",
      });
    }

    const result = await supplierService.importSuppliers(suppliers);
    res.status(201).json({
      message: `${result.count} supplier(s) imported successfully`,
      count: result.count,
    });
  } catch (error) {
    next(error);
  }
};

// Export suppliers to CSV
exports.exportSuppliers = async (req, res, next) => {
  try {
    const { search = "" } = req.query;
    const suppliers = await supplierService.getSuppliersForExport(search);

    // Set headers for CSV download
    res.setHeader("Content-Type", "text/csv");
    res.setHeader(
      "Content-Disposition",
      'attachment; filename="suppliers.csv"'
    );

    // Convert to CSV format
    const csvHeader =
      "Name,Contact Name,Email,Phone,Address,Company Name,Created At,Updated At\n";
    const csvData = suppliers
      .map(
        (supplier) =>
          `"${supplier.name || ""}","${supplier.contactName || ""}","${
            supplier.email || ""
          }","${supplier.phone || ""}","${supplier.address || ""}","${
            supplier.companyName || ""
          }","${supplier.createdAt}","${supplier.updatedAt}"`
      )
      .join("\n");

    res.send(csvHeader + csvData);
  } catch (error) {
    next(error);
  }
};
