const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const createProductPurchase = (data) => prisma.productPurchase.create({ data });

const getAllProductPurchases = () =>
  prisma.productPurchase.findMany({
    where: { isDeleted: false },
    include: { product: true, purchase: true },
  });

const getProductPurchaseById = (id) =>
  prisma.productPurchase.findUnique({
    where: { id: String(id) },
    include: { product: true, purchase: true },
  });

const updateProductPurchase = (id, data) =>
  prisma.productPurchase.update({
    where: { id: String(id) },
    data,
  });

const deleteProductPurchase = (id) =>
  prisma.productPurchase.update({
    where: { id: String(id) },
    data: { isDeleted: true },
  });

module.exports = {
  createProductPurchase,
  getAllProductPurchases,
  getProductPurchaseById,
  updateProductPurchase,
  deleteProductPurchase,
};
