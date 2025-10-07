const express = require("express");
const userController = require("../controller/user.controller.js");
const {
  validateRegister,
  validateLogin,
} = require("../validators/user.validator.js");
const { authenticate } = require("../middlewares/auth.js");

// Fix: const  contactAdmin =require(user.controller.js (not auth.controller.js)
const { contactAdmin } = userController;

const router = express.Router();

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: User login
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: User email
 *               password:
 *                 type: string
 *                 description: User password
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   description: JWT token
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: Bad request - validation error
 *       401:
 *         description: Invalid credentials
 */

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: User registration
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *                 description: User full name
 *               email:
 *                 type: string
 *                 format: email
 *                 description: User email
 *               password:
 *                 type: string
 *                 description: User password
 *               role:
 *                 type: string
 *                 enum: [admin, staff]
 *                 default: staff
 *                 description: User role
 *     responses:
 *       201:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       400:
 *         description: Bad request - validation error
 *       409:
 *         description: User already exists
 */

/**
 * @swagger
 * /api/auth/profile:
 *   get:
 *     summary: Get user profile
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile information
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   format: uuid
 *                 name:
 *                   type: string
 *                 email:
 *                   type: string
 *                   format: email
 *                 role:
 *                   type: string
 *                 status:
 *                   type: string
 *       401:
 *         description: Unauthorized
 */

router.get("/profile", authenticate, async (req, res) => {
  // req.user was set by the authenticate middleware
  const { id, name, email, role, status } = req.user;
  res.json({
    id,
    name,
    email,
    role: role.role_type,
    status, // Add status to the response
  });
});

// Update user profile
router.put("/profile", authenticate, userController.updateProfile);

router.post("/register", validateRegister, userController.register);
router.post("/login", validateLogin, userController.login);
router.post("/forgot-password", userController.forgotPassword);
router.post("/login-failed", userController.loginFailed);
router.post("/reset-code-login", userController.resetCodeLogin);
router.post("/reset-password-with-code", userController.resetPasswordWithCode);

// Employee ID verification
router.get("/verify-employee-id/:id", userController.verifyEmployeeId);
// Phone recovery
// router.post("/recover-by-phone", userController.recoverByPhone);
// Admin contact (optional)
router.post("/contact-admin", contactAdmin);

module.exports = router;
//multer
// windsurf
