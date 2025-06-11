const { verifyToken } = require("../config/jwt");
const { prisma } = require("../config/db");

const authenticate = async (req, res, next) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");
    if (!token) return res.status(401).json({ message: "No token provided" });

    const decoded = verifyToken(token);
    const user = await prisma.user.findUnique({
      where: { id: decoded.id, isDeleted: false },
      include: { role: true },
    });

    if (!user) return res.status(401).json({ message: "User not found" });
    if (user.isDeleted) {
      return res.status(401).json({ message: "User account is deleted" });
    }
    req.user = user;
    next();
  } catch (err) {
    res.status(401).json({ message: "Invalid token" });
  }
};

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
