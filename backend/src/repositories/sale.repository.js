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
          productSales: {
            include: {
              product: true,
            },
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
    const result = await this.prisma.productSale.groupBy({
      by: ["productId"],
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
      _sum: {
        sale_quantity: true,
        sale_price: true,
      },
      orderBy: {
        _sum: {
          sale_quantity: "desc",
        },
      },
      take: limit,
    });

    // Get product details
    const productIds = result.map((item) => item.productId);
    const products = await this.prisma.product.findMany({
      where: {
        id: {
          in: productIds,
        },
      },
      include: {
        category: true,
      },
    });

    return result.map((item) => {
      const product = products.find((p) => p.id === item.productId);
      return {
        product,
        totalQuantitySold: item._sum.sale_quantity,
        totalRevenue: item._sum.sale_price,
      };
    });
  }
}

module.exports = new SaleRepository();
