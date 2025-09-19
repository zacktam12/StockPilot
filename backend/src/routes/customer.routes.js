const express = require("express");
const router = express.Router();
const customerController = require("../controller/customer.controller");
const { authenticate, authorize } = require("../middlewares/auth");
const {
  validateCreateCustomer,
  validateUpdateCustomer,
  validateCustomerId,
  validateEmailUniqueness,
} = require("../validators/customer.validator");
const { generalLimiter, strictLimiter, uploadLimiter, searchLimiter } = require("../middlewares/rateLimiter");

/**
 * @swagger
 * /api/customers:
 *   post:
 *     summary: Create a new customer
 *     tags: [Customers]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *             properties:
 *               name:
 *                 type: string
 *                 description: Customer full name
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Customer email address
 *               phone:
 *                 type: string
 *                 description: Customer phone number
 *               address:
 *                 type: string
 *                 description: Customer address
 *               notes:
 *                 type: string
 *                 description: Additional notes about the customer
 *     responses:
 *       201:
 *         description: Customer created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Customer'
 *       400:
 *         description: Bad request - validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Insufficient permissions
 */

/**
 * @swagger
 * /api/customers:
 *   get:
 *     summary: Get all customers with pagination and filtering
 *     tags: [Customers]
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
 *         name: search
 *         schema:
 *           type: string
 *         description: Search term for customer name or email
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [name, email, createdAt]
 *           default: createdAt
 *         description: Field to sort by
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *         description: Sort order
 *     responses:
 *       200:
 *         description: List of customers with pagination
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 customers:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Customer'
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
 *       403:
 *         description: Forbidden - Insufficient permissions
 */

/**
 * @swagger
 * /api/customers/{id}:
 *   get:
 *     summary: Get a customer by ID
 *     tags: [Customers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Customer ID
 *     responses:
 *       200:
 *         description: Customer details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Customer'
 *       404:
 *         description: Customer not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Insufficient permissions
 */

/**
 * @swagger
 * /api/customers/{id}:
 *   put:
 *     summary: Update a customer
 *     tags: [Customers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Customer ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Customer full name
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Customer email address
 *               phone:
 *                 type: string
 *                 description: Customer phone number
 *               address:
 *                 type: string
 *                 description: Customer address
 *               notes:
 *                 type: string
 *                 description: Additional notes about the customer
 *     responses:
 *       200:
 *         description: Customer updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Customer'
 *       400:
 *         description: Bad request - validation error
 *       404:
 *         description: Customer not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Insufficient permissions
 */

/**
 * @swagger
 * /api/customers/{id}:
 *   delete:
 *     summary: Delete a customer
 *     tags: [Customers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Customer ID
 *     responses:
 *       200:
 *         description: Customer deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       404:
 *         description: Customer not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 */

/**
 * @swagger
 * /api/customers/bulk:
 *   post:
 *     summary: Import multiple customers from CSV/Excel file
 *     tags: [Customers]
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
 *                 description: CSV or Excel file containing customer data
 *     responses:
 *       200:
 *         description: Customers imported successfully
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
 *       403:
 *         description: Forbidden - Admin access required
 */

/**
 * @swagger
 * /api/customers/bulk:
 *   delete:
 *     summary: Delete multiple customers
 *     tags: [Customers]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - customerIds
 *             properties:
 *               customerIds:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: uuid
 *                 description: Array of customer IDs to delete
 *     responses:
 *       200:
 *         description: Customers deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       400:
 *         description: Bad request - validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 */

// All routes require authentication and rate limiting
router.use(authenticate);
router.use(generalLimiter);

// Create customer (Admin and Staff)
router.post(
  "/",
  authorize("admin", "staff"),
  validateCreateCustomer,
  validateEmailUniqueness,
  customerController.create
);

// Get all customers (Admin and Staff)
router.get(
  "/",
  authorize("admin", "staff"),
  searchLimiter,
  customerController.getAll
);

// Get customer by ID (Admin and Staff)
router.get(
  "/:id",
  validateCustomerId,
  authorize("admin", "staff"),
  customerController.getById
);

// Update customer (Admin and Staff)
router.put(
  "/:id",
  validateCustomerId,
  authorize("admin", "staff"),
  validateUpdateCustomer,
  validateEmailUniqueness,
  customerController.update
);

// Delete customer (Admin-only)
router.delete(
  "/:id",
  validateCustomerId,
  authorize("admin"),
  strictLimiter,
  customerController.delete
);

// Bulk import customers (Admin-only)
router.post(
  "/bulk",
  authorize("admin"),
  uploadLimiter,
  customerController.bulkImportCustomers
);

// Bulk delete customers (Admin-only)
router.delete(
  "/bulk",
  authorize("admin"),
  strictLimiter,
  customerController.bulkDeleteCustomers
);

module.exports = router;
