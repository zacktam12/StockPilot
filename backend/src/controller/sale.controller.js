const saleService = require("../services/sale.service");
const NotificationService = require("../services/notification.service");

// Enhanced error handling function
const handleSaleError = (error, res) => {
  // Handle specific Prisma errors
  if (error.code === 'P2002') {
    return res.status(409).json({
      success: false,
      message: 'Sale with this order number already exists',
      field: error.meta?.target?.[0] || 'unknown'
    });
  }
  
  if (error.code === 'P2025') {
    return res.status(404).json({
      success: false,
      message: 'Sale not found'
    });
  }
  
  if (error.code === 'P2003') {
    return res.status(400).json({
      success: false,
      message: 'Invalid customer or product reference'
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
  
  // Handle insufficient stock errors
  if (error.message && error.message.includes('insufficient stock')) {
    return res.status(400).json({
      success: false,
      message: 'Insufficient stock for one or more products',
      details: error.details
    });
  }
  
  // Default error response
  return res.status(500).json({
    success: false,
    message: 'Internal server error'
  });
};

exports.createSale = async (req, res, next) => {
  try {
    const saleData = {
      ...req.body,
      userId: req.user.id,
    };
    
    const sale = await saleService.createSale(saleData);

    // Create notification for the sale
    try {
      const customer = sale.customer;
      await NotificationService.createSaleNotification(sale, customer);
    } catch (notificationError) {
      // Failed to create notification - continue without blocking
    }

    res.status(201).json({
      success: true,
      message: "Sale created successfully",
      data: sale,
    });
  } catch (error) {
    handleSaleError(error, res);
  }
};

exports.getAllSales = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = "",
      status = "",
      customerId = "",
      paymentMethod = "",
      startDate = "",
      endDate = "",
      sortField = "createdAt",
      sortOrder = "desc"
    } = req.query;

    // Validate pagination parameters
    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit) || 10));

    const result = await saleService.getAllSales({
      page: pageNum,
      limit: limitNum,
      search,
      status,
      customerId,
      paymentMethod,
      startDate,
      endDate,
      sortField,
      sortOrder
    });

    res.json({
      success: true,
      data: result.sales,
      pagination: {
        currentPage: pageNum,
        totalPages: Math.ceil(result.total / limitNum),
        totalItems: result.total,
        itemsPerPage: limitNum,
        hasNext: pageNum < Math.ceil(result.total / limitNum),
        hasPrev: pageNum > 1
      },
      summary: result.summary || {}
    });
  } catch (error) {
    handleSaleError(error, res);
  }
};

exports.getSaleById = async (req, res, next) => {
  try {
    const result = await saleService.getSaleById(req.params.id);
    if (!result) {
      return res.status(404).json({
        success: false,
        message: "Sale not found"
      });
    }
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    handleSaleError(error, res);
  }
};

exports.updateSale = async (req, res, next) => {
  try {
    const result = await saleService.updateSale(req.params.id, req.body);
    if (!result) {
      return res.status(404).json({
        success: false,
        message: "Sale not found"
      });
    }
    res.json({
      success: true,
      message: 'Sale updated successfully',
      data: result
    });
  } catch (error) {
    handleSaleError(error, res);
  }
};

exports.updateSaleStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const sale = await saleService.updateSale(req.params.id, { status });
    res.json({
      success: true,
      message: "Sale status updated successfully",
      data: sale,
    });
  } catch (error) {
    next(error);
  }
};

exports.deleteSale = async (req, res, next) => {
  try {
    await saleService.deleteSale(req.params.id);
    res.json({
      success: true,
      message: "Sale deleted successfully",
    });
  } catch (error) {
    if (error.message.includes("not found")) {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }
    if (error.message.includes("already deleted")) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
    next(error);
  }
};

exports.bulkDeleteSales = async (req, res, next) => {
  try {
    const { ids } = req.body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Please provide an array of sale IDs to delete",
      });
    }

    const results = await Promise.allSettled(
      ids.map((id) => saleService.deleteSale(id))
    );

    const successful = results.filter(
      (result) => result.status === "fulfilled"
    ).length;
    const failed = results.filter(
      (result) => result.status === "rejected"
    ).length;

    res.json({
      success: true,
      message: `Successfully deleted ${successful} sales${
        failed > 0 ? `, ${failed} failed` : ""
      }`,
      data: {
        successful,
        failed,
        total: ids.length,
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.importSales = async (req, res, next) => {
  try {
    const { sales } = req.body;
    if (!Array.isArray(sales) || sales.length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "No sales provided for import." });
    }
    const result = await saleService.importSales(sales);
    res.status(201).json({
      success: true,
      message: "Sales imported successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};
