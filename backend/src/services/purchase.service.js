const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const createPurchase = async (data) => {
  const { items, ...purchaseData } = data;

  return await prisma.$transaction(async (tx) => {
    // Create the purchase
    const purchase = await tx.purchase.create({
      data: purchaseData,
      include: {
        user: true,
        supplier: true,
        productPurchases: {
          include: {
            product: {
              select: { name: true, sku: true, barcode: true, image: true },
            },
          },
        },
      },
    });

    // Create product purchases if items are provided
    if (items && Array.isArray(items) && items.length > 0) {
      await Promise.all(
        items.map((item) =>
          tx.productPurchase.create({
            data: {
              productId: item.productId,
              purchaseId: purchase.id,
              purchase_price: item.purchase_price,
              purchase_quantity: item.purchase_quantity,
            },
          })
        )
      );

      // Update product quantities (increment stock)
      await Promise.all(
        items.map((item) =>
          tx.product.update({
            where: { id: item.productId },
            data: {
              quantity: {
                increment: item.purchase_quantity,
              },
            },
          })
        )
      );
    }

    // Return the purchase with updated data
    return await tx.purchase.findUnique({
      where: { id: purchase.id },
      include: {
        user: true,
        supplier: true,
        productPurchases: {
          include: {
            product: {
              select: { name: true, sku: true, barcode: true, image: true },
            },
          },
        },
      },
    });
  });
};

const getAllPurchases = async (params = {}) => {
  const {
    page = 1,
    limit = 5,
    search = "",
    sortField = "createdAt",
    sortOrder = "desc",
  } = params;

  const skip = (page - 1) * limit;
  const take = parseInt(limit);

  // Build where clause for search
  const where = {
    isDeleted: false,
  };

  if (search) {
    where.OR = [
      {
        poNumber: {
          contains: search,
        },
      },
      {
        supplier: {
          name: {
            contains: search,
          },
        },
      },
    ];
  }

  // Build orderBy clause
  let orderBy = {};
  if (sortField === "createdAt") {
    orderBy.createdAt = sortOrder;
  } else if (sortField === "totalCost") {
    orderBy.totalCost = sortOrder;
  } else if (sortField === "supplierName") {
    orderBy.supplier = {
      name: sortOrder,
    };
  } else if (sortField === "status") {
    orderBy.status = sortOrder;
  } else {
    orderBy.createdAt = "desc"; // default
  }

  // Get total count for pagination
  const totalItems = await prisma.purchase.count({ where });
  const totalPages = Math.ceil(totalItems / take);

  // Get paginated results
  const purchases = await prisma.purchase.findMany({
    where,
    include: {
      user: true,
      supplier: true,
      productPurchases: {
        include: {
          product: {
            select: { name: true, sku: true, barcode: true, image: true },
          },
        },
      },
    },
    orderBy,
    skip,
    take,
  });

  return {
    data: purchases,
    pagination: {
      currentPage: parseInt(page),
      totalPages,
      totalItems,
      itemsPerPage: take,
    },
  };
};

const getPurchaseById = (id) =>
  prisma.purchase.findUnique({
    where: { id: String(id) },
    include: {
      user: true,
      supplier: true,
      productPurchases: {
        include: {
          product: {
            select: { name: true, sku: true, barcode: true, image: true },
          },
        },
      },
    },
  });

const updatePurchase = (id, data) =>
  prisma.purchase.update({
    where: { id: String(id) },
    data,
    include: {
      user: true,
      supplier: true,
      productPurchases: {
        include: {
          product: {
            select: { name: true, sku: true, barcode: true, image: true },
          },
        },
      },
    },
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
  const errors = [];
  for (let i = 0; i < purchases.length; i++) {
    try {
      const purchase = purchases[i];
      // Map fields as needed; support both export/import formats
      const poNumber =
        purchase["Purchase Order"] ||
        purchase.poNumber ||
        purchase.orderNumber ||
        purchase.id;
      const createdAt =
        purchase["Date & Time"] ||
        purchase.created_at ||
        purchase.createdAt ||
        new Date();
      const supplierName =
        purchase.Supplier || purchase.supplierName || purchase.supplier?.name;
      const supplierId = purchase.supplierId || purchase.supplier_id;
      const totalAmount =
        purchase["Total Amount"] || purchase.total_amount || purchase.totalCost;
      const status = purchase.Status || purchase.status;
      // Validate required fields
      if (!poNumber) throw new Error("Purchase Order is required");
      if (!supplierName && !supplierId) throw new Error("Supplier is required");
      if (!totalAmount || isNaN(Number(totalAmount)))
        throw new Error("Total Amount is required and must be a number");
      if (!status) throw new Error("Status is required");
      // Find or create supplier by name if needed
      let resolvedSupplierId = supplierId;
      if (!resolvedSupplierId && supplierName) {
        let supplier = await prisma.supplier.findFirst({
          where: { name: supplierName },
        });
        if (!supplier) {
          supplier = await prisma.supplier.create({
            data: { name: supplierName },
          });
        }
        resolvedSupplierId = supplier.id;
      }
      // Create the purchase
      const data = {
        poNumber: String(poNumber),
        createdAt: new Date(createdAt),
        supplierId: resolvedSupplierId,
        totalCost: Number(totalAmount),
        status: String(status).toLowerCase(),
      };
      const createdPurchase = await prisma.purchase.create({ data });
      created.push(createdPurchase);
    } catch (error) {
      errors.push({
        index: i,
        purchase: purchases[i],
        error: error.message,
      });
    }
  }
  return {
    importedCount: created.length,
    errorCount: errors.length,
    errors,
    data: created,
  };
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
