const express = require("express");
const router = express.Router();
const userController = require("../controller/user.controller");
const {
  validateRegister,
  validateLogin,
  validateUpdateUser,
} = require("../validators/user.validator");

// Register user
router.post("/", validateRegister, userController.createUser);
// Login route (if you implement auth)
// router.post("/login", validateLogin, userController.loginUser);
// Update user
router.put("/:id", validateUpdateUser, userController.updateUser);
router.get("/", userController.getAllUsers);
router.get("/:id", userController.getUserById);
router.put("/:id", userController.updateUser);
router.delete("/:id", userController.deleteUser);

module.exports = router;
