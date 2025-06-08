// app.js
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

const app = express();
const prisma = new PrismaClient();

app.get("/", async (req, res) => {
  res.json({ message: "API is working!" });
});

app.use(express.json());
app.use("/api/purchases", purchaseRoutes);
app.use("/api/roles", roleRoutes);
app.use("/api/settings", settingsRoutes);
app.use("/api/sales", saleRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/products", productRoutes);
app.use("/api/users", userRoutes);
app.use("/api/product-sales", productSaleRoutes);

// Export app for use in server.js
module.exports = app;
