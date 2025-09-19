const express = require("express");
const router = express.Router();
const dashboardController = require("../controller/dashboard.controller");
const { authenticate, authorize } = require("../middlewares/auth");
const { generalLimiter, searchLimiter } = require("../middlewares/rateLimiter");

/**
 * @swagger
 * /api/dashboard/stats:
 *   get:
 *     summary: Get dashboard statistics overview
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard statistics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalProducts:
 *                   type: integer
 *                   description: Total number of products
 *                 totalCustomers:
 *                   type: integer
 *                   description: Total number of customers
 *                 totalSales:
 *                   type: integer
 *                   description: Total number of sales
 *                 totalRevenue:
 *                   type: number
 *                   description: Total revenue
 *                 lowStockProducts:
 *                   type: integer
 *                   description: Number of products with low stock
 *                 pendingOrders:
 *                   type: integer
 *                   description: Number of pending orders
 *                 todaySales:
 *                   type: number
 *                   description: Today's sales revenue
 *                 monthlyRevenue:
 *                   type: number
 *                   description: Current month's revenue
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /api/dashboard/activities:
 *   get:
 *     summary: Get recent activities/transactions
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of activities to return
 *     responses:
 *       200:
 *         description: Recent activities
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 activities:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         format: uuid
 *                       type:
 *                         type: string
 *                         enum: [sale, purchase, product_added, product_updated]
 *                       description:
 *                         type: string
 *                       timestamp:
 *                         type: string
 *                         format: date-time
 *                       user:
 *                         type: string
 *                         description: User who performed the activity
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /api/dashboard/low-stock-alerts:
 *   get:
 *     summary: Get products with low stock alerts
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: threshold
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Stock threshold for alerts
 *     responses:
 *       200:
 *         description: Low stock products
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 alerts:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       productId:
 *                         type: string
 *                         format: uuid
 *                       productName:
 *                         type: string
 *                       currentStock:
 *                         type: integer
 *                       threshold:
 *                         type: integer
 *                       urgency:
 *                         type: string
 *                         enum: [low, critical, out_of_stock]
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /api/dashboard/revenue-data:
 *   get:
 *     summary: Get revenue data for charts
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [daily, weekly, monthly, yearly]
 *           default: monthly
 *         description: Time period for revenue data
 *       - in: query
 *         name: months
 *         schema:
 *           type: integer
 *           default: 12
 *         description: Number of months to include
 *     responses:
 *       200:
 *         description: Revenue data for charts
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 labels:
 *                   type: array
 *                   items:
 *                     type: string
 *                   description: Time period labels
 *                 revenue:
 *                   type: array
 *                   items:
 *                     type: number
 *                   description: Revenue values
 *                 sales:
 *                   type: array
 *                   items:
 *                     type: integer
 *                   description: Number of sales
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /api/dashboard/product-distribution:
 *   get:
 *     summary: Get product distribution by category
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Product distribution data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 distribution:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       categoryId:
 *                         type: string
 *                         format: uuid
 *                       categoryName:
 *                         type: string
 *                       productCount:
 *                         type: integer
 *                       totalValue:
 *                         type: number
 *                       percentage:
 *                         type: number
 *       401:
 *         description: Unauthorized
 */

// All dashboard endpoints require authentication and rate limiting
router.use(authenticate);
router.use(generalLimiter);

// GET /api/dashboard/stats
router.get("/stats", dashboardController.getStats);

// GET /api/dashboard/activities
router.get("/activities", searchLimiter, dashboardController.getActivities);

// GET /api/dashboard/low-stock-alerts
router.get("/low-stock-alerts", searchLimiter, dashboardController.getLowStockAlerts);

// GET /api/dashboard/revenue-data
router.get("/revenue-data", searchLimiter, dashboardController.getRevenueData);

// GET /api/dashboard/product-distribution
router.get("/product-distribution", dashboardController.getProductDistribution);

// GET /api/dashboard/sales-analytics
router.get("/sales-analytics", searchLimiter, dashboardController.getSalesAnalytics);

// GET /api/dashboard/customer-analytics
router.get("/customer-analytics", searchLimiter, dashboardController.getCustomerAnalytics);

// GET /api/dashboard/inventory-analytics
router.get("/inventory-analytics", searchLimiter, dashboardController.getInventoryAnalytics);

// GET /api/dashboard/performance-metrics
router.get("/performance-metrics", searchLimiter, dashboardController.getPerformanceMetrics);

module.exports = router;
