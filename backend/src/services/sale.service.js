const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

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

const getAllSales = async (query) => {
  const page = parseInt(query.page, 10) || 1;
  const limit = parseInt(query.limit, 10) || 10;
  const skip = (page - 1) * limit;

  const where = {
    isDeleted: false,
  };

  // Add search filter if provided
  if (query.search) {
    where.OR = [
      {
        customer: {
          name: {
            contains: query.search,
          },
        },
      },
      {
        orderNumber: {
          contains: query.search,
        },
      },
    ];
  }

  // Add status filter if provided
  if (query.status && query.status !== "all") {
    where.status = query.status;
  }

  const [data, total] = await Promise.all([
    prisma.sale.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
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

  return {
    data: mappedData,
    meta: {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    },
  };
};

const getSaleById = (id) =>
  prisma.sale.findUnique({
    where: { id: String(id) },
    include: { user: true, customer: true, productSales: true },
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
    return prisma.sale.findUnique({
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
  return prisma.sale.update({
    where: { id: String(id) },
    data: { isDeleted: true },
  });
};

module.exports = {
  createSale,
  getAllSales,
  getSaleById,
  updateSale,
  deleteSale,
};
