const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// Dashboard stats (products, sales, revenue, customers, suppliers, low stock, etc.)
exports.getStats = async () => {
  const [
    totalProducts,
    totalSales,
    totalRevenue,
    totalCustomers,
    totalSuppliers,
    lowStockItems,
  ] = await Promise.all([
    prisma.product.count({ where: { isDeleted: false } }),
    prisma.sale.count({ where: { isDeleted: false } }),
    prisma.sale.aggregate({
      where: { isDeleted: false },
      _sum: { totalPrice: true },
    }),
    prisma.user.count({
      where: {
        status: "Active",
        role: { role_type: "customer" },
      },
    }),
    prisma.supplier.count({ where: { isDeleted: false } }),
    prisma.product.count({
      where: {
        isDeleted: false,
        quantity: { lte: 5 },
      },
    }),
  ]);

  // Optionally, fetch low stock products for alert card
  const lowStockProducts = await prisma.product.findMany({
    where: { isDeleted: false, quantity: { lte: 5 } },
    select: { id: true, name: true, quantity: true },
    orderBy: { quantity: "asc" },
    take: 10,
  });

  return {
    stats: {
      totalProducts,
      totalSales,
      totalRevenue: totalRevenue._sum.totalPrice || 0,
      totalCustomers,
      totalSuppliers,
      lowStockItems,
    },
    lowStockItems: lowStockProducts,
  };
};

// Dashboard activities (recent sales/purchases)
exports.getActivities = async (page = 1, limit = 10) => {
  // Combine sales and purchases, sort by date desc, paginate
  const [sales, purchases] = await Promise.all([
    prisma.sale.findMany({
      where: { isDeleted: false },
      orderBy: { createdAt: "desc" },
      take: limit * 2,
      include: { customer: true },
    }),
    prisma.purchase.findMany({
      where: { isDeleted: false },
      orderBy: { createdAt: "desc" },
      take: limit * 2,
      include: { supplier: true },
    }),
  ]);

  // Map to unified activity format
  const activities = [
    ...sales.map((s) => ({
      id: `sale-${s.id}`,
      type: "sale",
      date: s.createdAt,
      amount: s.totalPrice,
      relatedEntity: s.customer
        ? { name: s.customer.firstName + " " + (s.customer.lastName || "") }
        : null,
    })),
    ...purchases.map((p) => ({
      id: `purchase-${p.id}`,
      type: "purchase",
      date: p.createdAt,
      amount: p.totalCost,
      relatedEntity: p.supplier ? { name: p.supplier.name } : null,
    })),
  ]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice((page - 1) * limit, page * limit);

  return {
    data: activities,
    currentPage: page,
    totalPages: 1,
    totalItems: activities.length,
    limit,
  };
};

// Low stock alerts (paginated)
exports.getLowStockAlerts = async (page = 1, limit = 10) => {
  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where: { isDeleted: false, quantity: { lte: 5 } },
      orderBy: { quantity: "asc" },
      skip: (page - 1) * limit,
      take: limit,
      select: { id: true, name: true, quantity: true },
    }),
    prisma.product.count({
      where: { isDeleted: false, quantity: { lte: 5 } },
    }),
  ]);
  return {
    data: products.map((p) => ({
      ...p,
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
