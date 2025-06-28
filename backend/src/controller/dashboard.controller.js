const dashboardService = require("../services/dashboard.service");

// GET /api/dashboard/stats
exports.getStats = async (req, res, next) => {
  try {
    const stats = await dashboardService.getStats();
    res.json(stats);
  } catch (error) {
    next(error);
  }
};

// GET /api/dashboard/activities
exports.getActivities = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const activities = await dashboardService.getActivities(
      Number(page),
      Number(limit)
    );
    res.json(activities);
  } catch (error) {
    next(error);
  }
};

// GET /api/dashboard/low-stock-alerts
exports.getLowStockAlerts = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const alerts = await dashboardService.getLowStockAlerts(
      Number(page),
      Number(limit)
    );
    res.json(alerts);
  } catch (error) {
    next(error);
  }
};

// GET /api/dashboard/revenue-data
exports.getRevenueData = async (req, res, next) => {
  try {
    const { range = "monthly" } = req.query;
    const data = await dashboardService.getRevenueData(range);
    res.json(data);
  } catch (error) {
    next(error);
  }
};
