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

module.exports = {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
};
