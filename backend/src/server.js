const app = require("./app");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const PORT = process.env.PORT || 3000;
app.listen(PORT, (err) => {
  if (err) {
    console.log(err.message);
  } else {
    console.log(`Server running at ${PORT}`);
  }
});
module.exports = app; // Export the app for testing purposes
