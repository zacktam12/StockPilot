const supplierService = require("../services/supplier.service");

// Enhanced error handling function
const handleSupplierError = (error, res) => {
  console.error('Supplier Controller Error:', error);
  
  // Handle specific Prisma errors
  if (error.code === 'P2002') {
    return res.status(409).json({
      success: false,
      message: 'Supplier with this information already exists',
      field: error.meta?.target?.[0] || 'unknown'
    });
  }
  
  if (error.code === 'P2025') {
    return res.status(404).json({
      success: false,
      message: 'Supplier not found'
    });
  }
  
  // Handle validation errors
  if (error.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: error.details || [error.message]
    });
  }
  
  // Default error response
  return res.status(500).json({
    success: false,
    message: 'Internal server error'
  });
};

// Get all suppliers (with optional search/filter)
exports.getAllSuppliers = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = "",
      sortField = "",
      sortOrder = "",
      hasPhone = false,
      hasAddress = false,
      hasEmail = false,
      hasCompany = false
    } = req.query;

    // Validate pagination parameters
    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit) || 10));
    const offset = (pageNum - 1) * limitNum;

    const result = await supplierService.getAllSuppliers(
      pageNum,
      limitNum,
      search,
      sortField,
      sortOrder,
      hasPhone,
      hasAddress,
      hasEmail,
      hasCompany
    );

    res.json({
      success: true,
      data: result.suppliers,
      pagination: {
        currentPage: pageNum,
        totalPages: Math.ceil(result.total / limitNum),
        totalItems: result.total,
        itemsPerPage: limitNum,
        hasNext: pageNum < Math.ceil(result.total / limitNum),
        hasPrev: pageNum > 1
      }
    });
  } catch (error) {
    handleSupplierError(error, res);
  }
};

// Get supplier by ID
exports.getSupplierById = async (req, res, next) => {
  try {
    const supplier = await supplierService.getSupplierById(req.params.id);
    if (!supplier || supplier.isDeleted) {
      return res.status(404).json({ 
        success: false,
        message: "Supplier not found" 
      });
    }
    res.json({
      success: true,
      data: supplier
    });
  } catch (error) {
    handleSupplierError(error, res);
  }
};

// Create supplier
exports.createSupplier = async (req, res, next) => {
  try {
    const supplier = await supplierService.createSupplier(req.body);
    res.status(201).json({
      success: true,
      message: 'Supplier created successfully',
      data: supplier
    });
  } catch (error) {
    handleSupplierError(error, res);
  }
};

// Update supplier
exports.updateSupplier = async (req, res, next) => {
  try {
    const supplier = await supplierService.updateSupplier(
      req.params.id,
      req.body
    );
    if (!supplier) {
      return res.status(404).json({
        success: false,
        message: "Supplier not found"
      });
    }
    res.json({
      success: true,
      message: 'Supplier updated successfully',
      data: supplier
    });
  } catch (error) {
    handleSupplierError(error, res);
  }
};

// Soft delete supplier
exports.deleteSupplier = async (req, res, next) => {
  try {
    const deleted = await supplierService.deleteSupplier(req.params.id);
    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "Supplier not found"
      });
    }
    res.json({ 
      success: true,
      message: "Supplier deleted successfully" 
    });
  } catch (error) {
    handleSupplierError(error, res);
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
