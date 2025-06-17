const express = require("express");
const router = express.Router();
const userController = require("../controller/user.controller");
const {
  validateRegister,
  validateLogin,
} = require("../validators/user.validator");
// const authenticate = require("../middlewares/auth");

// router.get("/profile", authenticate, async (req, res) => {
//   // req.user was set by the authenticate middleware
//   const { id, name, email, role } = req.user;
//   res.json({
//     id,
//     name,
//     email,
//     role: role.role_type,
//   });
// });
router.post("/register", validateRegister, userController.register);
router.post("/login", validateLogin, userController.login);
module.exports = router;
//multer
