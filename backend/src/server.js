// Load environment variables first
require("dotenv").config();

const app = require("./app");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const PORT = process.env.PORT || 5000;
app.listen(PORT, (err) => {
  if (err) {
  } else {
  }
});
module.exports = app; // Export the app for testing purposes
