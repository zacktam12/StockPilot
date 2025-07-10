const { prisma } = require("../config/db");
const BaseRepository = require("../utils/BaseRepository");

// Helper function to get low stock threshold from settings
const getLowStockThreshold = async () => {
  try {
    const settings = await prisma.settings.findFirst();
    return settings?.lowStockThreshold || 10; // Default to 10 if not set
  } catch (error) {
    console.warn(
      "Failed to get low stock threshold from settings, using default:",
      error.message
    );
    return 10; // Default fallback
  }
};

class ProductRepository extends BaseRepository {
  constructor() {
    super(prisma.product);
  }

  async findActiveProducts(page = 1, limit = 5, filters = {}) {
    console.log("findActiveProducts received filters:", filters);
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

    let where = {};

    // Handle search - implement case-insensitive search for MySQL
    if (search) {
      // Create multiple search variations for case-insensitive search
      const searchVariations = [
        search,
        search.toLowerCase(),
        search.toUpperCase(),
        search.charAt(0).toUpperCase() + search.slice(1).toLowerCase(),
      ];

      // Remove duplicates
      const uniqueSearches = [...new Set(searchVariations)];

      where = {
        OR: uniqueSearches.flatMap((searchTerm) => [
          { name: { contains: searchTerm } },
          { description: { contains: searchTerm } },
          { sku: { contains: searchTerm } },
          { barcode: { contains: searchTerm } },
        ]),
      };
    }

    // Add other filters
    if (categoryId) where.categoryId = String(categoryId);
    if (hasImage === true) where.image = { not: null };
    if (hasBarcode === true) where.barcode = { not: null };
    if (hasSku === true) where.sku = { not: null };

    // Handle status filter with configurable threshold
    if (status) {
      const lowStockThreshold = await getLowStockThreshold();

      switch (status) {
        case "in_stock":
          where.quantity = { gt: 0 };
          break;
        case "low_stock":
          // Low stock: quantity > 0 but <= threshold (configurable)
          where.quantity = {
            gt: 0,
            lte: lowStockThreshold,
          };
          break;
        case "out_of_stock":
          where.quantity = { equals: 0 };
          break;
      }
    }

    // Handle price range filter
    if (
      priceRange &&
      (priceRange.min !== undefined || priceRange.max !== undefined)
    ) {
      const priceConditions = {};
      if (
        priceRange.min !== undefined &&
        priceRange.min !== null &&
        priceRange.min !== ""
      ) {
        priceConditions.gte = parseFloat(priceRange.min);
      }
      if (
        priceRange.max !== undefined &&
        priceRange.max !== null &&
        priceRange.max !== ""
      ) {
        priceConditions.lte = parseFloat(priceRange.max);
      }
      if (Object.keys(priceConditions).length > 0) {
        where.price = priceConditions;
      }
    }

    // Handle stock range filter
    if (
      stockRange &&
      (stockRange.min !== undefined || stockRange.max !== undefined)
    ) {
      const stockConditions = {};
      if (
        stockRange.min !== undefined &&
        stockRange.min !== null &&
        stockRange.min !== ""
      ) {
        stockConditions.gte = parseInt(stockRange.min);
      }
      if (
        stockRange.max !== undefined &&
        stockRange.max !== null &&
        stockRange.max !== ""
      ) {
        stockConditions.lte = parseInt(stockRange.max);
      }
      if (Object.keys(stockConditions).length > 0) {
        // If we already have quantity conditions from status filter, merge them
        if (where.quantity) {
          where.quantity = { ...where.quantity, ...stockConditions };
        } else {
          where.quantity = stockConditions;
        }
      }
    }

    // Handle sorting
    const orderBy = {};
    if (sortField) {
      // Map frontend field names to database column names
      const fieldMapping = {
        name: "name",
        price: "price",
        quantity: "quantity",
        createdAt: "createdAt",
        updatedAt: "updatedAt",
        created_at: "createdAt",
        updated_at: "updatedAt",
      };
      const dbField = fieldMapping[sortField] || sortField;
      orderBy[dbField] = sortOrder || "desc";
    }

    console.log("Final where clause:", where);
    console.log("Final orderBy:", orderBy);

    // If page or limit is undefined, fetch all products without pagination
    if (page === undefined || limit === undefined) {
      const data = await this.findMany({
        where,
        include: { category: true },
        orderBy,
      });
      const total = await this.model.count({ where });

      return {
        data,
        pagination: {
          page: 1,
          limit: total,
          total,
          pages: 1,
        },
      };
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
      { sku },
      {
        category: true,
      }
    );
  }

  async findByBarcode(barcode) {
    return await this.findUnique(
      { barcode },
      {
        category: true,
      }
    );
  }

  async findLowStockProducts(threshold = null) {
    // Use provided threshold or get from settings
    const lowStockThreshold = threshold || (await getLowStockThreshold());
    // Fetch all products with quantity > 0 or quantity === 0 (out of stock)
    const products = await this.findMany({
      where: {
        isDeleted: false,
        // Get all products with quantity >= 0 (so we can filter both low and out of stock)
        quantity: { gte: 0 },
      },
      include: { category: true },
      orderBy: { quantity: "asc" },
    });
    // Filter in JS: out of stock or low stock (quantity <= minStock or threshold)
    return products.filter((p) => {
      if (p.quantity === 0) return true; // Out of stock
      const minStock = p.minStock != null ? p.minStock : lowStockThreshold;
      return p.quantity > 0 && p.quantity <= minStock;
    });
  }

  async findByCategory(categoryId) {
    return await this.findMany({
      where: {
        categoryId,
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
      { id: String(productId) },
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
