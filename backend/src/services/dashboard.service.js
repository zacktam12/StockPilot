const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const cacheService = require("./cache.service");

// Helper function to generate date ranges
const getDateRange = (period) => {
  const now = new Date();
  let startDate;
  
  switch (period) {
    case '7d':
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      break;
    case '30d':
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      break;
    case '90d':
      startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
      break;
    case '1y':
      startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
      break;
    default:
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  }
  
  return { startDate, endDate: now };
};

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
  // Generate cache key
  const cacheKey = cacheService.generateKey('dashboard', 'stats');
  
  // Try to get from cache first (short TTL for real-time data)
  const cached = await cacheService.get(cacheKey);
  if (cached) {
    return cached;
  }
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

  const result = {
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

  // Cache the result for 2 minutes (short TTL for real-time dashboard data)
  await cacheService.set(cacheKey, result, 120);

  return result;
};

// Dashboard activities (recent sales/purchases) with proper pagination
exports.getActivities = async (params = {}) => {
  const {
    page = 1,
    limit = 10,
    type = "",
    startDate = "",
    endDate = "",
    userId = ""
  } = params;

  // Generate cache key
  const cacheKey = cacheService.generateKey(
    'dashboard',
    'activities',
    page.toString(),
    limit.toString(),
    type || '',
    startDate || '',
    endDate || '',
    userId || ''
  );
  
  // Try to get from cache first
  const cached = await cacheService.get(cacheKey);
  if (cached) {
    return cached;
  }
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

  const result = {
    activities: paginatedActivities,
    total: totalItems,
    currentPage: page,
    totalPages,
    limit,
  };

  // Cache the result for 3 minutes
  await cacheService.set(cacheKey, result, 180);

  return result;
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

// Sales Analytics with advanced metrics
exports.getSalesAnalytics = async (params = {}) => {
  const {
    period = "30d",
    startDate = "",
    endDate = "",
    groupBy = "day"
  } = params;

  // Generate cache key
  const cacheKey = cacheService.generateKey(
    'dashboard',
    'sales-analytics',
    period,
    startDate || '',
    endDate || '',
    groupBy
  );
  
  // Try to get from cache first
  const cached = await cacheService.get(cacheKey);
  if (cached) {
    return cached;
  }

  try {
    let dateRange;
    if (startDate && endDate) {
      dateRange = {
        startDate: new Date(startDate),
        endDate: new Date(endDate)
      };
    } else {
      dateRange = getDateRange(period);
    }

    // Get sales data grouped by time period
    const salesData = await prisma.sale.groupBy({
      by: ['createdAt'],
      where: {
        isDeleted: false,
        createdAt: {
          gte: dateRange.startDate,
          lte: dateRange.endDate
        }
      },
      _sum: {
        totalPrice: true
      },
      _count: {
        id: true
      },
      orderBy: {
        createdAt: 'asc'
      }
    });

    // Get top selling products
    const topProducts = await prisma.productSale.groupBy({
      by: ['productId'],
      where: {
        sale: {
          isDeleted: false,
          createdAt: {
            gte: dateRange.startDate,
            lte: dateRange.endDate
          }
        }
      },
      _sum: {
        quantity: true,
        price: true
      },
      orderBy: {
        _sum: {
          quantity: 'desc'
        }
      },
      take: 10
    });

    // Get sales by payment method
    const salesByPaymentMethod = await prisma.sale.groupBy({
      by: ['paymentMethod'],
      where: {
        isDeleted: false,
        createdAt: {
          gte: dateRange.startDate,
          lte: dateRange.endDate
        }
      },
      _sum: {
        totalPrice: true
      },
      _count: {
        id: true
      }
    });

    // Get sales by status
    const salesByStatus = await prisma.sale.groupBy({
      by: ['status'],
      where: {
        isDeleted: false,
        createdAt: {
          gte: dateRange.startDate,
          lte: dateRange.endDate
        }
      },
      _sum: {
        totalPrice: true
      },
      _count: {
        id: true
      }
    });

    // Calculate metrics
    const totalRevenue = salesData.reduce((sum, sale) => sum + (sale._sum.totalPrice || 0), 0);
    const totalOrders = salesData.reduce((sum, sale) => sum + sale._count.id, 0);
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    const result = {
      timeSeries: salesData,
      topProducts,
      salesByPaymentMethod,
      salesByStatus,
      metrics: {
        totalRevenue,
        totalOrders,
        averageOrderValue,
        period: period,
        dateRange
      }
    };

    // Cache the result for 5 minutes
    await cacheService.set(cacheKey, result, 300);

    return result;
  } catch (error) {
    console.error("Error fetching sales analytics:", error);
    return {};
  }
};

// Customer Analytics
exports.getCustomerAnalytics = async (params = {}) => {
  const {
    period = "30d",
    startDate = "",
    endDate = ""
  } = params;

  // Generate cache key
  const cacheKey = cacheService.generateKey(
    'dashboard',
    'customer-analytics',
    period,
    startDate || '',
    endDate || ''
  );
  
  // Try to get from cache first
  const cached = await cacheService.get(cacheKey);
  if (cached) {
    return cached;
  }

  try {
    let dateRange;
    if (startDate && endDate) {
      dateRange = {
        startDate: new Date(startDate),
        endDate: new Date(endDate)
      };
    } else {
      dateRange = getDateRange(period);
    }

    // Get customer acquisition data
    const customerAcquisition = await prisma.customer.groupBy({
      by: ['createdAt'],
      where: {
        isDeleted: false,
        createdAt: {
          gte: dateRange.startDate,
          lte: dateRange.endDate
        }
      },
      _count: {
        id: true
      },
      orderBy: {
        createdAt: 'asc'
      }
    });

    // Get top customers by revenue
    const topCustomers = await prisma.customer.findMany({
      where: {
        isDeleted: false,
        sales: {
          some: {
            isDeleted: false,
            createdAt: {
              gte: dateRange.startDate,
              lte: dateRange.endDate
            }
          }
        }
      },
      include: {
        sales: {
          where: {
            isDeleted: false,
            createdAt: {
              gte: dateRange.startDate,
              lte: dateRange.endDate
            }
          }
        }
      },
      orderBy: {
        sales: {
          _count: 'desc'
        }
      },
      take: 10
    });

    // Calculate customer metrics
    const totalNewCustomers = customerAcquisition.reduce((sum, day) => sum + day._count.id, 0);
    const totalCustomers = await prisma.customer.count({ where: { isDeleted: false } });

    const result = {
      customerAcquisition,
      topCustomers: topCustomers.map(customer => ({
        ...customer,
        totalSpent: customer.sales.reduce((sum, sale) => sum + sale.totalPrice, 0),
        orderCount: customer.sales.length
      })),
      metrics: {
        totalNewCustomers,
        totalCustomers,
        customerGrowthRate: totalCustomers > 0 ? (totalNewCustomers / totalCustomers) * 100 : 0,
        period: period,
        dateRange
      }
    };

    // Cache the result for 10 minutes
    await cacheService.set(cacheKey, result, 600);

    return result;
  } catch (error) {
    console.error("Error fetching customer analytics:", error);
    return {};
  }
};

// Inventory Analytics
exports.getInventoryAnalytics = async (params = {}) => {
  const {
    categoryId = "",
    includeZeroStock = false
  } = params;

  // Generate cache key
  const cacheKey = cacheService.generateKey(
    'dashboard',
    'inventory-analytics',
    categoryId || '',
    includeZeroStock.toString()
  );
  
  // Try to get from cache first
  const cached = await cacheService.get(cacheKey);
  if (cached) {
    return cached;
  }

  try {
    const where = { isDeleted: false };
    
    if (categoryId) {
      where.categoryId = categoryId;
    }
    
    if (!includeZeroStock) {
      where.quantity = { gt: 0 };
    }

    // Get inventory overview
    const inventoryStats = await prisma.product.groupBy({
      by: ['categoryId'],
      where,
      _sum: {
        quantity: true,
        costPrice: true
      },
      _count: {
        id: true
      }
    });

    // Get low stock products
    const lowStockThreshold = await getLowStockThreshold();
    const lowStockProducts = await prisma.product.findMany({
      where: {
        ...where,
        quantity: {
          lte: lowStockThreshold,
          gt: 0
        }
      },
      include: {
        category: true
      },
      orderBy: {
        quantity: 'asc'
      },
      take: 20
    });

    // Get out of stock products
    const outOfStockProducts = await prisma.product.findMany({
      where: {
        ...where,
        quantity: 0
      },
      include: {
        category: true
      },
      orderBy: {
        updatedAt: 'desc'
      },
      take: 20
    });

    // Calculate total inventory value
    const totalInventoryValue = await prisma.product.aggregate({
      where,
      _sum: {
        costPrice: true
      }
    });

    const result = {
      inventoryStats,
      lowStockProducts,
      outOfStockProducts,
      metrics: {
        totalInventoryValue: totalInventoryValue._sum.costPrice || 0,
        lowStockCount: lowStockProducts.length,
        outOfStockCount: outOfStockProducts.length,
        totalProducts: await prisma.product.count({ where })
      }
    };

    // Cache the result for 15 minutes (inventory changes less frequently)
    await cacheService.set(cacheKey, result, 900);

    return result;
  } catch (error) {
    console.error("Error fetching inventory analytics:", error);
    return {};
  }
};

// Performance Metrics
exports.getPerformanceMetrics = async (params = {}) => {
  const {
    period = "30d",
    startDate = "",
    endDate = ""
  } = params;

  // Generate cache key
  const cacheKey = cacheService.generateKey(
    'dashboard',
    'performance-metrics',
    period,
    startDate || '',
    endDate || ''
  );
  
  // Try to get from cache first
  const cached = await cacheService.get(cacheKey);
  if (cached) {
    return cached;
  }

  try {
    let dateRange;
    if (startDate && endDate) {
      dateRange = {
        startDate: new Date(startDate),
        endDate: new Date(endDate)
      };
    } else {
      dateRange = getDateRange(period);
    }

    // Get sales performance
    const salesPerformance = await prisma.sale.aggregate({
      where: {
        isDeleted: false,
        createdAt: {
          gte: dateRange.startDate,
          lte: dateRange.endDate
        }
      },
      _sum: {
        totalPrice: true
      },
      _count: {
        id: true
      },
      _avg: {
        totalPrice: true
      }
    });

    // Get purchase performance
    const purchasePerformance = await prisma.purchase.aggregate({
      where: {
        isDeleted: false,
        createdAt: {
          gte: dateRange.startDate,
          lte: dateRange.endDate
        }
      },
      _sum: {
        totalCost: true
      },
      _count: {
        id: true
      },
      _avg: {
        totalCost: true
      }
    });

    // Calculate profit margin
    const totalRevenue = salesPerformance._sum.totalPrice || 0;
    const totalCost = purchasePerformance._sum.totalCost || 0;
    const profitMargin = totalRevenue > 0 ? ((totalRevenue - totalCost) / totalRevenue) * 100 : 0;

    // Get conversion metrics
    const totalCustomers = await prisma.customer.count({ where: { isDeleted: false } });
    const activeCustomers = await prisma.customer.count({
      where: {
        isDeleted: false,
        sales: {
          some: {
            isDeleted: false,
            createdAt: {
              gte: dateRange.startDate,
              lte: dateRange.endDate
            }
          }
        }
      }
    });

    const result = {
      sales: {
        totalRevenue,
        totalOrders: salesPerformance._count.id || 0,
        averageOrderValue: salesPerformance._avg.totalPrice || 0
      },
      purchases: {
        totalCost,
        totalOrders: purchasePerformance._count.id || 0,
        averageOrderValue: purchasePerformance._avg.totalCost || 0
      },
      profitability: {
        profitMargin,
        grossProfit: totalRevenue - totalCost
      },
      conversion: {
        totalCustomers,
        activeCustomers,
        customerActivationRate: totalCustomers > 0 ? (activeCustomers / totalCustomers) * 100 : 0
      },
      period: period,
      dateRange
    };

    // Cache the result for 5 minutes
    await cacheService.set(cacheKey, result, 300);

    return result;
  } catch (error) {
    console.error("Error fetching performance metrics:", error);
    return {};
  }
};
