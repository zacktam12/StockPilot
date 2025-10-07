const express = require("express");
const multer = require("multer");
const router = express.Router();
const settingsController = require("../controller/settings.controller");
const { validateUpdateSettings } = require("../validators/settings.validator");
const { authenticate, authorize } = require("../middlewares/auth");

// Configure multer for file uploads
const upload = multer({
  dest: 'uploads/',
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  },
});

// Get settings (Admin-only)
router.get(
  "/",
  authenticate,
  authorize("admin"),
  settingsController.getSettings
);

// Update settings (Admin-only)
router.put(
  "/",
  authenticate,
  authorize("admin"),
  validateUpdateSettings,
  settingsController.updateSettings
);

// Update company settings (Admin-only)
router.put(
  "/company",
  authenticate,
  authorize("admin"),
  settingsController.updateCompanySettings
);

// Update system settings (Admin-only)
router.put(
  "/system",
  authenticate,
  authorize("admin"),
  settingsController.updateSystemSettings
);


// Update security settings (Admin-only)
router.put(
  "/security",
  authenticate,
  authorize("admin"),
  settingsController.updateSecuritySettings
);

// Update backup settings (Admin-only)
router.put(
  "/backup",
  authenticate,
  authorize("admin"),
  settingsController.updateBackupSettings
);

// Upload company logo (Admin-only)
router.post(
  "/logo",
  authenticate,
  authorize("admin"),
  upload.single('logo'),
  settingsController.uploadLogo
);

// Change password (Authenticated users)
router.post(
  "/change-password",
  authenticate,
  settingsController.changePassword
);

// Download backup (Admin-only)
router.get(
  "/backup/download",
  authenticate,
  authorize("admin"),
  settingsController.downloadBackup
);

// Reset settings to default (Admin-only)
router.post(
  "/reset",
  authenticate,
  authorize("admin"),
  settingsController.resetSettings
);

// Test email configuration (Admin-only)
router.post(
  "/test-email",
  authenticate,
  authorize("admin"),
  settingsController.testEmailConfig
);

// Get system information (Admin-only)
router.get(
  "/system-info",
  authenticate,
  authorize("admin"),
  settingsController.getSystemInfo
);

// Get public statistics (no auth required)
router.get(
  "/public-stats",
  settingsController.getPublicStats
);

module.exports = router;
