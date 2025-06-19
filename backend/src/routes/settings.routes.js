const express = require("express");
const router = express.Router();
const settingsController = require("../controller/settings.controller");
const { validateUpdateSettings } = require("../validators/settings.validator");
const { authenticate, authorize } = require("../middlewares/auth");

// Update settings (Admin-only)
router.put(
  "/",
  authenticate,
  authorize("admin"),
  validateUpdateSettings,
  settingsController.updateSettings
);

// Get settings (Admin-only)
router.get(
  "/",
  authenticate,
  authorize("admin"),
  settingsController.getSettings
);

module.exports = router;
