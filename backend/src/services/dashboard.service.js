const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// Helper function to get low stock threshold from settings
const getLowStockThreshold = async () => {
  try {
    const settings = await prisma.settings.findFirst();
    return settings?.lowStockThreshold || 10; // Default to 10 if not set
  } catch (error) {
    console.warn(
      "Failed to get low stock threshold from settings, using default:",
      error.message
    );
    return 10; // Default fallback
  }
};

// Dashboard stats (products, sales, revenue, customers, suppliers, low stock, etc.)
exports.getStats = async () => {
  // Get current month and previous month for trend calculations
  const now = new Date();
  const currentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const previousMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const currentMonthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  const previousMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

  // Get low stock threshold from settings
  const lowStockThreshold = await getLowStockThreshold();

  const [
    totalProducts,
    totalSales,
    totalRevenue,
    totalCustomers,
    totalSuppliers,
    // Current month stats for trends
    currentMonthSales,
    currentMonthRevenue,
    currentMonthProducts,
    // Previous month stats for trends
    previousMonthSales,
    previousMonthRevenue,
    previousMonthProducts,
  ] = await Promise.all([
    prisma.product.count({ where: { isDeleted: false } }),
    prisma.sale.count({ where: { isDeleted: false } }),
    prisma.sale.aggregate({
      where: { isDeleted: false },
      _sum: { totalPrice: true },
    }),
    // Fix: Count from Customer table, not User table
    prisma.customer.count(),
    prisma.supplier.count({ where: { isDeleted: false } }),
    // Current month sales count
    prisma.sale.count({
      where: {
        isDeleted: false,
        createdAt: { gte: currentMonth, lte: currentMonthEnd },
      },
    }),
    // Current month revenue
    prisma.sale.aggregate({
      where: {
        isDeleted: false,
        createdAt: { gte: currentMonth, lte: currentMonthEnd },
      },
      _sum: { totalPrice: true },
    }),
    // Current month products count
    prisma.product.count({
      where: {
        isDeleted: false,
        createdAt: { gte: currentMonth, lte: currentMonthEnd },
      },
    }),
    // Previous month sales count
    prisma.sale.count({
      where: {
        isDeleted: false,
        createdAt: { gte: previousMonth, lte: previousMonthEnd },
      },
    }),
    // Previous month revenue
    prisma.sale.aggregate({
      where: {
        isDeleted: false,
        createdAt: { gte: previousMonth, lte: previousMonthEnd },
      },
      _sum: { totalPrice: true },
    }),
    // Previous month products count
    prisma.product.count({
      where: {
        isDeleted: false,
        createdAt: { gte: previousMonth, lte: previousMonthEnd },
      },
    }),
  ]);

  // Calculate trends
  const salesChange =
    previousMonthSales > 0
      ? (
          ((currentMonthSales - previousMonthSales) / previousMonthSales) *
          100
        ).toFixed(1)
      : currentMonthSales > 0
      ? 100
      : 0;

  const revenueChange =
    (previousMonthRevenue._sum.totalPrice || 0) > 0
      ? (
          (((currentMonthRevenue._sum.totalPrice || 0) -
            (previousMonthRevenue._sum.totalPrice || 0)) /
            (previousMonthRevenue._sum.totalPrice || 0)) *
          100
        ).toFixed(1)
      : (currentMonthRevenue._sum.totalPrice || 0) > 0
      ? 100
      : 0;

  const productChange =
    previousMonthProducts > 0
      ? (
          ((currentMonthProducts - previousMonthProducts) /
            previousMonthProducts) *
          100
        ).toFixed(1)
      : currentMonthProducts > 0
      ? 100
      : 0;

  // Fetch all products with quantity >= 0
  const allProducts = await prisma.product.findMany({
    where: { isDeleted: false, quantity: { gte: 0 } },
    select: {
      id: true,
      name: true,
      quantity: true,
      minStock: true,
      category: { select: { name: true } },
    },
    orderBy: { quantity: "asc" },
    take: 1000, // reasonable upper limit
  });

  // Filter in JS for low stock
  const lowStockProducts = allProducts
    .filter((p) => {
      if (p.quantity === 0) return true; // Out of stock
      const minStock = p.minStock != null ? p.minStock : lowStockThreshold;
      return p.quantity > 0 && p.quantity <= minStock;
    })
    .slice(0, 10); // limit to 10 for dashboard

  // After filtering lowStockProducts:
  const lowStockItems = lowStockProducts.length;

  return {
    stats: {
      totalProducts,
      totalSales,
      totalRevenue: totalRevenue._sum.totalPrice || 0,
      totalCustomers,
      totalSuppliers,
      lowStockItems,
      // Add trend data
      salesChange: parseFloat(salesChange),
      revenueChange: parseFloat(revenueChange),
      productChange: parseFloat(productChange),
      // Add current month data
      currentMonthSales,
      currentMonthRevenue: currentMonthRevenue._sum.totalPrice || 0,
    },
    lowStockItems: lowStockProducts,
  };
};

// Dashboard activities (recent sales/purchases) with proper pagination
exports.getActivities = async (page = 1, limit = 10) => {
  // Get total counts for proper pagination
  const [totalSales, totalPurchases] = await Promise.all([
    prisma.sale.count({ where: { isDeleted: false } }),
    prisma.purchase.count({ where: { isDeleted: false } }),
  ]);

  const totalItems = totalSales + totalPurchases;
  const totalPages = Math.ceil(totalItems / limit);
  const offset = (page - 1) * limit;

  // Fetch sales and purchases with proper pagination
  const [sales, purchases] = await Promise.all([
    prisma.sale.findMany({
      where: { isDeleted: false },
      orderBy: { createdAt: "desc" },
      include: { customer: true },
    }),
    prisma.purchase.findMany({
      where: { isDeleted: false },
      orderBy: { createdAt: "desc" },
      include: { supplier: true },
    }),
  ]);

  // Map to unified activity format and sort by date
  const allActivities = [
    ...sales.map((s) => ({
      id: `sale-${s.id}`,
      type: "sale",
      date: s.createdAt,
      amount: s.totalPrice,
      relatedEntity: s.customer
        ? {
            name:
              s.customer.name ||
              `${s.customer.firstName || ""} ${
                s.customer.lastName || ""
              }`.trim(),
          }
        : null,
    })),
    ...purchases.map((p) => ({
      id: `purchase-${p.id}`,
      type: "purchase",
      date: p.createdAt,
      amount: p.totalCost,
      relatedEntity: p.supplier ? { name: p.supplier.name } : null,
    })),
  ].sort((a, b) => new Date(b.date) - new Date(a.date));

  // Apply pagination
  const paginatedActivities = allActivities.slice(offset, offset + limit);

  return {
    data: paginatedActivities,
    currentPage: page,
    totalPages,
    totalItems,
    limit,
  };
};

// Low stock alerts (paginated) with configurable threshold
exports.getLowStockAlerts = async (page = 1, limit = 10) => {
  // Get low stock threshold from settings
  const lowStockThreshold = await getLowStockThreshold();

  // Fetch all products with quantity >= 0
  const allProducts = await prisma.product.findMany({
    where: { isDeleted: false, quantity: { gte: 0 } },
    select: {
      id: true,
      name: true,
      quantity: true,
      minStock: true,
      category: { select: { name: true } },
    },
    orderBy: { quantity: "asc" },
    take: 1000, // reasonable upper limit
  });

  // Filter in JS for low stock
  const filtered = allProducts.filter((p) => {
    if (p.quantity === 0) return true; // Out of stock
    const minStock = p.minStock != null ? p.minStock : lowStockThreshold;
    return p.quantity > 0 && p.quantity <= minStock;
  });

  // Pagination
  const total = filtered.length;
  const paginated = filtered.slice((page - 1) * limit, page * limit);

  return {
    data: paginated.map((p) => ({
      ...p,
      category: p.category?.name,
      status: p.quantity === 0 ? "out-of-stock" : "low-stock",
    })),
    currentPage: page,
    totalPages: Math.ceil(total / limit),
    totalItems: total,
    limit,
  };
};

// Revenue data for chart (monthly/yearly)
exports.getRevenueData = async (range = "monthly") => {
  if (range === "monthly") {
    // Group sales by month for the last 12 months
    const now = new Date();
    const months = [];
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push({ year: d.getFullYear(), month: d.getMonth() + 1 });
    }

    const data = await Promise.all(
      months.map(async ({ year, month }) => {
        const start = new Date(year, month - 1, 1);
        const end = new Date(year, month, 1);
        const sum = await prisma.sale.aggregate({
          where: {
            isDeleted: false,
            createdAt: { gte: start, lt: end },
          },
          _sum: { totalPrice: true },
        });
        return {
          month: `${year}-${String(month).padStart(2, "0")}`,
          revenue: sum._sum.totalPrice || 0,
        };
      })
    );
    return data;
  }
  // Add yearly or other ranges as needed
  return [];
};

// Product distribution data for pie chart
exports.getProductDistribution = async () => {
  try {
    const products = await prisma.product.findMany({
      where: { isDeleted: false },
      select: {
        category: {
          select: {
            name: true,
            isDeleted: true,
          },
        },
      },
    });

    // Count products by category
    const distribution = products.reduce((acc, product) => {
      // If category is null (was deleted) or category is deleted, mark as "Uncategorized"
      const categoryName =
        product.category && !product.category.isDeleted
          ? product.category.name
          : "Uncategorized";

      acc[categoryName] = (acc[categoryName] || 0) + 1;
      return acc;
    }, {});

    return distribution;
  } catch (error) {
    console.error("Error fetching product distribution:", error);
    return {};
  }
};
