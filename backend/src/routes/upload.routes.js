const express = require("express");
const router = express.Router();
const upload = require("../services/upload.service"); // path to your upload.service.js

// Single file upload
router.post("/upload", upload.single("image"), (req, res) => {
  // req.file contains info about uploaded file
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  // Construct the full URL for the uploaded image
  const baseUrl = process.env.BACKEND_URL || "http://localhost:5000";
  const imageUrl = `${baseUrl}/uploads/${req.file.filename}`;

  res.json({
    success: true,
    imageUrl: imageUrl,
    filename: req.file.filename,
    path: req.file.path,
  });
});

module.exports = router;
