const express = require("express");
const router = express.Router();
const roleController = require("../controller/role.controller");
const {
  validateCreateRole,
  validateUpdateRole,
} = require("../validators/role.validator");
const { authenticate, authorize } = require("../middlewares/auth");

router.post(
  "/",
  authenticate,
  authorize("admin"),
  validateCreateRole,
  roleController.createRole
);
router.put(
  "/:id",
  authenticate,
  authorize("admin"),
  validateUpdateRole,
  roleController.updateRole
);
router.get("/", authenticate, authorize("admin"), roleController.getAllRoles);
router.get(
  "/:id",
  authenticate,
  authorize("admin"),
  roleController.getRoleById
);
router.delete(
  "/:id",
  authenticate,
  authorize("admin"),
  roleController.deleteRole
);

module.exports = router;
