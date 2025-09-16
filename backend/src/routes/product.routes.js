const express = require("express");
const router = express.Router();
const productController = require("../controller/product.controller");
const {
  validateCreateProduct,
  validateUpdateProduct,
  validateProductId,
  validateSKUUniqueness,
} = require("../validators/product.validator");
const { authenticate, authorize } = require("../middlewares/auth");
const { generalLimiter, strictLimiter, uploadLimiter, searchLimiter } = require("../middlewares/rateLimiter");

// Create product (Admin-only)
/**
 * @swagger
 * /api/products:
 *   post:
 *     summary: Create a new product
 *     tags: [Products]
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
 *               - price
 *               - stock
 *               - categoryId
 *             properties:
 *               name:
 *                 type: string
 *                 description: Product name
 *               description:
 *                 type: string
 *                 description: Product description
 *               price:
 *                 type: number
 *                 description: Product price
 *               stock:
 *                 type: integer
 *                 description: Initial stock quantity
 *               categoryId:
 *                 type: string
 *                 format: uuid
 *                 description: Category ID
 *               supplierId:
 *                 type: string
 *                 format: uuid
 *                 description: Supplier ID
 *               image:
 *                 type: string
 *                 description: Product image URL
 *     responses:
 *       201:
 *         description: Product created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
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

// Create product (Admin-only)
router.post(
  "/",
  authorize("admin"),
  validateCreateProduct,
  validateSKUUniqueness,
  productController.createProduct
);

// Get all products (Admin and Staff) - with pagination and filtering
/**
 * @swagger
 * /api/products:
 *   get:
 *     summary: Get all products with pagination and filtering
 *     tags: [Products]
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
 *         description: Search term for product name
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter by category ID
 *       - in: query
 *         name: supplier
 *         schema:
 *           type: string
 *         description: Filter by supplier ID
 *     responses:
 *       200:
 *         description: List of products with pagination
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 products:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Product'
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

router.get(
  "/",
  authenticate,
  authorize("admin", "staff"),
  productController.getAllProducts
);

// Get low stock products (Admin and Staff)
router.get(
  "/low-stock",
  authenticate,
  authorize("admin", "staff"),
  productController.getLowStockProducts
);

// Get product by ID (Admin and Staff)
/**
 * @swagger
 * /api/products/{id}:
 *   get:
 *     summary: Get a product by ID
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Product ID
 *     responses:
 *       200:
 *         description: Product details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       404:
 *         description: Product not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Insufficient permissions
 */
router.get(
  "/:id",
  authenticate,
  authorize("admin", "staff"),
  productController.getProductById
);

// Update product (Admin-only)
router.put(
  "/:id",
  authenticate,
  authorize("admin"),
  validateUpdateProduct,
  productController.updateProduct
);

// Update stock (Admin and Staff)
router.patch(
  "/:id/stock",
  authenticate,
  authorize("admin", "staff"),
  productController.updateStock
);

// Increment stock (Admin and Staff)
router.patch(
  "/:id/stock/increment",
  authenticate,
  authorize("admin", "staff"),
  productController.incrementStock
);

// Decrement stock (Admin and Staff)
router.patch(
  "/:id/stock/decrement",
  authenticate,
  authorize("admin", "staff"),
  productController.decrementStock
);

// Delete product (Admin-only)
router.delete(
  "/:id",
  authenticate,
  authorize("admin"),
  productController.deleteProduct
);

// Bulk import products (Admin-only)
router.post(
  "/bulk",
  authenticate,
  authorize("admin"),
  productController.bulkImportProducts
);

// Bulk delete products (Admin-only)
router.delete(
  "/bulk",
  authenticate,
  authorize("admin"),
  productController.bulkDeleteProducts
);

module.exports = router;
