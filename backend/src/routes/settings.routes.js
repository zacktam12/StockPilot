const express = require("express");
const router = express.Router();
const settingsController = require("../controller/settings.controller");
const { validateUpdateSettings } = require("../validators/settings.validator");
const { authenticate, authorize } = require("../middlewares/auth");

router.put(
  "/",
  authenticate,
  authorize("admin"),
  validateUpdateSettings,
  settingsController.updateSettings
);
router.get(
  "/",
  authenticate,
  authorize("admin"),
  settingsController.getSettings
);

module.exports = router;
