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

  // Create sample categories
  const electronicsCategory = await prisma.category.upsert({
    where: { name: "Electronics" },
    update: {},
    create: {
      name: "Electronics",
      description: "Electronic devices and accessories",
    },
  });

  const clothingCategory = await prisma.category.upsert({
    where: { name: "Clothing" },
    update: {},
    create: {
      name: "Clothing",
      description: "Apparel and fashion items",
    },
  });

  const booksCategory = await prisma.category.upsert({
    where: { name: "Books" },
    update: {},
    create: {
      name: "Books",
      description: "Books and publications",
    },
  });

  // Create sample products (more than 5 to test pagination)
  const sampleProducts = [
    {
      name: "Laptop",
      description: "High-performance laptop",
      sku: "LAP001",
      price: 999.99,
      cost: 800.0,
      quantity: 10,
      minStock: 5,
      maxStock: 20,
      categoryId: electronicsCategory.id,
    },
    {
      name: "Smartphone",
      description: "Latest smartphone model",
      sku: "PHN001",
      price: 699.99,
      cost: 550.0,
      quantity: 15,
      minStock: 8,
      maxStock: 25,
      categoryId: electronicsCategory.id,
    },
    {
      name: "T-Shirt",
      description: "Cotton t-shirt",
      sku: "TSH001",
      price: 19.99,
      cost: 12.0,
      quantity: 50,
      minStock: 20,
      maxStock: 100,
      categoryId: clothingCategory.id,
    },
    {
      name: "Jeans",
      description: "Blue denim jeans",
      sku: "JNS001",
      price: 49.99,
      cost: 30.0,
      quantity: 25,
      minStock: 10,
      maxStock: 50,
      categoryId: clothingCategory.id,
    },
    {
      name: "Programming Book",
      description: "Learn JavaScript programming",
      sku: "BK001",
      price: 29.99,
      cost: 20.0,
      quantity: 30,
      minStock: 15,
      maxStock: 60,
      categoryId: booksCategory.id,
    },
    {
      name: "Headphones",
      description: "Wireless Bluetooth headphones",
      sku: "HP001",
      price: 89.99,
      cost: 60.0,
      quantity: 12,
      minStock: 6,
      maxStock: 30,
      categoryId: electronicsCategory.id,
    },
    {
      name: "Sneakers",
      description: "Comfortable running shoes",
      sku: "SNK001",
      price: 79.99,
      cost: 45.0,
      quantity: 18,
      minStock: 8,
      maxStock: 40,
      categoryId: clothingCategory.id,
    },
    {
      name: "Cookbook",
      description: "Traditional recipes collection",
      sku: "BK002",
      price: 24.99,
      cost: 15.0,
      quantity: 22,
      minStock: 10,
      maxStock: 45,
      categoryId: booksCategory.id,
    },
  ];

  for (const product of sampleProducts) {
    await prisma.product.upsert({
      where: { sku: product.sku },
      update: {},
      create: product,
    });
  }

  console.log(
    "Seeded settings, admin role, admin user, categories, and sample products."
  );
  console.log("Admin credentials: admin@example.com / admin123");
  console.log(
    `Created ${sampleProducts.length} sample products for pagination testing.`
  );
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
