const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is not defined in environment variables");
}

/**
 * Generate a JWT token with user ID and role info
 * @param {Object} user - User object containing at least `id` and `roleId`
 * @returns {string} - Signed JWT token
 */
const generateToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      roleId: user.roleId, // include roleId for reference
    },
    JWT_SECRET,
    {
      expiresIn: "7d",
    }
  );
};

/**
 * Verify a JWT token and return decoded data
 * @param {string} token - JWT token
 * @returns {Object} - Decoded payload
 * @throws {Error} - If token is invalid
 */
const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (err) {
    throw new Error("Invalid or expired token");
  }
};

module.exports = {
  generateToken,
  verifyToken,
};
