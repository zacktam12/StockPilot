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
