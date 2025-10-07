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

  // Create default staff role
  const staffRole = await prisma.role.upsert({
    where: { role_type: "staff" },
    update: {},
    create: {
      role_type: "staff",
    },
  });

  // Create sample staff users
  const staffUsers = [
    {
      email: "staff1@example.com",
      password: await bcrypt.hash("staff123", 10),
      firstName: "Staff",
      lastName: "One",
      roleId: staffRole.id,
      status: "Active",
    },
    {
      email: "staff2@example.com",
      password: await bcrypt.hash("staff123", 10),
      firstName: "Staff",
      lastName: "Two",
      roleId: staffRole.id,
      status: "Active",
    },
    {
      email: "staff3@example.com",
      password: await bcrypt.hash("staff123", 10),
      firstName: "Staff",
      lastName: "Three",
      roleId: staffRole.id,
      status: "Active",
    },
  ];
  for (const staff of staffUsers) {
    await prisma.user.upsert({
      where: { email: staff.email },
      update: {},
      create: staff,
    });
  }

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

  // Create sample suppliers
  const sampleSuppliers = [
    {
      name: "Tech Components Inc",
      contactName: "John Smith",
      email: "contact@techcomponents.com",
      phone: "+1-555-0101",
      address: "123 Tech Street, Silicon Valley, CA 94025",
      companyName: "Tech Components Inc"
    },
    {
      name: "Fashion Wholesale Co",
      contactName: "Sarah Johnson",
      email: "orders@fashionwholesale.com",
      phone: "+1-555-0102",
      address: "456 Fashion Ave, New York, NY 10001",
      companyName: "Fashion Wholesale Co"
    },
    {
      name: "Book Distributors Ltd",
      contactName: "Michael Brown",
      email: "sales@bookdistributors.com",
      phone: "+1-555-0103",
      address: "789 Library Lane, Boston, MA 02101",
      companyName: "Book Distributors Ltd"
    },
    {
      name: "Global Electronics",
      contactName: "David Wilson",
      email: "info@globalelectronics.com",
      phone: "+1-555-0104",
      address: "321 Circuit Blvd, Austin, TX 73301",
      companyName: "Global Electronics"
    },
    {
      name: "Textile Imports",
      contactName: "Maria Garcia",
      email: "contact@textileimports.com",
      phone: "+1-555-0105",
      address: "654 Fabric Street, Los Angeles, CA 90001",
      companyName: "Textile Imports"
    },
    {
      name: "Academic Publishers",
      contactName: "Dr. Robert Lee",
      email: "publishing@academicpub.com",
      phone: "+1-555-0106",
      address: "987 Education Drive, Chicago, IL 60601",
      companyName: "Academic Publishers"
    },
    {
      name: "Hardware Supplies",
      contactName: "Tom Anderson",
      email: "sales@hardwaresupplies.com",
      phone: "+1-555-0107",
      address: "147 Tool Road, Detroit, MI 48201",
      companyName: "Hardware Supplies"
    },
    {
      name: "Office Essentials",
      contactName: "Lisa Davis",
      email: "orders@officeessentials.com",
      phone: "+1-555-0108",
      address: "258 Business Park, Seattle, WA 98101",
      companyName: "Office Essentials"
    },
    {
      name: "Local Electronics Store",
      contactName: "James Miller",
      phone: "+1-555-0109",
      address: "369 Main Street, Portland, OR 97201",
      companyName: "Local Electronics Store"
    },
    {
      name: "Quick Supplies",
      contactName: "Jennifer Taylor",
      email: "quick@supplies.com",
      phone: "+1-555-0110",
      companyName: "Quick Supplies"
    }
  ];

  for (const supplier of sampleSuppliers) {
    if (supplier.email) {
      await prisma.supplier.upsert({
        where: { email: supplier.email },
        update: {},
        create: supplier,
      });
    } else {
      // For suppliers without email, check by name
      const existing = await prisma.supplier.findFirst({
        where: { name: supplier.name }
      });
      if (!existing) {
        await prisma.supplier.create({ data: supplier });
      }
    }
  }

  // Create sample customers
  const sampleCustomers = [
    {
      name: "Alice Johnson",
      email: "alice.johnson@email.com",
      phone: "+1-555-0201",
      address: "123 Oak Street, Springfield, IL 62701"
    },
    {
      name: "Bob Smith",
      email: "bob.smith@email.com",
      phone: "+1-555-0202",
      address: "456 Pine Avenue, Portland, OR 97201"
    },
    {
      name: "Carol Davis",
      email: "carol.davis@email.com",
      phone: "+1-555-0203",
      address: "789 Maple Drive, Austin, TX 73301"
    },
    {
      name: "David Wilson",
      email: "david.wilson@email.com",
      phone: "+1-555-0204",
      address: "321 Elm Street, Seattle, WA 98101"
    },
    {
      name: "Emma Brown",
      email: "emma.brown@email.com",
      phone: "+1-555-0205",
      address: "654 Cedar Lane, Denver, CO 80201"
    },
    {
      name: "Frank Miller",
      email: "frank.miller@email.com",
      phone: "+1-555-0206",
      address: "987 Birch Road, Miami, FL 33101"
    },
    {
      name: "Grace Taylor",
      email: "grace.taylor@email.com",
      phone: "+1-555-0207",
      address: "147 Willow Way, Phoenix, AZ 85001"
    },
    {
      name: "Henry Anderson",
      email: "henry.anderson@email.com",
      phone: "+1-555-0208",
      address: "258 Spruce Street, Las Vegas, NV 89101"
    },
    {
      name: "Ivy Martinez",
      phone: "+1-555-0209",
      address: "369 Poplar Avenue, Salt Lake City, UT 84101"
    },
    {
      name: "Jack Thompson",
      email: "jack.thompson@email.com",
      phone: "+1-555-0210",
      address: "741 Ash Boulevard, Kansas City, MO 64101"
    },
    {
      name: "Kate Garcia",
      email: "kate.garcia@email.com",
      address: "852 Hickory Court, Nashville, TN 37201"
    },
    {
      name: "Liam Rodriguez",
      email: "liam.rodriguez@email.com",
      phone: "+1-555-0212",
      address: "963 Dogwood Drive, Raleigh, NC 27601"
    },
    {
      name: "Maya Patel",
      email: "maya.patel@email.com",
      phone: "+1-555-0213",
      address: "159 Sycamore Street, Columbus, OH 43201"
    },
    {
      name: "Noah Kim",
      email: "noah.kim@email.com",
      phone: "+1-555-0214",
      address: "357 Magnolia Lane, Indianapolis, IN 46201"
    },
    {
      name: "Olivia Chen",
      email: "olivia.chen@email.com",
      phone: "+1-555-0215",
      address: "468 Redwood Road, Milwaukee, WI 53201"
    }
  ];

  for (const customer of sampleCustomers) {
    if (customer.email) {
      await prisma.customer.upsert({
        where: { email: customer.email },
        update: {},
        create: customer,
      });
    } else {
      // For customers without email, check by name
      const existing = await prisma.customer.findFirst({
        where: { name: customer.name }
      });
      if (!existing) {
        await prisma.customer.create({ data: customer });
      }
    }
  }

  // Get all users, customers, and products for sales creation
  const users = await prisma.user.findMany();
  const customers = await prisma.customer.findMany();
  const products = await prisma.product.findMany();

  // Create sample sales with various statuses and payment methods
  const sampleSales = [
    {
      userId: users[0].id, // Admin user
      customerId: customers[0]?.id,
      orderNumber: "SO-001",
      totalPrice: 299.97,
      discount: 10.00,
      tax: 23.00,
      paymentMethod: "card",
      status: "completed",
      notes: "Regular customer purchase",
      createdAt: new Date("2024-01-15T10:30:00Z")
    },
    {
      userId: users[0].id,
      customerId: customers[1]?.id,
      orderNumber: "SO-002",
      totalPrice: 149.50,
      discount: 0,
      tax: 12.00,
      paymentMethod: "cash",
      status: "completed",
      notes: "Walk-in customer",
      createdAt: new Date("2024-01-16T14:20:00Z")
    },
    {
      userId: users[1]?.id || users[0].id, // Staff user or admin
      customerId: customers[2]?.id,
      orderNumber: "SO-003",
      totalPrice: 89.99,
      discount: 5.00,
      tax: 6.80,
      paymentMethod: "bank_transfer",
      status: "pending",
      notes: "Pending bank transfer confirmation",
      createdAt: new Date("2024-01-17T09:15:00Z")
    },
    {
      userId: users[0].id,
      customerId: customers[3]?.id,
      orderNumber: "SO-004",
      totalPrice: 450.00,
      discount: 25.00,
      tax: 34.00,
      paymentMethod: "card",
      status: "completed",
      notes: "Bulk order with discount",
      createdAt: new Date("2024-01-18T16:45:00Z")
    },
    {
      userId: users[0].id,
      customerId: customers[4]?.id,
      orderNumber: "SO-005",
      totalPrice: 75.25,
      discount: 0,
      tax: 6.02,
      paymentMethod: "cash",
      status: "completed",
      notes: "Quick sale",
      createdAt: new Date("2024-01-19T11:30:00Z")
    },
    {
      userId: users[1]?.id || users[0].id,
      customerId: customers[5]?.id,
      orderNumber: "SO-006",
      totalPrice: 199.99,
      discount: 15.00,
      tax: 14.80,
      paymentMethod: "check",
      status: "pending",
      notes: "Waiting for check clearance",
      createdAt: new Date("2024-01-20T13:20:00Z")
    },
    {
      userId: users[0].id,
      customerId: customers[6]?.id,
      orderNumber: "SO-007",
      totalPrice: 320.50,
      discount: 0,
      tax: 25.64,
      paymentMethod: "card",
      status: "cancelled",
      notes: "Customer cancelled order",
      createdAt: new Date("2024-01-21T15:10:00Z")
    },
    {
      userId: users[0].id,
      customerId: customers[7]?.id,
      orderNumber: "SO-008",
      totalPrice: 125.75,
      discount: 8.00,
      tax: 9.42,
      paymentMethod: "cash",
      status: "completed",
      notes: "Regular customer",
      createdAt: new Date("2024-01-22T10:45:00Z")
    },
    {
      userId: users[1]?.id || users[0].id,
      customerId: customers[8]?.id,
      orderNumber: "SO-009",
      totalPrice: 89.99,
      discount: 0,
      tax: 7.20,
      paymentMethod: "bank_transfer",
      status: "completed",
      notes: "Online order",
      createdAt: new Date("2024-01-23T08:30:00Z")
    },
    {
      userId: users[0].id,
      customerId: customers[9]?.id,
      orderNumber: "SO-010",
      totalPrice: 275.00,
      discount: 20.00,
      tax: 20.40,
      paymentMethod: "card",
      status: "completed",
      notes: "Corporate purchase",
      createdAt: new Date("2024-01-24T14:15:00Z")
    },
    {
      userId: users[0].id,
      customerId: customers[0]?.id,
      orderNumber: "SO-011",
      totalPrice: 95.50,
      discount: 0,
      tax: 7.64,
      paymentMethod: "cash",
      status: "completed",
      notes: "Repeat customer",
      createdAt: new Date("2024-01-25T12:00:00Z")
    },
    {
      userId: users[1]?.id || users[0].id,
      customerId: customers[1]?.id,
      orderNumber: "SO-012",
      totalPrice: 180.25,
      discount: 12.00,
      tax: 13.46,
      paymentMethod: "card",
      status: "pending",
      notes: "Processing payment",
      createdAt: new Date("2024-01-26T16:30:00Z")
    }
  ];

  // Create sales
  const createdSales = [];
  for (const sale of sampleSales) {
    const createdSale = await prisma.sale.create({
      data: sale
    });
    createdSales.push(createdSale);
  }

  // Create ProductSale entries to link products with sales
  const productSalesData = [
    // Sale 1 - Multiple products
    { saleId: createdSales[0].id, productId: products[0]?.id, sale_quantity: 2, sale_price: 99.99 },
    { saleId: createdSales[0].id, productId: products[1]?.id, sale_quantity: 1, sale_price: 99.99 },
    
    // Sale 2 - Single product
    { saleId: createdSales[1].id, productId: products[2]?.id, sale_quantity: 1, sale_price: 149.50 },
    
    // Sale 3 - Multiple products
    { saleId: createdSales[2].id, productId: products[3]?.id, sale_quantity: 1, sale_price: 89.99 },
    
    // Sale 4 - Bulk order
    { saleId: createdSales[3].id, productId: products[4]?.id, sale_quantity: 3, sale_price: 150.00 },
    
    // Sale 5 - Single product
    { saleId: createdSales[4].id, productId: products[5]?.id, sale_quantity: 1, sale_price: 75.25 },
    
    // Sale 6 - Multiple products
    { saleId: createdSales[5].id, productId: products[6]?.id, sale_quantity: 1, sale_price: 199.99 },
    
    // Sale 7 - Cancelled sale
    { saleId: createdSales[6].id, productId: products[7]?.id, sale_quantity: 2, sale_price: 160.25 },
    
    // Sale 8 - Single product
    { saleId: createdSales[7].id, productId: products[8]?.id, sale_quantity: 1, sale_price: 125.75 },
    
    // Sale 9 - Single product
    { saleId: createdSales[8].id, productId: products[9]?.id, sale_quantity: 1, sale_price: 89.99 },
    
    // Sale 10 - Multiple products
    { saleId: createdSales[9].id, productId: products[0]?.id, sale_quantity: 1, sale_price: 99.99 },
    { saleId: createdSales[9].id, productId: products[1]?.id, sale_quantity: 1, sale_price: 99.99 },
    { saleId: createdSales[9].id, productId: products[2]?.id, sale_quantity: 1, sale_price: 75.02 },
    
    // Sale 11 - Single product
    { saleId: createdSales[10].id, productId: products[3]?.id, sale_quantity: 1, sale_price: 95.50 },
    
    // Sale 12 - Multiple products
    { saleId: createdSales[11].id, productId: products[4]?.id, sale_quantity: 1, sale_price: 99.99 },
    { saleId: createdSales[11].id, productId: products[5]?.id, sale_quantity: 1, sale_price: 80.26 }
  ];

  // Create ProductSale entries
  for (const productSale of productSalesData) {
    if (productSale.productId) {
      await prisma.productSale.create({
        data: productSale
      });
    }
  }

  // Get suppliers for purchase creation
  const suppliers = await prisma.supplier.findMany();

  // Create sample purchases with various statuses
  const samplePurchases = [
    {
      poNumber: "PO-001",
      userId: users[0].id, // Admin user
      supplierId: suppliers[0]?.id,
      totalCost: 1200.00,
      discount: 50.00,
      tax: 92.00,
      status: "received",
      notes: "Electronics components order",
      createdAt: new Date("2024-01-10T09:00:00Z")
    },
    {
      poNumber: "PO-002",
      userId: users[1]?.id || users[0].id, // Staff user or admin
      supplierId: suppliers[1]?.id,
      totalCost: 450.00,
      discount: 0,
      tax: 36.00,
      status: "pending",
      notes: "Fashion items restock",
      createdAt: new Date("2024-01-11T14:30:00Z")
    },
    {
      poNumber: "PO-003",
      userId: users[0].id,
      supplierId: suppliers[2]?.id,
      totalCost: 300.00,
      discount: 15.00,
      tax: 22.80,
      status: "received",
      notes: "Book inventory update",
      createdAt: new Date("2024-01-12T11:15:00Z")
    },
    {
      poNumber: "PO-004",
      userId: users[0].id,
      supplierId: suppliers[3]?.id,
      totalCost: 800.00,
      discount: 40.00,
      tax: 60.80,
      status: "received",
      notes: "Electronics bulk order",
      createdAt: new Date("2024-01-13T16:45:00Z")
    },
    {
      poNumber: "PO-005",
      userId: users[1]?.id || users[0].id,
      supplierId: suppliers[4]?.id,
      totalCost: 250.00,
      discount: 0,
      tax: 20.00,
      status: "pending",
      notes: "Textile materials",
      createdAt: new Date("2024-01-14T10:20:00Z")
    },
    {
      poNumber: "PO-006",
      userId: users[0].id,
      supplierId: suppliers[5]?.id,
      totalCost: 180.00,
      discount: 10.00,
      tax: 13.60,
      status: "received",
      notes: "Academic publications",
      createdAt: new Date("2024-01-15T13:30:00Z")
    },
    {
      poNumber: "PO-007",
      userId: users[0].id,
      supplierId: suppliers[6]?.id,
      totalCost: 350.00,
      discount: 20.00,
      tax: 26.40,
      status: "received",
      notes: "Hardware supplies",
      createdAt: new Date("2024-01-16T08:15:00Z")
    },
    {
      poNumber: "PO-008",
      userId: users[1]?.id || users[0].id,
      supplierId: suppliers[7]?.id,
      totalCost: 120.00,
      discount: 0,
      tax: 9.60,
      status: "pending",
      notes: "Office essentials",
      createdAt: new Date("2024-01-17T15:45:00Z")
    },
    {
      poNumber: "PO-009",
      userId: users[0].id,
      supplierId: suppliers[8]?.id,
      totalCost: 600.00,
      discount: 30.00,
      tax: 45.60,
      status: "received",
      notes: "Local electronics restock",
      createdAt: new Date("2024-01-18T12:00:00Z")
    },
    {
      poNumber: "PO-010",
      userId: users[0].id,
      supplierId: suppliers[9]?.id,
      totalCost: 200.00,
      discount: 0,
      tax: 16.00,
      status: "received",
      notes: "Quick supplies order",
      createdAt: new Date("2024-01-19T09:30:00Z")
    }
  ];

  // Create purchases
  const createdPurchases = [];
  for (const purchase of samplePurchases) {
    const createdPurchase = await prisma.purchase.create({
      data: purchase
    });
    createdPurchases.push(createdPurchase);
  }

  // Create ProductPurchase entries to link products with purchases
  const productPurchasesData = [
    // Purchase 1 - Electronics components
    { purchaseId: createdPurchases[0].id, productId: products[0]?.id, purchase_price: 800.00, purchase_quantity: 2 },
    { purchaseId: createdPurchases[0].id, productId: products[1]?.id, purchase_price: 400.00, purchase_quantity: 3 },
    
    // Purchase 2 - Fashion items
    { purchaseId: createdPurchases[1].id, productId: products[2]?.id, purchase_price: 300.00, purchase_quantity: 15 },
    { purchaseId: createdPurchases[1].id, productId: products[3]?.id, purchase_price: 150.00, purchase_quantity: 5 },
    
    // Purchase 3 - Books
    { purchaseId: createdPurchases[2].id, productId: products[4]?.id, purchase_price: 200.00, purchase_quantity: 10 },
    { purchaseId: createdPurchases[2].id, productId: products[7]?.id, purchase_price: 100.00, purchase_quantity: 5 },
    
    // Purchase 4 - Electronics bulk
    { purchaseId: createdPurchases[3].id, productId: products[5]?.id, purchase_price: 400.00, purchase_quantity: 5 },
    { purchaseId: createdPurchases[3].id, productId: products[0]?.id, purchase_price: 400.00, purchase_quantity: 1 },
    
    // Purchase 5 - Textile materials
    { purchaseId: createdPurchases[4].id, productId: products[2]?.id, purchase_price: 150.00, purchase_quantity: 10 },
    { purchaseId: createdPurchases[4].id, productId: products[3]?.id, purchase_price: 100.00, purchase_quantity: 3 },
    
    // Purchase 6 - Academic publications
    { purchaseId: createdPurchases[5].id, productId: products[4]?.id, purchase_price: 120.00, purchase_quantity: 5 },
    { purchaseId: createdPurchases[5].id, productId: products[7]?.id, purchase_price: 60.00, purchase_quantity: 3 },
    
    // Purchase 7 - Hardware supplies
    { purchaseId: createdPurchases[6].id, productId: products[5]?.id, purchase_price: 200.00, purchase_quantity: 3 },
    { purchaseId: createdPurchases[6].id, productId: products[6]?.id, purchase_price: 150.00, purchase_quantity: 2 },
    
    // Purchase 8 - Office essentials
    { purchaseId: createdPurchases[7].id, productId: products[4]?.id, purchase_price: 80.00, purchase_quantity: 3 },
    { purchaseId: createdPurchases[7].id, productId: products[7]?.id, purchase_price: 40.00, purchase_quantity: 2 },
    
    // Purchase 9 - Local electronics
    { purchaseId: createdPurchases[8].id, productId: products[0]?.id, purchase_price: 300.00, purchase_quantity: 1 },
    { purchaseId: createdPurchases[8].id, productId: products[1]?.id, purchase_price: 300.00, purchase_quantity: 2 },
    
    // Purchase 10 - Quick supplies
    { purchaseId: createdPurchases[9].id, productId: products[2]?.id, purchase_price: 100.00, purchase_quantity: 5 },
    { purchaseId: createdPurchases[9].id, productId: products[3]?.id, purchase_price: 100.00, purchase_quantity: 2 }
  ];

  // Create ProductPurchase entries
  for (const productPurchase of productPurchasesData) {
    if (productPurchase.productId) {
      await prisma.productPurchase.create({
        data: productPurchase
      });
    }
  }

  console.log(
    "Seeded settings, admin role, admin user, categories, sample products, suppliers, customers, sales, and purchases."
  );
  console.log("Admin credentials: admin@example.com / admin123");
  console.log(
    `Created ${sampleProducts.length} sample products for pagination testing.`
  );
  console.log(
    `Created ${sampleSuppliers.length} sample suppliers for testing.`
  );
  console.log(
    `Created ${sampleCustomers.length} sample customers for testing.`
  );
  console.log(
    `Created ${createdSales.length} sample sales with various statuses and payment methods.`
  );
  console.log(
    `Created ${createdPurchases.length} sample purchases with various statuses.`
  );
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
