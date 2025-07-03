const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const createSale = async (data) => {
  const { customer_id, items, status = "completed", ...otherData } = data;

  // Calculate total price from items
  const totalPrice = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  // Create the sale
  const sale = await prisma.sale.create({
    data: {
      customerId: customer_id || null,
      totalPrice,
      status,
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
            mode: "insensitive",
          },
        },
      },
      {
        id: {
          contains: query.search,
          mode: "insensitive",
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

  // Ensure all sales have a numeric id (for frontend mapping)
  const mappedData = data.map((sale) => ({
    ...sale,
    id:
      typeof sale.id === "string" && !isNaN(Number(sale.id))
        ? Number(sale.id)
        : sale.id,
    created_at: sale.createdAt, // Add snake_case version for frontend compatibility
    total_amount: sale.totalPrice, // Add snake_case version for frontend compatibility
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

const updateSale = (id, data) =>
  prisma.sale.update({
    where: { id: String(id) },
    data,
  });

const deleteSale = (id) =>
  prisma.sale.update({
    where: { id: String(id) },
    data: { isDeleted: true },
  });

module.exports = {
  createSale,
  getAllSales,
  getSaleById,
  updateSale,
  deleteSale,
};
