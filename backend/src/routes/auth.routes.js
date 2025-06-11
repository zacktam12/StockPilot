const express = require("express");
const router = express.Router();
const userController = require("../controller/user.controller");
const {
  validateRegister,
  validateLogin,
} = require("../validators/user.validator");

router.post("/register", validateRegister, userController.register);
router.post("/login", validateLogin, userController.login);
module.exports = router;
//multer
