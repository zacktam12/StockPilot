const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const createSale = (data) => prisma.sale.create({ data });

const getAllSales = () =>
  prisma.sale.findMany({
    where: { isDeleted: false },
    include: { user: true, customer: true, productSales: true },
  });

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
