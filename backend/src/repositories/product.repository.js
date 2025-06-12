const BaseRepository = require("../utils/BaseRepository");

class ProductRepository extends BaseRepository {
  constructor(prisma) {
    super(prisma.product);
  }

  async findActiveProducts(page = 1, limit = 10, filters = {}) {
    const { search, categoryId, lowStock } = filters;

    const where = {
      isDeleted: false,
      ...(search && {
        OR: [
          { name: { contains: search } },
          { description: { contains: search } },
          { sku: { contains: search } },
          { barcode: { contains: search } },
        ],
      }),
      ...(categoryId && { categoryId: Number.parseInt(categoryId) }),
    };

    // Handle low stock filter separately as it requires a raw query
    if (lowStock === "true") {
      const products = await this.prisma.product.findMany({
        where: {
          ...where,
          quantity: {
            lte: this.prisma.raw("minStock"),
          },
        },
        include: {
          category: true,
        },
        orderBy: { createdAt: "desc" },
      });

      const total = products.length;
      const skip = (page - 1) * limit;
      const paginatedProducts = products.slice(
        skip,
        skip + Number.parseInt(limit)
      );

      return {
        data: paginatedProducts,
        pagination: {
          page: Number.parseInt(page),
          limit: Number.parseInt(limit),
          total,
          pages: Math.ceil(total / limit),
        },
      };
    }

    return await this.findManyWithPagination(
      where,
      page,
      limit,
      { category: true },
      { createdAt: "desc" }
    );
  }

  async findBySku(sku) {
    return await this.findUnique(
      { sku, isDeleted: false },
      {
        category: true,
      }
    );
  }

  async findByBarcode(barcode) {
    return await this.findUnique(
      { barcode, isDeleted: false },
      {
        category: true,
      }
    );
  }

  async findLowStockProducts(threshold = 5) {
    return await this.findMany({
      where: {
        isDeleted: false,
        quantity: {
          lte: threshold,
        },
      },
      include: {
        category: true,
      },
      orderBy: { quantity: "asc" },
    });
  }

  async findByCategory(categoryId) {
    return await this.findMany({
      where: {
        categoryId,
        isDeleted: false,
      },
      include: {
        category: true,
      },
    });
  }

  async updateStock(productId, quantity) {
    return await this.update({ id: productId }, { quantity });
  }

  async incrementStock(productId, quantity) {
    return await this.prisma.product.update({
      where: { id: productId },
      data: {
        quantity: {
          increment: quantity,
        },
      },
    });
  }

  async decrementStock(productId, quantity) {
    return await this.prisma.product.update({
      where: { id: productId },
      data: {
        quantity: {
          decrement: quantity,
        },
      },
    });
  }

  async findWithSalesHistory(productId) {
    return await this.findUnique(
      { id: productId, isDeleted: false },
      {
        category: true,
        productSales: {
          include: {
            sale: {
              include: {
                user: {
                  select: { id: true, firstName: true, lastName: true },
                },
              },
            },
          },
        },
        productPurchases: {
          include: {
            purchase: {
              include: {
                user: {
                  select: { id: true, firstName: true, lastName: true },
                },
              },
            },
          },
        },
      }
    );
  }
}

module.exports = new ProductRepository();
