const express = require("express");
const router = express.Router();
const purchaseController = require("../controller/purchase.controller");
const {
  validateCreatePurchase,
  validateUpdatePurchase,
} = require("../validators/purchase.validator");

/**
 * @swagger
 * /api/purchases:
 *   post:
 *     summary: Create a new purchase order
 *     tags: [Purchases]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - supplierId
 *               - products
 *             properties:
 *               supplierId:
 *                 type: string
 *                 format: uuid
 *                 description: Supplier ID
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
 *                 description: Array of products to purchase
 *               notes:
 *                 type: string
 *                 description: Additional notes for the purchase
 *               expectedDeliveryDate:
 *                 type: string
 *                 format: date
 *                 description: Expected delivery date
 *     responses:
 *       201:
 *         description: Purchase order created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Purchase'
 *       400:
 *         description: Bad request - validation error
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /api/purchases:
 *   get:
 *     summary: Get all purchase orders with pagination and filtering
 *     tags: [Purchases]
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
 *           enum: [pending, received, cancelled]
 *         description: Filter by purchase status
 *       - in: query
 *         name: supplierId
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filter by supplier ID
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter purchases from this date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter purchases until this date
 *     responses:
 *       200:
 *         description: List of purchase orders with pagination
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 purchases:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Purchase'
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
 * /api/purchases/{id}:
 *   get:
 *     summary: Get a purchase order by ID
 *     tags: [Purchases]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Purchase order ID
 *     responses:
 *       200:
 *         description: Purchase order details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Purchase'
 *       404:
 *         description: Purchase order not found
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /api/purchases/{id}:
 *   put:
 *     summary: Update a purchase order
 *     tags: [Purchases]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Purchase order ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               supplierId:
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
 *               expectedDeliveryDate:
 *                 type: string
 *                 format: date
 *     responses:
 *       200:
 *         description: Purchase order updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Purchase'
 *       400:
 *         description: Bad request - validation error
 *       404:
 *         description: Purchase order not found
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /api/purchases/{id}:
 *   delete:
 *     summary: Delete a purchase order
 *     tags: [Purchases]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Purchase order ID
 *     responses:
 *       200:
 *         description: Purchase order deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       404:
 *         description: Purchase order not found
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /api/purchases/{id}/status:
 *   patch:
 *     summary: Update purchase order status
 *     tags: [Purchases]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Purchase order ID
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
 *                 enum: [pending, received, cancelled]
 *                 description: New purchase status
 *     responses:
 *       200:
 *         description: Purchase status updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Purchase'
 *       400:
 *         description: Bad request - validation error
 *       404:
 *         description: Purchase order not found
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /api/purchases/import:
 *   post:
 *     summary: Import purchase orders from CSV/Excel file
 *     tags: [Purchases]
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
 *                 description: CSV or Excel file containing purchase data
 *     responses:
 *       200:
 *         description: Purchase orders imported successfully
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

router.post("/", validateCreatePurchase, purchaseController.createPurchase);
router.get("/", purchaseController.getAllPurchases);
router.get("/:id", purchaseController.getPurchaseById);
router.put("/:id", validateUpdatePurchase, purchaseController.updatePurchase);
router.delete("/:id", purchaseController.deletePurchase);
router.post("/import", purchaseController.importPurchases);
router.patch("/:id/status", purchaseController.updatePurchaseStatus);

module.exports = router;
