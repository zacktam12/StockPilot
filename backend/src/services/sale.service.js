const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const cacheService = require("./cache.service");

// Function to calculate sales summary statistics
const calculateSalesSummary = async (where) => {
  try {
    const [totalSales, totalRevenue, avgOrderValue, statusCounts] = await Promise.all([
      prisma.sale.count({ where }),
      prisma.sale.aggregate({
        where,
        _sum: { totalPrice: true }
      }),
      prisma.sale.aggregate({
        where,
        _avg: { totalPrice: true }
      }),
      prisma.sale.groupBy({
        by: ['status'],
        where,
        _count: { status: true }
      })
    ]);

    const statusBreakdown = statusCounts.reduce((acc, item) => {
      acc[item.status] = item._count.status;
      return acc;
    }, {});

    return {
      totalSales,
      totalRevenue: totalRevenue._sum.totalPrice || 0,
      avgOrderValue: avgOrderValue._avg.totalPrice || 0,
      statusBreakdown
    };
  } catch (error) {
    console.error('Error calculating sales summary:', error);
    return {
      totalSales: 0,
      totalRevenue: 0,
      avgOrderValue: 0,
      statusBreakdown: {}
    };
  }
};

// Function to generate order number
const generateOrderNumber = async () => {
  // Get the current date in YYYYMMDD format
  const today = new Date();
  const dateStr =
    today.getFullYear().toString() +
    (today.getMonth() + 1).toString().padStart(2, "0") +
    today.getDate().toString().padStart(2, "0");

  // Get the count of sales for today
  const startOfDay = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate()
  );
  const endOfDay = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate() + 1
  );

  const todaySalesCount = await prisma.sale.count({
    where: {
      createdAt: {
        gte: startOfDay,
        lt: endOfDay,
      },
    },
  });

  // Generate order number: SO-YYYYMMDD-XXXX (SO = Sales Order)
  let orderNumber = `SO-${dateStr}-${(todaySalesCount + 1)
    .toString()
    .padStart(4, "0")}`;

  // Check if this order number already exists (handle race conditions)
  let counter = 1;
  while (await prisma.sale.findUnique({ where: { orderNumber } })) {
    orderNumber = `SO-${dateStr}-${(todaySalesCount + 1 + counter)
      .toString()
      .padStart(4, "0")}`;
    counter++;
  }

  return orderNumber;
};

const createSale = async (data) => {
  const { customer_id, items, status = "completed", ...otherData } = data;

  // Calculate total price from items
  const totalPrice = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  // Generate order number
  let orderNumber;
  try {
    orderNumber = await generateOrderNumber();
  } catch (error) {
    console.error("Error generating order number:", error);
    // Fallback: use timestamp-based order number
    const timestamp = Date.now();
    orderNumber = `SO-${timestamp}`;
  }

  // Create the sale
  const sale = await prisma.sale.create({
    data: {
      customerId: customer_id || null,
      totalPrice,
      status,
      orderNumber,
      userId: otherData.userId, // This should be set from the authenticated user
      ...otherData,
    },
    include: {
      user: true,
      customer: true,
      productSales: {
        include: {
          product: true,
        },
      },
    },
  });

  // Create product sales
  if (items && items.length > 0) {
    await Promise.all(
      items.map((item) =>
        prisma.productSale.create({
          data: {
            productId: item.product_id,
            saleId: sale.id,
            sale_quantity: item.quantity,
            sale_price: item.price,
          },
        })
      )
    );

    // Update product quantities
    await Promise.all(
      items.map((item) =>
        prisma.product.update({
          where: { id: item.product_id },
          data: {
            quantity: {
              decrement: item.quantity,
            },
          },
        })
      )
    );
  }

  // Invalidate cache
  await cacheService.deletePattern('sales:*');
  await cacheService.deletePattern('products:*'); // Invalidate product cache due to quantity changes

  // Return the sale with updated data
  return prisma.sale.findUnique({
    where: { id: sale.id },
    include: {
      user: true,
      customer: true,
      productSales: {
        include: {
          product: true,
        },
      },
    },
  });
};

// const getAllSales = () =>
//   prisma.sale.findMany({
//     where: { isDeleted: false },
//     include: { user: true, customer: true, productSales: true },
//   });

const getAllSales = async (params = {}) => {
  const {
    page = 1,
    limit = 10,
    search = "",
    status = "",
    customerId = "",
    paymentMethod = "",
    startDate = "",
    endDate = "",
    sortField = "createdAt",
    sortOrder = "desc"
  } = params;

  // Generate cache key
  const cacheKey = cacheService.generateKey(
    'sales',
    page.toString(),
    limit.toString(),
    search || '',
    status || '',
    customerId || '',
    paymentMethod || '',
    startDate || '',
    endDate || '',
    sortField,
    sortOrder
  );

  // Try to get from cache first
  const cached = await cacheService.get(cacheKey);
  if (cached) {
    return cached;
  }

  const pageNum = parseInt(page, 10) || 1;
  const limitNum = parseInt(limit, 10) || 10;
  const skip = (pageNum - 1) * limitNum;

  const where = {
    isDeleted: false,
  };

  // Add search filter if provided
  if (search) {
    where.OR = [
      {
        customer: {
          name: {
            contains: search,
          },
        },
      },
      {
        orderNumber: {
          contains: search,
        },
      },
    ];
  }

  // Add status filter if provided
  if (status && status !== "all") {
    where.status = status;
  }

  // Add customer filter if provided
  if (customerId) {
    where.customerId = customerId;
  }

  // Add payment method filter if provided
  if (paymentMethod) {
    where.paymentMethod = paymentMethod;
  }

  // Add date range filter if provided
  if (startDate || endDate) {
    where.createdAt = {};
    if (startDate) {
      where.createdAt.gte = new Date(startDate);
    }
    if (endDate) {
      where.createdAt.lte = new Date(endDate);
    }
  }

  // Build orderBy clause
  const orderBy = {};
  orderBy[sortField] = sortOrder;

  const [data, total] = await Promise.all([
    prisma.sale.findMany({
      where,
      skip,
      take: limitNum,
      orderBy,
      include: {
        user: true,
        customer: true,
        productSales: {
          include: {
            product: true,
          },
        },
      },
    }),
    prisma.sale.count({ where }),
  ]);

  // Keep IDs as strings (UUIDs) for consistency with database
  const mappedData = data.map((sale) => ({
    ...sale,
    created_at: sale.createdAt, // Add snake_case version for frontend compatibility
    total_amount: sale.totalPrice, // Add snake_case version for frontend compatibility
    orderNumber: sale.orderNumber, // Ensure orderNumber is included for frontend
  }));

  // Calculate summary statistics
  const summary = await calculateSalesSummary(where);

  const result = {
    sales: mappedData,
    total,
    summary
  };

  // Cache the result for 3 minutes (shorter than other entities due to financial data)
  await cacheService.set(cacheKey, result, 180);

  return result;
};

const getSaleById = (id) =>
  prisma.sale.findUnique({
    where: { id: String(id) },
    include: { 
      user: true, 
      customer: true, 
      productSales: {
        include: {
          product: true,
        },
      },
    },
  });

const updateSale = async (id, data) => {
  const { customer_id, items, status, ...otherData } = data;

  // First check if the sale exists
  const existingSale = await prisma.sale.findUnique({
    where: { id: String(id) },
    include: {
      productSales: true,
    },
  });

  if (!existingSale) {
    throw new Error(`Sale with ID ${id} not found`);
  }

  // Calculate new total price if items are provided
  let totalPrice = existingSale.totalPrice;
  if (items && items.length > 0) {
    totalPrice = items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
  }

  // Start a transaction to ensure data consistency
  return await prisma.$transaction(async (prisma) => {
    // 1. Update the sale record
    const updatedSale = await prisma.sale.update({
      where: { id: String(id) },
      data: {
        customerId: customer_id || existingSale.customerId,
        totalPrice,
        status: status || existingSale.status,
        ...otherData,
      },
      include: {
        user: true,
        customer: true,
        productSales: {
          include: {
            product: true,
          },
        },
      },
    });

    // 2. If items are provided, update product sales
    if (items && items.length > 0) {
      // First, restore quantities for existing product sales
      for (const existingProductSale of existingSale.productSales) {
        await prisma.product.update({
          where: { id: existingProductSale.productId },
          data: {
            quantity: {
              increment: existingProductSale.sale_quantity,
            },
          },
        });
      }

      // Delete existing product sales
      await prisma.productSale.deleteMany({
        where: { saleId: String(id) },
      });

      // Create new product sales
      await Promise.all(
        items.map((item) =>
          prisma.productSale.create({
            data: {
              productId: item.product_id,
              saleId: String(id),
              sale_quantity: item.quantity,
              sale_price: item.price,
            },
          })
        )
      );

      // Update product quantities for new items
      await Promise.all(
        items.map((item) =>
          prisma.product.update({
            where: { id: item.product_id },
            data: {
              quantity: {
                decrement: item.quantity,
              },
            },
          })
        )
      );
    }

    // Return the updated sale with fresh data
    const result = await prisma.sale.findUnique({
      where: { id: String(id) },
      include: {
        user: true,
        customer: true,
        productSales: {
          include: {
            product: true,
          },
        },
      },
    });

    // Invalidate cache after transaction
    await cacheService.deletePattern('sales:*');
    await cacheService.deletePattern('products:*'); // Invalidate product cache due to quantity changes

    return result;
  });
};

const deleteSale = async (id) => {
  // First check if the sale exists
  const existingSale = await prisma.sale.findUnique({
    where: { id: String(id) },
  });

  if (!existingSale) {
    throw new Error(`Sale with ID ${id} not found`);
  }

  if (existingSale.isDeleted) {
    throw new Error(`Sale with ID ${id} is already deleted`);
  }

  // Perform soft delete
  const result = await prisma.sale.update({
    where: { id: String(id) },
    data: { isDeleted: true },
  });

  // Invalidate cache
  await cacheService.deletePattern('sales:*');

  return result;
};

const importSales = async (sales) => {
  const created = [];
  const errors = [];
  for (let i = 0; i < sales.length; i++) {
    try {
      const sale = sales[i];
      // Support both export/import formats
      const orderNumber = sale["Order Number"] || sale.orderNumber || sale.id;
      const createdAt =
        sale["Date & Time"] || sale.created_at || sale.createdAt || new Date();
      const customerName =
        sale.Customer || sale.customerName || sale.customer?.name;
      const customerId = sale.customerId || sale.customer_id;
      const totalAmount =
        sale["Total Amount"] || sale.total_amount || sale.totalPrice;
      const status = sale.Status || sale.status || "completed";
      // Validate required fields
      if (!orderNumber) throw new Error("Order Number is required");
      if (!customerName && !customerId) throw new Error("Customer is required");
      if (!totalAmount || isNaN(Number(totalAmount)))
        throw new Error("Total Amount is required and must be a number");
      if (!status) throw new Error("Status is required");
      // Find or create customer by name if needed
      let resolvedCustomerId = customerId;
      if (!resolvedCustomerId && customerName) {
        let customer = await prisma.customer.findFirst({
          where: { name: customerName },
        });
        if (!customer) {
          customer = await prisma.customer.create({
            data: { name: customerName },
          });
        }
        resolvedCustomerId = customer.id;
      }
      // Create the sale
      const data = {
        orderNumber: String(orderNumber),
        createdAt: new Date(createdAt),
        customerId: resolvedCustomerId,
        totalPrice: Number(totalAmount),
        status: String(status).toLowerCase(),
      };
      const createdSale = await prisma.sale.create({ data });
      created.push(createdSale);
    } catch (error) {
      errors.push({
        index: i,
        sale: sales[i],
        error: error.message,
      });
    }
  }
  return {
    importedCount: created.length,
    errorCount: errors.length,
    errors,
    data: created,
  };
};

module.exports = {
  createSale,
  getAllSales,
  getSaleById,
  updateSale,
  deleteSale,
  importSales,
};
