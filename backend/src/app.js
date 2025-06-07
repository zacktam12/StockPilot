// app.js
const express = require("express");
const { PrismaClient } = require("@prisma/client");
const app = express();
const PORT = process.env.PORT || 3000;
app.use(express.json());

const prisma = new PrismaClient();
// Error handling middleware
app.listen(PORT, (err) => {
  if (err) {
    console.log(err.message);
  } else {
    console.log(`Server running at ${PORT}`);
  }
});

// Example route

// app.get("/products", async (req, res) => {
//   const products = await prisma.product.findMany();
//   res.json(products);
// });
