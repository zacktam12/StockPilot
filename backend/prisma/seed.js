const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcrypt");
const prisma = new PrismaClient();

async function main() {
  // Create default settings
  await prisma.settings.upsert({
    where: { id: "1" },
    update: {},
    create: {
      id: "1",
      appName: "Inventory Management System",
      theme: "light",
      lowStockThreshold: 5,
      currency: "USD",
      taxRate: 0,
    },
  });

  // Create default admin role
  const adminRole = await prisma.role.upsert({
    where: { role_type: "admin" },
    update: {},
    create: {
      role_type: "admin",
    },
  });

  // Create default admin user
  const hashedPassword = await bcrypt.hash("admin123", 10);
  await prisma.user.upsert({
    where: { email: "admin@example.com" },
    update: {},
    create: {
      email: "admin@example.com",
      password: hashedPassword,
      firstName: "Admin",
      lastName: "User",
      roleId: adminRole.id,
      status: "Active",
    },
  });

  console.log("Seeded settings, admin role, and admin user.");
  console.log("Admin credentials: admin@example.com / admin123");
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
