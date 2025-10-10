const dashboardService = require("../services/dashboard.service");

// Enhanced error handling function
const handleDashboardError = (error, res) => {
  // Handle specific Prisma errors
  if (error.code === 'P2025') {
    return res.status(404).json({
      success: false,
      message: 'Dashboard data not found'
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

// GET /api/dashboard/stats
exports.getStats = async (req, res, next) => {
  try {
    const { range = "monthly" } = req.query;
    const result = await dashboardService.getStats({ range });
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    handleDashboardError(error, res);
  }
};

// GET /api/dashboard/activities
exports.getActivities = async (req, res, next) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      type = "",
      startDate = "",
      endDate = "",
      userId = ""
    } = req.query;

    // Validate pagination parameters
    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit) || 10));

    const result = await dashboardService.getActivities({
      page: pageNum,
      limit: limitNum,
      type,
      startDate,
      endDate,
      userId
    });

    res.json({
      success: true,
      data: result.activities,
      currentPage: pageNum,
      totalPages: Math.ceil(result.total / limitNum),
      totalItems: result.total,
      limit: limitNum
    });
  } catch (error) {
    handleDashboardError(error, res);
  }
};

// GET /api/dashboard/low-stock-alerts
exports.getLowStockAlerts = async (req, res, next) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      severity = "",
      categoryId = ""
    } = req.query;

    // Validate pagination parameters
    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit) || 10));

    const result = await dashboardService.getLowStockAlerts({
      page: pageNum,
      limit: limitNum,
      severity,
      categoryId
    });

    res.json({
      success: true,
      data: result.data,
      currentPage: pageNum,
      totalPages: Math.ceil(result.totalItems / limitNum),
      totalItems: result.totalItems,
      limit: limitNum
    });
  } catch (error) {
    handleDashboardError(error, res);
  }
};

// GET /api/dashboard/revenue-data
exports.getRevenueData = async (req, res, next) => {
  try {
    const { 
      range = "monthly", 
      startDate = "", 
      endDate = "",
      groupBy = "day"
    } = req.query;
    
    const result = await dashboardService.getRevenueData({
      range,
      startDate,
      endDate,
      groupBy
    });
    
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    handleDashboardError(error, res);
  }
};

// GET /api/dashboard/product-distribution
exports.getProductDistribution = async (req, res, next) => {
  try {
    const result = await dashboardService.getProductDistribution();
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    handleDashboardError(error, res);
  }
};

// GET /api/dashboard/sales-analytics
exports.getSalesAnalytics = async (req, res, next) => {
  try {
    const { 
      period = "30d", 
      startDate = "", 
      endDate = "",
      groupBy = "day"
    } = req.query;
    
    const result = await dashboardService.getSalesAnalytics({
      period,
      startDate,
      endDate,
      groupBy
    });
    
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    handleDashboardError(error, res);
  }
};

// GET /api/dashboard/customer-analytics
exports.getCustomerAnalytics = async (req, res, next) => {
  try {
    const { 
      period = "30d", 
      startDate = "", 
      endDate = ""
    } = req.query;
    
    const result = await dashboardService.getCustomerAnalytics({
      period,
      startDate,
      endDate
    });
    
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    handleDashboardError(error, res);
  }
};

// GET /api/dashboard/inventory-analytics
exports.getInventoryAnalytics = async (req, res, next) => {
  try {
    const { 
      categoryId = "",
      includeZeroStock = false
    } = req.query;
    
    const result = await dashboardService.getInventoryAnalytics({
      categoryId,
      includeZeroStock: includeZeroStock === "true"
    });
    
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    handleDashboardError(error, res);
  }
};

// GET /api/dashboard/performance-metrics
exports.getPerformanceMetrics = async (req, res, next) => {
  try {
    const { 
      period = "30d", 
      startDate = "", 
      endDate = ""
    } = req.query;
    
    const result = await dashboardService.getPerformanceMetrics({
      period,
      startDate,
      endDate
    });
    
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    handleDashboardError(error, res);
  }
};
