const express = require("express");
const router = express.Router();
const settingsController = require("../controller/settings.controller");
const { validateUpdateSettings } = require("../validators/settings.validator");

router.put("/", validateUpdateSettings, settingsController.updateSettings);
router.get("/", settingsController.getSettings);
// router.put("/", settingsController.updateSettings);

module.exports = router;
