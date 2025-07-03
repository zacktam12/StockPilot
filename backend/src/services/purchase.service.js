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
    where: { id: String(id) },
    include: { user: true, supplier: true, productPurchases: true },
  });

const updatePurchase = (id, data) =>
  prisma.purchase.update({
    where: { id: String(id) },
    data,
  });

const deletePurchase = (id) =>
  prisma.purchase.update({
    where: { id: String(id) },
    data: { isDeleted: true },
  });

const linkProductToPurchase = async (purchaseId, item) => {
  return prisma.productPurchase.create({
    data: {
      productId: item.productId,
      purchaseId,
      purchase_price: item.purchase_price,
      purchase_quantity: item.purchase_quantity,
    },
  });
};

const importPurchases = async (purchases) => {
  const created = [];
  for (const purchase of purchases) {
    // Map fields as needed; here we assume id, created_at, supplier, total_amount, status
    const data = {
      id: purchase.id,
      createdAt: purchase.created_at
        ? new Date(purchase.created_at)
        : new Date(),
      supplierId: purchase.supplier?.id || purchase.supplier_id || undefined,
      totalCost: purchase.total_amount || purchase.totalCost,
      status: purchase.status,
      // Add more fields as needed
    };
    const createdPurchase = await prisma.purchase.create({ data });
    created.push(createdPurchase);
  }
  return created;
};

module.exports = {
  createPurchase,
  getAllPurchases,
  getPurchaseById,
  updatePurchase,
  deletePurchase,
  linkProductToPurchase,
  importPurchases,
};
