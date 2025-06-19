const express = require("express");
const router = express.Router();
const roleController = require("../controller/role.controller");
const {
  validateCreateRole,
  validateUpdateRole,
} = require("../validators/role.validator");
const { authenticate, authorize } = require("../middlewares/auth");

// Create role (Admin-only)
router.post(
  "/",
  authenticate,
  authorize("admin"),
  validateCreateRole,
  roleController.createRole
);

// Update role (Admin-only)
router.put(
  "/:id",
  authenticate,
  authorize("admin"),
  validateUpdateRole,
  roleController.updateRole
);

// Get all roles (Admin-only)
router.get("/", authenticate, authorize("admin"), roleController.getAllRoles);

// Get role by ID (Admin-only)
router.get(
  "/:id",
  authenticate,
  authorize("admin"),
  roleController.getRoleById
);

// Soft delete role (Admin-only)
router.delete(
  "/:id",
  authenticate,
  authorize("admin"),
  roleController.deleteRole
);

module.exports = router;
