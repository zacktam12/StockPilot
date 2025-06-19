const express = require("express");
const router = express.Router();
const userController = require("../controller/user.controller");
const {
  validateRegister,
  validateUpdateUser,
} = require("../validators/user.validator");
const { authenticate, authorize } = require("../middlewares/auth");

// Register user (Admin-only)
router.post(
  "/",
  authenticate,
  authorize("admin"),
  validateRegister,
  userController.createUser
);

// Update user (Admin-only)
router.put(
  "/:id",
  authenticate,
  authorize("admin"),
  validateUpdateUser,
  userController.updateUser
);

// Get all users (Admin-only)
router.get("/", authenticate, authorize("admin"), userController.getAllUsers);

// Get user by ID (Admin-only)
router.get(
  "/:id",
  authenticate,
  authorize("admin"),
  userController.getUserById
);

// Soft delete user (Admin-only)
router.delete(
  "/:id",
  authenticate,
  authorize("admin"),
  userController.deleteUser
);

module.exports = router;
