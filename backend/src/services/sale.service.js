const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const createSale = (data) => prisma.sale.create({ data });

// const getAllSales = () =>
//   prisma.sale.findMany({
//     where: { isDeleted: false },
//     include: { user: true, customer: true, productSales: true },
//   });

const getAllSales = async (query) => {
  const page = parseInt(query.page) || 1;
  const limit = parseInt(query.limit) || 10;
  const skip = (page - 1) * limit;

  const where = {
    isDeleted: false,
  };

  const [data, total] = await Promise.all([
    prisma.sale.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" }, // Optional: sort newest first
      include: {
        user: true,
        customer: true,
        productSales: true,
      },
    }),
    prisma.sale.count({ where }),
  ]);

  return {
    data,
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
    where: { id: parseInt(id) },
    include: { user: true, customer: true, productSales: true },
  });

const updateSale = (id, data) =>
  prisma.sale.update({
    where: { id: parseInt(id) },
    data,
  });

const deleteSale = (id) =>
  prisma.sale.update({
    where: { id: parseInt(id) },
    data: { isDeleted: true },
  });

module.exports = {
  createSale,
  getAllSales,
  getSaleById,
  updateSale,
  deleteSale,
};
