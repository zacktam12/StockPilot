const { prisma } = require("../config/db");
const BaseRepository = require("../utils/BaseRepository");

class PurchaseRepository extends BaseRepository {
  constructor() {
    super(prisma.purchase);
  }

  async findPurchasesWithDetails(page = 1, limit = 10, filters = {}) {
    const { startDate, endDate, supplierId, status, userId } = filters;

    const where = {
      isDeleted: false,
      ...(startDate &&
        endDate && {
          createdAt: {
            gte: new Date(startDate),
            lte: new Date(endDate),
          },
        }),
      ...(supplierId && { supplierId: Number.parseInt(supplierId) }),
      ...(status && { status }),
      ...(userId && { userId: Number.parseInt(userId) }),
    };

    return await this.findManyWithPagination(
      where,
      page,
      limit,
      {
        user: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
        supplier: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
        productPurchases: {
          include: {
            product: {
              select: { id: true, name: true, sku: true, cost: true },
            },
          },
        },
      },
      { createdAt: "desc" }
    );
  }

  async findPurchaseWithDetails(purchaseId) {
    return await this.findUnique(
      { id: purchaseId, isDeleted: false },
      {
        user: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
        supplier: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
        productPurchases: {
          include: {
            product: true,
          },
        },
      }
    );
  }

  async createPurchaseWithProducts(purchaseData, productPurchases) {
    return await this.prisma.$transaction(async (tx) => {
      // Create purchase
      const purchase = await tx.purchase.create({
        data: purchaseData,
      });

      // Create product purchases
      const productPurchasePromises = productPurchases.map((productPurchase) =>
        tx.productPurchase.create({
          data: {
            ...productPurchase,
            purchaseId: purchase.id,
            createdAt: new Date(),
            isDeleted: false,
          },
        })
      );

      await Promise.all(productPurchasePromises);

      return purchase;
    });
  }

  async getPurchaseReport(startDate, endDate) {
    const where = {
      isDeleted: false,
      createdAt: {
        gte: new Date(startDate),
        lte: new Date(endDate),
      },
    };

    const [purchases, totalPurchases, totalCost] = await Promise.all([
      this.findMany({
        where,
        include: {
          productPurchases: {
            include: {
              product: true,
            },
          },
        },
      }),
      this.count(where),
      this.prisma.purchase.aggregate({
        where,
        _sum: {
          totalCost: true,
        },
      }),
    ]);

    return {
      purchases,
      totalPurchases,
      totalCost: totalCost._sum.totalCost || 0,
    };
  }
}

module.exports = new PurchaseRepository();
