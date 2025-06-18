// app.js
require("dotenv").config();
const express = require("express");
const { PrismaClient } = require("@prisma/client");
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

const app = express();
app.use(express.json());
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
app.use("/api", authenticate, uploadRoutes);
app.use("/api/auth", authenticate, authRoutes);
app.use("/api/purchases", authenticate, purchaseRoutes);
app.use("/api/roles", authenticaterole, Routes);
app.use("/api/settings", authenticate, settingsRoutes);
app.use("/api/sales", authenticate, saleRoutes);
app.use("/api/categories", authenticate, categoryRoutes);
app.use("/api/products", authenticate, productRoutes);
app.use("/api/users", authenticate, userRoutes);
app.use("/api/product-sales", authenticate, productSaleRoutes);
app.use("/api/product-purchases", authenticate, productPurchaseRoutes);

app.use(notFound);
app.use(errorHandler);
// Export app for use in server.js
module.exports = app;
