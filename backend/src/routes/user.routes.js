const express = require("express");
const router = express.Router();
const userController = require("../controller/user.controller");
const {
  validateRegister,
  validateUpdateUser,
  validatePasswordReset,
  validatePasswordUpdate,
  validateUserId,
  validateEmailUniqueness,
  validateEmployeeIdUniqueness,
} = require("../validators/user.validator");
const { authenticate, authorize } = require("../middlewares/auth");
const upload = require("../services/upload.service");
const { generalLimiter, strictLimiter, authLimiter, searchLimiter } = require("../middlewares/rateLimiter");

/**
 * @swagger
 * /api/users:
 *   post:
 *     summary: Create a new user (Admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - firstName
 *               - email
 *               - password
 *               - roleId
 *             properties:
 *               firstName:
 *                 type: string
 *                 description: User first name
 *               lastName:
 *                 type: string
 *                 description: User last name
 *               email:
 *                 type: string
 *                 format: email
 *                 description: User email address
 *               password:
 *                 type: string
 *                 minLength: 6
 *                 description: User password
 *               phone:
 *                 type: string
 *                 description: User phone number
 *               roleId:
 *                 type: string
 *                 format: uuid
 *                 description: Role ID (use admin or staff role ID)
 *               status:
 *                 type: string
 *                 enum: [Active, Inactive, Deactivated, Banned]
 *                 default: Active
 *                 description: User status
 *     responses:
 *       201:
 *         description: User created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       400:
 *         description: Bad request - validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 */

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Get all users (Admin only)
 *     tags: [Users]
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
 *         description: Search term for user name or email
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *           enum: [admin, staff]
 *         description: Filter by user role
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: boolean
 *         description: Filter by active status
 *     responses:
 *       200:
 *         description: List of users with pagination
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 users:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/User'
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
 *         description: Forbidden - Admin access required
 */

/**
 * @swagger
 * /api/users/me:
 *   get:
 *     summary: Get current user profile
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Current user profile
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /api/users/me:
 *   put:
 *     summary: Update current user profile
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: User full name
 *               email:
 *                 type: string
 *                 format: email
 *                 description: User email address
 *               currentPassword:
 *                 type: string
 *                 description: Current password (required for email/password changes)
 *               newPassword:
 *                 type: string
 *                 minLength: 6
 *                 description: New password
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       400:
 *         description: Bad request - validation error
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /api/users/me/profile-picture:
 *   post:
 *     summary: Upload profile picture
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - profilePicture
 *             properties:
 *               profilePicture:
 *                 type: string
 *                 format: binary
 *                 description: Profile picture image file
 *     responses:
 *       200:
 *         description: Profile picture uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *                 imageUrl:
 *                   type: string
 *                   description: URL of the uploaded image
 *       400:
 *         description: Bad request - no file uploaded
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     summary: Get user by ID (Admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: User ID
 *     responses:
 *       200:
 *         description: User details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       404:
 *         description: User not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 */

/**
 * @swagger
 * /api/users/{id}:
 *   put:
 *     summary: Update user by ID (Admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: User ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: User full name
 *               email:
 *                 type: string
 *                 format: email
 *                 description: User email address
 *               password:
 *                 type: string
 *                 minLength: 6
 *                 description: New password
 *               role:
 *                 type: string
 *                 enum: [admin, staff]
 *                 description: User role
 *               isActive:
 *                 type: boolean
 *                 description: Whether user is active
 *     responses:
 *       200:
 *         description: User updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       400:
 *         description: Bad request - validation error
 *       404:
 *         description: User not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 */

/**
 * @swagger
 * /api/users/{id}:
 *   delete:
 *     summary: Delete user by ID (Admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: User ID
 *     responses:
 *       200:
 *         description: User deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       404:
 *         description: User not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 */

/**
 * @swagger
 * /api/users/import:
 *   post:
 *     summary: Import users from CSV/Excel file (Admin only)
 *     tags: [Users]
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
 *                 description: CSV or Excel file containing user data
 *     responses:
 *       200:
 *         description: Users imported successfully
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

// All routes require authentication and rate limiting
router.use(authenticate);
router.use(generalLimiter);

// Register user (Admin-only)
router.post(
  "/",
  authorize("admin"),
  validateRegister,
  validateEmailUniqueness,
  validateEmployeeIdUniqueness,
  userController.createUser
);

// Update user (Admin-only)
router.put(
  "/:id",
  (req, res, next) => {
    next();
  },
  validateUserId,
  authorize("admin"),
  validateUpdateUser,
  userController.updateUser
);

// Get current user profile (authenticated user)
router.get("/me", (req, res) => {
  // Remove sensitive fields if needed
  const { password, ...userWithoutPassword } = req.user;
  res.json({ success: true, data: userWithoutPassword });
});

// Update current user profile (authenticated user)
router.put("/me", validateUpdateUser, userController.updateCurrentUser);

// Change password (authenticated user)
router.put("/me/change-password", validatePasswordUpdate, userController.changePassword);

// Upload profile picture (authenticated user)
router.post(
  "/me/profile-picture",
  authenticate,
  upload.single("profilePicture"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res
          .status(400)
          .json({ success: false, message: "No file uploaded" });
      }

      // Construct the full URL for the uploaded image
      const baseUrl = process.env.BACKEND_URL || "http://localhost:5000";
      const imageUrl = `${baseUrl}/uploads/${req.file.filename}`;
      // Update user's profile picture in database
      const { prisma } = require("../config/db");
      const updatedUser = await prisma.user.update({
        where: { id: req.user.id },
        data: { profilePicture: imageUrl },
        include: { role: true },
      });
      // Remove password from response
      const { password, ...userWithoutPassword } = updatedUser;

      res.json({
        success: true,
        message: "Profile picture updated successfully",
        data: userWithoutPassword,
        imageUrl: imageUrl,
      });
    } catch (error) {
      console.error("Error updating profile picture:", error);
      console.error("Error stack:", error.stack);
      res.status(500).json({
        success: false,
        message: "Failed to update profile picture",
        error: error.message,
      });
    }
  }
);

// Get all users (Admin-only)
router.get(
  "/",
  authorize("admin"),
  searchLimiter,
  userController.getAllUsers
);

// Get user by ID (Admin-only)
router.get(
  "/:id",
  validateUserId,
  authorize("admin"),
  userController.getUserById
);

// Soft delete user (Admin-only)
router.delete(
  "/:id",
  validateUserId,
  authorize("admin"),
  strictLimiter,
  userController.deleteUser
);

// Reactivate user (Admin-only)
router.put(
  "/:id/reactivate",
  validateUserId,
  authorize("admin"),
  userController.reactivateUser
);

// Import users from CSV (Admin-only)
router.post(
  "/import",
  authorize("admin"),
  userController.importUsers
);

module.exports = router;
