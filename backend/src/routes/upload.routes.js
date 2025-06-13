const express = require("express");
const router = express.Router();
const upload = require("../services/upload.service"); // path to your upload.service.js

// Single file upload
router.post("/upload", upload.single("file"), (req, res) => {
  // req.file contains info about uploaded file
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  res.json({
    success: true,
    filename: req.file.filename,
    path: req.file.path,
  });
});

module.exports = router;
