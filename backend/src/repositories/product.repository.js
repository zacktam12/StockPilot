const { prisma } = require("../config/db");
const BaseRepository = require("../utils/BaseRepository");

class ProductRepository extends BaseRepository {
  constructor() {
    super(prisma.product);
  }

  async findActiveProducts(page = 1, limit = 5, filters = {}) {
    const {
      search,
      categoryId,
      status,
      priceRange,
      stockRange,
      hasImage,
      hasBarcode,
      hasSku,
      sortField = "createdAt",
      sortOrder = "desc",
    } = filters;

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
      ...(categoryId && { categoryId: String(categoryId) }),
      ...(hasImage === "true" && { image: { not: null } }),
      ...(hasBarcode === "true" && { barcode: { not: null } }),
      ...(hasSku === "true" && { sku: { not: null } }),
    };

    // Handle status filter
    if (status) {
      switch (status) {
        case "in_stock":
          where.quantity = { gt: 0 };
          break;
        case "low_stock":
          // Use a simpler approach for low stock - we'll handle this in the service
          where.quantity = { lte: 5 }; // Default threshold
          break;
        case "out_of_stock":
          where.quantity = { equals: 0 };
          break;
      }
    }

    // Handle price range filter
    if (priceRange) {
      const priceConditions = {};
      if (priceRange.min !== undefined && priceRange.min !== null) {
        priceConditions.gte = parseFloat(priceRange.min);
      }
      if (priceRange.max !== undefined && priceRange.max !== null) {
        priceConditions.lte = parseFloat(priceRange.max);
      }
      if (Object.keys(priceConditions).length > 0) {
        where.price = priceConditions;
      }
    }

    // Handle stock range filter
    if (stockRange) {
      const stockConditions = {};
      if (stockRange.min !== undefined && stockRange.min !== null) {
        stockConditions.gte = parseInt(stockRange.min);
      }
      if (stockRange.max !== undefined && stockRange.max !== null) {
        stockConditions.lte = parseInt(stockRange.max);
      }
      if (Object.keys(stockConditions).length > 0) {
        where.quantity = { ...where.quantity, ...stockConditions };
      }
    }

    // Handle sorting
    const orderBy = {};
    if (sortField) {
      orderBy[sortField] = sortOrder || "desc";
    }

    return await this.findManyWithPagination(
      where,
      page,
      limit,
      { category: true },
      orderBy
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
    return await this.update({ id: String(productId) }, { quantity });
  }

  async incrementStock(productId, quantity) {
    return await prisma.product.update({
      where: { id: String(productId) },
      data: {
        quantity: {
          increment: quantity,
        },
      },
    });
  }

  async decrementStock(productId, quantity) {
    return await prisma.product.update({
      where: { id: String(productId) },
      data: {
        quantity: {
          decrement: quantity,
        },
      },
    });
  }

  async findWithSalesHistory(productId) {
    return await this.findUnique(
      { id: String(productId), isDeleted: false },
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
