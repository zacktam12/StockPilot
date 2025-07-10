const { prisma } = require("../config/db");
const BaseRepository = require("../utils/BaseRepository");

class SaleRepository extends BaseRepository {
  constructor() {
    super(prisma.sale);
  }

  async findSalesWithDetails(page = 1, limit = 10, filters = {}) {
    const { startDate, endDate, customerId, status, userId } = filters;

    const where = {
      isDeleted: false,
      ...(startDate &&
        endDate && {
          createdAt: {
            gte: new Date(startDate),
            lte: new Date(endDate),
          },
        }),
      ...(customerId && { customerId }),
      ...(status && { status }),
      ...(userId && { userId }),
    };

    return await this.findManyWithPagination(
      where,
      page,
      limit,
      {
        user: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
        customer: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
        productSales: {
          include: {
            product: {
              select: { id: true, name: true, sku: true, price: true },
            },
          },
        },
      },
      { createdAt: "desc" }
    );
  }

  async findSaleWithDetails(saleId) {
    return await this.findUnique(
      { id: saleId, isDeleted: false },
      {
        user: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
        customer: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
        productSales: {
          include: {
            product: true,
          },
        },
      }
    );
  }

  async createSaleWithProducts(saleData, productSales) {
    return await this.prisma.$transaction(async (tx) => {
      // Create sale
      const sale = await tx.sale.create({
        data: saleData,
      });

      // Create product sales
      const productSalePromises = productSales.map((productSale) =>
        tx.productSale.create({
          data: {
            ...productSale,
            saleId: sale.id,
            createdAt: new Date(),
            isDeleted: false,
          },
        })
      );

      await Promise.all(productSalePromises);

      return sale;
    });
  }

  async getSalesReport(startDate, endDate) {
    const where = {
      isDeleted: false,
      createdAt: {
        gte: new Date(startDate),
        lte: new Date(endDate),
      },
    };

    const [sales, totalSales, totalRevenue] = await Promise.all([
      this.findMany({
        where,
        include: {
          customer: {
            select: { id: true, name: true, email: true },
          },
        },
      }),
      this.count(where),
      this.prisma.sale.aggregate({
        where,
        _sum: {
          totalPrice: true,
        },
      }),
    ]);

    return {
      sales,
      totalSales,
      totalRevenue: totalRevenue._sum.totalPrice || 0,
    };
  }

  async getTopSellingProducts(startDate, endDate, limit = 10) {
    try {
      // 1. Find all product sales in the date range
      const productSales = await this.prisma.productSale.findMany({
        where: {
          isDeleted: false,
          sale: {
            isDeleted: false,
            createdAt: {
              gte: new Date(startDate),
              lte: new Date(endDate),
            },
          },
        },
        include: {
          product: true,
        },
      });

      // 2. Aggregate in JS
      const productMap = {};
      for (const ps of productSales) {
        const pid = ps.productId;
        if (!productMap[pid]) {
          productMap[pid] = {
            product: ps.product,
            totalQuantitySold: 0,
            totalRevenue: 0,
          };
        }
        productMap[pid].totalQuantitySold += ps.sale_quantity;
        productMap[pid].totalRevenue += ps.sale_price;
      }

      // 3. Sort and return top N
      return Object.values(productMap)
        .sort((a, b) => b.totalQuantitySold - a.totalQuantitySold)
        .slice(0, limit);
    } catch (error) {
      console.error("Error in getTopSellingProducts:", error);
      return [];
    }
  }
}

module.exports = new SaleRepository();
