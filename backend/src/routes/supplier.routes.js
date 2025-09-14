const express = require("express");
const router = express.Router();
const supplierController = require("../controller/supplier.controller");
const { authenticate } = require("../middlewares/auth");
const {
  validateCreateSupplier,
  validateUpdateSupplier,
  validateSupplierId,
} = require("../validators/supplier.validator");
const { generalLimiter, strictLimiter, uploadLimiter, searchLimiter } = require("../middlewares/rateLimiter");

/**
 * @swagger
 * /api/suppliers:
 *   get:
 *     summary: Get all suppliers with pagination and filtering
 *     tags: [Suppliers]
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
 *         description: Search term for supplier name or email
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
 *         description: List of suppliers with pagination
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 suppliers:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Supplier'
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
 * /api/suppliers:
 *   post:
 *     summary: Create a new supplier
 *     tags: [Suppliers]
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
 *                 description: Supplier company name
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Supplier email address
 *               phone:
 *                 type: string
 *                 description: Supplier phone number
 *               address:
 *                 type: string
 *                 description: Supplier address
 *               contactPerson:
 *                 type: string
 *                 description: Contact person name
 *               notes:
 *                 type: string
 *                 description: Additional notes about the supplier
 *     responses:
 *       201:
 *         description: Supplier created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Supplier'
 *       400:
 *         description: Bad request - validation error
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /api/suppliers/{id}:
 *   get:
 *     summary: Get a supplier by ID
 *     tags: [Suppliers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Supplier ID
 *     responses:
 *       200:
 *         description: Supplier details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Supplier'
 *       404:
 *         description: Supplier not found
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /api/suppliers/{id}:
 *   put:
 *     summary: Update a supplier
 *     tags: [Suppliers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Supplier ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Supplier company name
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Supplier email address
 *               phone:
 *                 type: string
 *                 description: Supplier phone number
 *               address:
 *                 type: string
 *                 description: Supplier address
 *               contactPerson:
 *                 type: string
 *                 description: Contact person name
 *               notes:
 *                 type: string
 *                 description: Additional notes about the supplier
 *     responses:
 *       200:
 *         description: Supplier updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Supplier'
 *       400:
 *         description: Bad request - validation error
 *       404:
 *         description: Supplier not found
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /api/suppliers/{id}:
 *   delete:
 *     summary: Delete a supplier
 *     tags: [Suppliers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Supplier ID
 *     responses:
 *       200:
 *         description: Supplier deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       404:
 *         description: Supplier not found
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /api/suppliers/bulk-delete:
 *   post:
 *     summary: Delete multiple suppliers
 *     tags: [Suppliers]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - supplierIds
 *             properties:
 *               supplierIds:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: uuid
 *                 description: Array of supplier IDs to delete
 *     responses:
 *       200:
 *         description: Suppliers deleted successfully
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
 * /api/suppliers/bulk-update:
 *   post:
 *     summary: Update multiple suppliers
 *     tags: [Suppliers]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - supplierIds
 *               - updateData
 *             properties:
 *               supplierIds:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: uuid
 *                 description: Array of supplier IDs to update
 *               updateData:
 *                 type: object
 *                 properties:
 *                   notes:
 *                     type: string
 *                     description: Notes to update for all suppliers
 *     responses:
 *       200:
 *         description: Suppliers updated successfully
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
 * /api/suppliers/import:
 *   post:
 *     summary: Import suppliers from CSV/Excel file
 *     tags: [Suppliers]
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
 *                 description: CSV or Excel file containing supplier data
 *     responses:
 *       200:
 *         description: Suppliers imported successfully
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

/**
 * @swagger
 * /api/suppliers/export:
 *   get:
 *     summary: Export suppliers to CSV/Excel file
 *     tags: [Suppliers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: format
 *         schema:
 *           type: string
 *           enum: [csv, excel]
 *           default: csv
 *         description: Export format
 *     responses:
 *       200:
 *         description: Suppliers exported successfully
 *         content:
 *           application/octet-stream:
 *             schema:
 *               type: string
 *               format: binary
 *       401:
 *         description: Unauthorized
 */

// All routes require authentication and rate limiting
router.use(authenticate);
router.use(generalLimiter);

// Search operations (more lenient rate limiting)
router.get("/", searchLimiter, supplierController.getAllSuppliers);

// CRUD operations
router.get("/:id", validateSupplierId, supplierController.getSupplierById);
router.post("/", validateCreateSupplier, supplierController.createSupplier);
router.put("/:id", validateSupplierId, validateUpdateSupplier, supplierController.updateSupplier);

// Strict rate limiting for delete operations
router.delete("/:id", validateSupplierId, strictLimiter, supplierController.deleteSupplier);

// Bulk operations (strict rate limiting)
router.post("/bulk-delete", strictLimiter, supplierController.bulkDeleteSuppliers);
router.post("/bulk-update", strictLimiter, supplierController.bulkUpdateSuppliers);

// Import/Export operations
router.post("/import", uploadLimiter, supplierController.importSuppliers);
router.get("/export", supplierController.exportSuppliers);

module.exports = router;
