const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const createProduct = (data) => prisma.product.create({ data });

const getAllProducts = () =>
  prisma.product.findMany({
    where: { isDeleted: false },
  });

const getProductById = (id) =>
  prisma.product.findUnique({ where: { id: parseInt(id) } });

const updateProduct = (id, data) =>
  prisma.product.update({
    where: { id: parseInt(id) },
    data,
  });

const deleteProduct = (id) =>
  prisma.product.update({
    where: { id: parseInt(id) },
    data: { isDeleted: true },
  });

const getLowStockProducts = () => {
  const LOW_STOCK_THRESHOLD = 5;
  return prisma.product.findMany({
    where: {
      quantity: { lt: LOW_STOCK_THRESHOLD },
      isDeleted: false,
    },
  });
};

const getOutOfStockProducts = () =>
  prisma.product.findMany({
    where: {
      quantity: 0,
      isDeleted: false,
    },
  });

module.exports = {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  getLowStockProducts,
  getOutOfStockProducts,
};
