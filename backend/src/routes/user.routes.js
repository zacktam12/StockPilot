const express = require("express");
const router = express.Router();
const userController = require("../controller/user.controller");
const {
  validateRegister,
  validateUpdateUser,
} = require("../validators/user.validator");
const { authenticate, authorize } = require("../middlewares/auth");
const upload = require("../services/upload.service");

// Register user (Admin-only)
router.post(
  "/",
  authenticate,
  authorize("admin"),
  validateRegister,
  userController.createUser
);

// Update user (Admin-only)
router.put(
  "/:id",
  authenticate,
  authorize("admin"),
  validateUpdateUser,
  userController.updateUser
);

// Get current user profile (authenticated user)
router.get("/me", authenticate, (req, res) => {
  // Remove sensitive fields if needed
  const { password, ...userWithoutPassword } = req.user;
  res.json({ success: true, data: userWithoutPassword });
});

// Update current user profile (authenticated user)
router.put("/me", authenticate, userController.updateCurrentUser);

// Upload profile picture (authenticated user)
router.post(
  "/me/profile-picture",
  authenticate,
  upload.single("profilePicture"),
  async (req, res) => {
    try {
      console.log("Profile picture upload request received");
      console.log("User ID:", req.user.id);
      console.log("File:", req.file);

      if (!req.file) {
        console.log("No file uploaded");
        return res
          .status(400)
          .json({ success: false, message: "No file uploaded" });
      }

      // Construct the full URL for the uploaded image
      const baseUrl = process.env.BACKEND_URL || "http://localhost:5000";
      const imageUrl = `${baseUrl}/uploads/${req.file.filename}`;
      console.log("Image URL:", imageUrl);

      // Update user's profile picture in database
      const { prisma } = require("../config/db");
      console.log("Updating user with ID:", req.user.id);
      console.log("Setting profilePicture to:", imageUrl);

      const updatedUser = await prisma.user.update({
        where: { id: req.user.id },
        data: { profilePicture: imageUrl },
        include: { role: true },
      });

      console.log("User updated successfully:", updatedUser.id);

      // Remove password from response
      const { password, ...userWithoutPassword } = updatedUser;

      res.json({
        success: true,
        message: "Profile picture updated successfully",
        data: userWithoutPassword,
        imageUrl: imageUrl,
      });
    } catch (error) {
      console.error("Error updating profile picture:", error);
      console.error("Error stack:", error.stack);
      res.status(500).json({
        success: false,
        message: "Failed to update profile picture",
        error: error.message,
      });
    }
  }
);

// Get all users (Admin-only)
router.get("/", authenticate, authorize("admin"), userController.getAllUsers);

// Get user by ID (Admin-only)
router.get(
  "/:id",
  authenticate,
  authorize("admin"),
  userController.getUserById
);

// Soft delete user (Admin-only)
router.delete(
  "/:id",
  authenticate,
  authorize("admin"),
  userController.deleteUser
);

// Import users from CSV (Admin-only)
router.post(
  "/import",
  authenticate,
  authorize("admin"),
  userController.importUsers
);

module.exports = router;
