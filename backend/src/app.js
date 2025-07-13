// Load environment variables
require("dotenv").config();

// Core dependencies
const express = require("express");
const cors = require("cors");
const { PrismaClient } = require("@prisma/client");

// Swagger dependencies
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./docs/swagger");

// Middleware & utilities
const { authenticate } = require("./middlewares/auth");
const { errorHandler, notFound } = require("./middlewares/errorHandler");

// Routes
const authRoutes = require("./routes/auth.routes");
const productRoutes = require("./routes/product.routes");
const userRoutes = require("./routes/user.routes");
const categoryRoutes = require("./routes/category.routes");
const saleRoutes = require("./routes/sale.routes");
const purchaseRoutes = require("./routes/purchase.routes");
const roleRoutes = require("./routes/role.routes");
const settingsRoutes = require("./routes/settings.routes");
const productSaleRoutes = require("./routes/productSale.routes");
const productPurchaseRoutes = require("./routes/productPurchase.routes");
const uploadRoutes = require("./routes/upload.routes");
const supplierRoutes = require("./routes/supplier.routes");
const dashboardRoutes = require("./routes/dashboard.routes");
const customerRoutes = require("./routes/customer.routes");
const reportsRoutes = require("./routes/reports.routes");
const notificationRoutes = require("./routes/notification.routes");

// Initialize app and database
const app = express();
const prisma = new PrismaClient();

// Swagger docs
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// CORS configuration
const corsOptions = {
  origin: process.env.FRONTEND_URL || "http://localhost:5500", // Adjust based on your frontend port
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization"],
  exposedHeaders: ["Authorization"],
  maxAge: 3600,
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());

// Public static files
app.use("/uploads", express.static("uploads"));

// Public routes
app.get("/", (req, res) => {
  res.json({ message: "API is working!" });
});

app.get("/health", async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({
      status: "healthy",
      message: "Backend is running and database is connected",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Health check failed:", error);
    res.status(500).json({
      status: "unhealthy",
      message: "Database connection failed",
      error: error.message,
    });
  }
});

app.use("/api/auth", authRoutes);

app.get("/protected", authenticate, (req, res) => {
  res.json({ message: "You are authorized", user: req.user });
});

app.get("/api/test-auth", authenticate, (req, res) => {
  res.json({ message: "Authenticated!", user: req.user });
});

// Auth routes (public)

// Protected routes (everything below requires auth)
app.use(authenticate);

app.use("/api", uploadRoutes);
app.use("/api/purchases", purchaseRoutes);
app.use("/api/roles", roleRoutes);
app.use("/api/settings", settingsRoutes);
app.use("/api/sales", saleRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/products", productRoutes);
app.use("/api/users", userRoutes);
app.use("/api/product-sales", productSaleRoutes);
app.use("/api/product-purchases", productPurchaseRoutes);
app.use("/api/suppliers", supplierRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/reports", reportsRoutes);
app.use("/api/notifications", notificationRoutes);

// Error handling
app.use(notFound);
app.use(errorHandler);

// Export app for use in server.js
module.exports = app;
