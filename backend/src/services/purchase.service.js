const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const createPurchase = (data) => prisma.purchase.create({ data });

const getAllPurchases = () =>
  prisma.purchase.findMany({
    where: { isDeleted: false },
    include: { user: true, supplier: true, productPurchases: true },
  });

const getPurchaseById = (id) =>
  prisma.purchase.findUnique({
    where: { id: parseInt(id) },
    include: { user: true, supplier: true, productPurchases: true },
  });

const updatePurchase = (id, data) =>
  prisma.purchase.update({
    where: { id: parseInt(id) },
    data,
  });

const deletePurchase = (id) =>
  prisma.purchase.update({
    where: { id: parseInt(id) },
    data: { isDeleted: true },
  });

module.exports = {
  createPurchase,
  getAllPurchases,
  getPurchaseById,
  updatePurchase,
  deletePurchase,
};
