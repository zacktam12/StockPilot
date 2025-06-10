const logger = require("../utils/logger");

const errorHandler = (err, req, res, next) => {
  logger.error("Error occurred:", {
    error: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get("User-Agent"),
  });

  // Prisma errors
  if (err.code === "P2002") {
    return res.status(400).json({
      success: false,
      message: "Duplicate entry. This record already exists.",
      error: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }

  if (err.code === "P2025") {
    return res.status(404).json({
      success: false,
      message: "Record not found.",
      error: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }

  // Validation errors
  if (err.name === "ValidationError") {
    return res.status(400).json({
      success: false,
      message: "Validation error",
      errors: err.details?.map((detail) => detail.message) || [err.message],
    });
  }

  // JWT errors
  if (err.name === "JsonWebTokenError") {
    return res.status(401).json({
      success: false,
      message: "Invalid token",
    });
  }

  if (err.name === "TokenExpiredError") {
    return res.status(401).json({
      success: false,
      message: "Token expired",
    });
  }

  // Default error
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal server error",
    error: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });
};

const notFound = (req, res, next) => {
  if (req.originalUrl.startsWith("/socket.io")) {
    // Skip logging and just end the response
    return res.status(204).end();
  }

  const error = new Error(`Not found - ${req.originalUrl}`);
  error.status = 404;
  next(error);
};

module.exports = {
  errorHandler,
  notFound,
};
