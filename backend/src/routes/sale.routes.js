const express = require("express");
const router = express.Router();
const saleController = require("../controller/sale.controller");
const {
  validateCreateSale,
  validateUpdateSale,
  validateSaleId,
  validateSaleItems,
} = require("../validators/sale.validator");
const { authenticate, authorize } = require("../middlewares/auth");
const { generalLimiter, strictLimiter, searchLimiter } = require("../middlewares/rateLimiter");

/**
 * @swagger
 * /api/sales:
 *   post:
 *     summary: Create a new sale
 *     tags: [Sales]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - customerId
 *               - products
 *             properties:
 *               customerId:
 *                 type: string
 *                 format: uuid
 *                 description: Customer ID
 *               products:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     productId:
 *                       type: string
 *                       format: uuid
 *                     quantity:
 *                       type: integer
 *                     unitPrice:
 *                       type: number
 *                 description: Array of products to sell
 *               notes:
 *                 type: string
 *                 description: Additional notes for the sale
 *     responses:
 *       201:
 *         description: Sale created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Sale'
 *       400:
 *         description: Bad request - validation error
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /api/sales:
 *   get:
 *     summary: Get all sales with pagination and filtering
 *     tags: [Sales]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of items per page
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, completed, cancelled]
 *         description: Filter by sale status
 *       - in: query
 *         name: customerId
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filter by customer ID
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter sales from this date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter sales until this date
 *     responses:
 *       200:
 *         description: List of sales with pagination
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 sales:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Sale'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     total:
 *                       type: integer
 *                     pages:
 *                       type: integer
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /api/sales/{id}:
 *   get:
 *     summary: Get a sale by ID
 *     tags: [Sales]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Sale ID
 *     responses:
 *       200:
 *         description: Sale details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Sale'
 *       404:
 *         description: Sale not found
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /api/sales/{id}:
 *   put:
 *     summary: Update a sale
 *     tags: [Sales]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Sale ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               customerId:
 *                 type: string
 *                 format: uuid
 *               products:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     productId:
 *                       type: string
 *                       format: uuid
 *                     quantity:
 *                       type: integer
 *                     unitPrice:
 *                       type: number
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Sale updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Sale'
 *       400:
 *         description: Bad request - validation error
 *       404:
 *         description: Sale not found
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /api/sales/{id}/status:
 *   put:
 *     summary: Update sale status
 *     tags: [Sales]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Sale ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [pending, completed, cancelled]
 *                 description: New sale status
 *     responses:
 *       200:
 *         description: Sale status updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Sale'
 *       400:
 *         description: Bad request - validation error
 *       404:
 *         description: Sale not found
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /api/sales/{id}:
 *   delete:
 *     summary: Delete a sale
 *     tags: [Sales]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Sale ID
 *     responses:
 *       200:
 *         description: Sale deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       404:
 *         description: Sale not found
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /api/sales/bulk:
 *   delete:
 *     summary: Delete multiple sales
 *     tags: [Sales]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - saleIds
 *             properties:
 *               saleIds:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: uuid
 *                 description: Array of sale IDs to delete
 *     responses:
 *       200:
 *         description: Sales deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       400:
 *         description: Bad request - validation error
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /api/sales/import:
 *   post:
 *     summary: Import sales from CSV/Excel file
 *     tags: [Sales]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - file
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: CSV or Excel file containing sales data
 *     responses:
 *       200:
 *         description: Sales imported successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 importedCount:
 *                   type: integer
 *                 failedCount:
 *                   type: integer
 *       400:
 *         description: Bad request - invalid file format
 *       401:
 *         description: Unauthorized
 */

// All routes require authentication and rate limiting
router.use(authenticate);
router.use(generalLimiter);

// Create sale (Admin and Staff)
router.post(
  "/",
  authorize("admin", "staff"),
  validateCreateSale,
  validateSaleItems,
  saleController.createSale
);

// Get all sales (Admin and Staff)
router.get(
  "/",
  authorize("admin", "staff"),
  searchLimiter,
  saleController.getAllSales
);

// Get sale by ID (Admin and Staff)
router.get(
  "/:id",
  validateSaleId,
  authorize("admin", "staff"),
  saleController.getSaleById
);

// Update sale (Admin and Staff)
router.put(
  "/:id",
  validateSaleId,
  authorize("admin", "staff"),
  validateUpdateSale,
  saleController.updateSale
);

// Update sale status (Admin and Staff)
router.put(
  "/:id/status",
  validateSaleId,
  authorize("admin", "staff"),
  saleController.updateSaleStatus
);

// Delete sale (Admin-only)
router.delete(
  "/:id",
  validateSaleId,
  authorize("admin"),
  strictLimiter,
  saleController.deleteSale
);

// Bulk delete sales (Admin-only)
router.delete(
  "/bulk",
  authorize("admin"),
  strictLimiter,
  saleController.bulkDeleteSales
);

// Import sales (Admin-only)
router.post(
  "/import",
  authorize("admin"),
  saleController.importSales
);

module.exports = router;
