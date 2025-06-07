// app.js
const express = require("express");
const { PrismaClient } = require("@prisma/client");
const productRoutes = require("./routes/product.routes");

const app = express();
const prisma = new PrismaClient();

app.get("/", async (req, res) => {
  res.json({ message: "API is working!" });
});

app.use(express.json());
app.use("/api/products", productRoutes);

// Export app for use in server.js
module.exports = app;
