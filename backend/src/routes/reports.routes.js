const express = require("express");
const router = express.Router();
const reportsController = require("../controller/reports.controller");

// Existing routes
router.get("/daily-sales", reportsController.dailySales);
router.get("/inventory", reportsController.inventory);
router.get("/purchase-orders", reportsController.purchaseOrders);
router.get("/monthly-revenue", reportsController.monthlyRevenue);
router.get("/top-products", reportsController.topProducts);
router.get("/low-stock", reportsController.lowStock);
router.get("/inventory-value", reportsController.inventoryValue);
router.get("/supplier-analysis", reportsController.supplierAnalysis);

// New report routes
router.get("/customer-sales", reportsController.customerSales);
router.get("/sales-performance", reportsController.salesPerformance);
router.get("/category-analysis", reportsController.categoryAnalysis);
router.get("/stock-movement", reportsController.stockMovement);
router.get("/purchase-trends", reportsController.purchaseTrends);
router.get("/user-activity", reportsController.userActivity);
router.get("/role-distribution", reportsController.roleDistribution);
router.get("/notifications", reportsController.notifications);

module.exports = router;
