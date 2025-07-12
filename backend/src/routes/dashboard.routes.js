const express = require("express");
const router = express.Router();
const dashboardController = require("../controller/dashboard.controller");
const { authenticate, authorize } = require("../middlewares/auth");

// All dashboard endpoints require authentication
router.use(authenticate);

// GET /api/dashboard/stats
router.get("/stats", dashboardController.getStats);

// GET /api/dashboard/activities
router.get("/activities", dashboardController.getActivities);

// GET /api/dashboard/low-stock-alerts
router.get("/low-stock-alerts", dashboardController.getLowStockAlerts);

// GET /api/dashboard/revenue-data
router.get("/revenue-data", dashboardController.getRevenueData);

// GET /api/dashboard/product-distribution
router.get("/product-distribution", dashboardController.getProductDistribution);

module.exports = router;
