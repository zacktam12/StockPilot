const express = require("express");
const router = express.Router();
const userController = require("../controller/user.controller");
const {
  validateRegister,
  validateLogin,
} = require("../validators/user.validator");
// Fix: Import only the authenticate function
const { authenticate } = require("../middlewares/auth");

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
router.post("/register", validateRegister, userController.register);
router.post("/login", validateLogin, userController.login);

module.exports = router;
//multer
// windsurf
