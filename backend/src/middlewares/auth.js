const { verifyToken } = require("../config/jwt");
const { prisma } = require("../config/db");
async function authenticate(req, res, next) {
  try {
    const authHeader = req.header("Authorization");
    console.log("🪪 Authorization Header:", authHeader);

    const token = authHeader?.replace("Bearer ", "");
    if (!token) return res.status(401).json({ message: "No token provided" });

    const decoded = verifyToken(token);
    console.log("✅ Token Decoded:", decoded);

    // Convert id to string for Prisma
    const user = await prisma.user.findUnique({
      where: { id: String(decoded.id), status: "Active" },
      include: { role: true },
    });

    if (!user) return res.status(401).json({ message: "User not found" });
    if (user.status !== "Active") {
      return res.status(401).json({ message: "User account is not active" });
    }

    req.user = user;
    next();
  } catch (err) {
    console.error("❌ Token verification failed:", err);
    res.status(401).json({ message: "Invalid token" });
  }
}

const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user)
      return res.status(401).json({ message: "Not authenticated" });

    const userRole = req.user.role.role_type;

    if (!allowedRoles.includes(userRole) && !req.user.isAdmin) {
      return res.status(403).json({ message: "Forbidden: Access denied" });
    }

    next();
  };
};

module.exports = {
  authenticate,
  authorize,
};
