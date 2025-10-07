// token-gen.js
const jwt = require("jsonwebtoken");

const secret = "S3cr3tKey-4-T0k3nS@2025!";
const payload = {
  id: 18,
  email: "j223@example.com",
  isAdmin: false,
};

const token = jwt.sign(payload, secret, { expiresIn: "1h" });
