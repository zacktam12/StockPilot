const express = require("express");
const router = express.Router();
const userController = require("../controller/user.controller");
const {
  validateRegister,
  validateLogin,
  validateUpdateUser,
} = require("../validators/user.validator");
const { authenticate, authorize } = require("../middlewares/auth");

// Register user
router.post(
  "/",
  authenticate,
  authorize("admin"),
  validateRegister,
  userController.createUser
);

router.put(
  "/:id",
  authenticate,
  authorize("admin"),
  validateUpdateUser,
  userController.updateUser
);
router.get("/", authenticate, authorize("admin"), userController.getAllUsers);
router.get(
  "/:id",
  authenticate,
  authorize("admin"),
  userController.getUserById
);
router.delete(
  "/:id",
  authenticate,
  authorize("admin"),
  userController.deleteUser
);

module.exports = router;
