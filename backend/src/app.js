// app.js
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { PrismaClient } = require("@prisma/client");

// CORS configuration
const corsOptions = {
  origin: process.env.FRONTEND_URL || "http://localhost:5500", // Changed from 5173 to 5500
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  exposedHeaders: ["Authorization"],
  maxAge: 3600,
};

const app = express();
app.use(cors(corsOptions));
app.use(express.json());

// Serve static files from uploads directory
app.use("/uploads", express.static("uploads"));

const productRoutes = require("./routes/product.routes");
const userRoutes = require("./routes/user.routes");
const categoryRoutes = require("./routes/category.routes");
const saleRoutes = require("./routes/sale.routes");
const purchaseRoutes = require("./routes/purchase.routes");
const roleRoutes = require("./routes/role.routes");
const settingsRoutes = require("./routes/settings.routes");
const productSaleRoutes = require("./routes/productSale.routes");
const productPurchaseRoutes = require("./routes/productPurchase.routes");
const { authenticate } = require("./middlewares/auth");
const authRoutes = require("./routes/auth.routes");
const { errorHandler, notFound } = require("./middlewares/errorHandler");
const uploadRoutes = require("./routes/upload.routes");
const supplierRoutes = require("./routes/supplier.routes");
const dashboardRoutes = require("./routes/dashboard.routes");

// const app = express();
// app.use(express.json());
const prisma = new PrismaClient();

app.get("/", async (req, res) => {
  res.json({ message: "API is working!" });
});

app.get("/protected", authenticate, (req, res) => {
  res.json({ message: "You are authorized", user: req.user });
});

app.get("/api/test-auth", authenticate, (req, res) => {
  res.json({ message: "Authenticated!", user: req.user });
});
app.use("/api/auth", authRoutes);
// protect all routes after this point
app.use(authenticate); // Uncomment if you want to protect all routes by default
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

app.use(notFound);
app.use(errorHandler);
// Export app for use in server.js
module.exports = app;
