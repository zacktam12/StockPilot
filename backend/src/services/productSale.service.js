const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const createProductSale = (data) => prisma.productSale.create({ data });

const getAllProductSales = () =>
  prisma.productSale.findMany({
    where: { isDeleted: false },
    include: { product: true, sale: true },
  });

const getProductSaleById = (id) =>
  prisma.productSale.findUnique({
    where: { id: String(id) },
    include: { product: true, sale: true },
  });

const updateProductSale = (id, data) =>
  prisma.productSale.update({
    where: { id: String(id) },
    data,
  });

const deleteProductSale = (id) =>
  prisma.productSale.update({
    where: { id: String(id) },
    data: { isDeleted: true },
  });

module.exports = {
  createProductSale,
  getAllProductSales,
  getProductSaleById,
  updateProductSale,
  deleteProductSale,
};
