const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

console.log("Regenerating Prisma client...");

try {
  // Remove the .prisma directory if it exists
  const prismaDir = path.join(__dirname, "node_modules", ".prisma");
  if (fs.existsSync(prismaDir)) {
    console.log("Removing existing .prisma directory...");
    fs.rmSync(prismaDir, { recursive: true, force: true });
  }

  // Generate the client
  console.log("Generating new Prisma client...");
  execSync("npx prisma generate", { stdio: "inherit" });

  console.log("Prisma client regenerated successfully!");
} catch (error) {
  console.error("Error regenerating Prisma client:", error);
}
