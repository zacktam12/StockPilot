const express = require("express");
const router = express.Router();
const roleController = require("../controller/role.controller");
const {
  validateCreateRole,
  validateUpdateRole,
} = require("../validators/role.validator");

router.post("/", validateCreateRole, roleController.createRole);
router.put("/:id", validateUpdateRole, roleController.updateRole);
// router.post("/", roleController.createRole);
router.get("/", roleController.getAllRoles);
router.get("/:id", roleController.getRoleById);
router.put("/:id", roleController.updateRole);
router.delete("/:id", roleController.deleteRole);

module.exports = router;
