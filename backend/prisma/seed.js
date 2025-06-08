const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  await prisma.settings.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      appName: "Inventory Management System",
      theme: "light",
      lowStockThreshold: 5,
      currency: "USD",
      taxRate: 0,
    },
  });

  console.log("Seeded settings.");
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
