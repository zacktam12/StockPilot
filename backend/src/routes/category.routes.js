const express = require("express");
const router = express.Router();
const categoryController = require("../controller/category.controller");
const {
  validateCreateCategory,
  validateUpdateCategory,
  validateCategoryId,
  validateCategoryNameUniqueness,
  validateSlugUniqueness,
  validateParentCategory,
} = require("../validators/category.validator");
const { authenticate, authorize } = require("../middlewares/auth");
const { generalLimiter, strictLimiter, searchLimiter } = require("../middlewares/rateLimiter");

/**
 * @swagger
 * /api/categories:
 *   get:
 *     summary: Get all categories
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all categories
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Category'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Insufficient permissions
 */

/**
 * @swagger
 * /api/categories:
 *   post:
 *     summary: Create a new category
 *     tags: [Categories]
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
 *             properties:
 *               name:
 *                 type: string
 *                 description: Category name
 *               description:
 *                 type: string
 *                 description: Category description
 *     responses:
 *       201:
 *         description: Category created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Category'
 *       400:
 *         description: Bad request - validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 */

/**
 * @swagger
 * /api/categories/{id}:
 *   get:
 *     summary: Get a category by ID
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Category ID
 *     responses:
 *       200:
 *         description: Category details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Category'
 *       404:
 *         description: Category not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Insufficient permissions
 */

// All routes require authentication and rate limiting
router.use(authenticate);
router.use(generalLimiter);

// Bulk import categories (Admin-only)
router.post(
  "/bulk",
  authorize("admin"),
  categoryController.bulkImportCategories
);

// Create category (Admin-only)
router.post(
  "/",
  authorize("admin"),
  validateCreateCategory,
  validateCategoryNameUniqueness,
  validateSlugUniqueness,
  validateParentCategory,
  categoryController.createCategory
);

// Update category (Admin and Staff)
router.put(
  "/:id",
  validateCategoryId,
  authorize("admin", "staff"),
  validateUpdateCategory,
  validateCategoryNameUniqueness,
  validateSlugUniqueness,
  validateParentCategory,
  categoryController.updateCategory
);

// Get all categories (Admin and Staff)
router.get(
  "/",
  authorize("admin", "staff"),
  searchLimiter,
  categoryController.getAllCategories
);

// Get category by ID (Admin and Staff)
router.get(
  "/:id",
  validateCategoryId,
  authorize("admin", "staff"),
  categoryController.getCategoryById
);

// Soft delete category (Admin-only)
router.delete(
  "/:id",
  validateCategoryId,
  authorize("admin"),
  strictLimiter,
  categoryController.deleteCategory
);

module.exports = router;
