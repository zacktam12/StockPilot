const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const cacheService = require("./cache.service");

// Function to calculate purchase summary statistics
const calculatePurchaseSummary = async (where) => {
  try {
    const [totalPurchases, totalCost, avgOrderValue, statusCounts] = await Promise.all([
      prisma.purchase.count({ where }),
      prisma.purchase.aggregate({
        where,
        _sum: { totalCost: true }
      }),
      prisma.purchase.aggregate({
        where,
        _avg: { totalCost: true }
      }),
      prisma.purchase.groupBy({
        by: ['status'],
        where,
        _count: { status: true }
      })
    ]);

    const statusBreakdown = statusCounts.reduce((acc, item) => {
      acc[item.status] = item._count.status;
      return acc;
    }, {});

    return {
      totalPurchases,
      totalCost: totalCost._sum.totalCost || 0,
      avgOrderValue: avgOrderValue._avg.totalCost || 0,
      statusBreakdown
    };
  } catch (error) {
    console.error('Error calculating purchase summary:', error);
    return {
      totalPurchases: 0,
      totalCost: 0,
      avgOrderValue: 0,
      statusBreakdown: {}
    };
  }
};

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
    const result = await tx.purchase.findUnique({
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

    // Invalidate cache after transaction
    await cacheService.deletePattern('purchases:*');
    await cacheService.deletePattern('products:*'); // Invalidate product cache due to quantity changes

    return result;
  });
};

const getAllPurchases = async (params = {}) => {
  const {
    page = 1,
    limit = 10,
    search = "",
    status = "",
    supplierId = "",
    paymentMethod = "",
    startDate = "",
    endDate = "",
    sortField = "createdAt",
    sortOrder = "desc"
  } = params;

  // Generate cache key
  const cacheKey = cacheService.generateKey(
    'purchases',
    page.toString(),
    limit.toString(),
    search || '',
    status || '',
    supplierId || '',
    paymentMethod || '',
    startDate || '',
    endDate || '',
    sortField,
    sortOrder
  );

  // Try to get from cache first
  const cached = await cacheService.get(cacheKey);
  if (cached) {
    return cached;
  }

  const pageNum = parseInt(page, 10) || 1;
  const limitNum = parseInt(limit, 10) || 10;
  const skip = (pageNum - 1) * limitNum;

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

  // Add status filter if provided
  if (status && status !== "all") {
    where.status = status;
  }

  // Add supplier filter if provided
  if (supplierId) {
    where.supplierId = supplierId;
  }

  // Add payment method filter if provided
  if (paymentMethod) {
    where.paymentMethod = paymentMethod;
  }

  // Add date range filter if provided
  if (startDate || endDate) {
    where.createdAt = {};
    if (startDate) {
      where.createdAt.gte = new Date(startDate);
    }
    if (endDate) {
      where.createdAt.lte = new Date(endDate);
    }
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
    take: limitNum,
  });

  // Calculate summary statistics
  const summary = await calculatePurchaseSummary(where);

  const result = {
    purchases,
    total: totalItems,
    summary
  };

  // Cache the result for 5 minutes
  await cacheService.set(cacheKey, result, 300);

  return result;
};

const getPurchaseById = async (id) => {
  try {
    const purchase = await prisma.purchase.findUnique({
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

    if (!purchase) {
      return null;
    }

    // Log the data structure for debugging
    console.log('Purchase data structure:', {
      id: purchase.id,
      productPurchasesCount: purchase.productPurchases?.length || 0,
      productPurchases: purchase.productPurchases?.map(pp => ({
        id: pp.id,
        productId: pp.productId,
        product: pp.product,
        productName: pp.product?.name,
        productSku: pp.product?.sku,
        quantity: pp.purchase_quantity,
        price: pp.purchase_price
      }))
    });
    
    // Debug each product purchase individually
    if (purchase.productPurchases && purchase.productPurchases.length > 0) {
      purchase.productPurchases.forEach((pp, index) => {
        console.log(`Backend Product Purchase ${index}:`, {
          id: pp.id,
          productId: pp.productId,
          product: pp.product,
          hasProduct: !!pp.product,
          productName: pp.product?.name,
          productSku: pp.product?.sku,
          productKeys: pp.product ? Object.keys(pp.product) : 'No product object'
        });
      });
    }

    return purchase;
  } catch (error) {
    console.error('Error fetching purchase by ID:', error);
    throw error;
  }
};

const updatePurchase = async (id, data) => {
  const result = await prisma.purchase.update({
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

  // Invalidate cache
  await cacheService.deletePattern('purchases:*');

  return result;
};

const deletePurchase = async (id) => {
  const result = await prisma.purchase.update({
    where: { id: String(id) },
    data: { isDeleted: true },
  });

  // Invalidate cache
  await cacheService.deletePattern('purchases:*');

  return result;
};

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
