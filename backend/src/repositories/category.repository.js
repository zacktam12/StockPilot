const BaseRepository = require("../utils/BaseRepository");
const { prisma } = require("../config/db");

class CategoryRepository extends BaseRepository {
  constructor() {
    super(prisma.category);
  }

  async findActiveCategories(
    page = 1,
    limit = 10,
    search = "",
    sortField = "",
    sortOrder = ""
  ) {
    const where = {
      isDeleted: false,
      ...(search && {
        OR: [
          { name: { contains: search } },
          { description: { contains: search } },
        ],
      }),
    };

    // Build orderBy object
    const orderBy = {};
    if (sortField && sortOrder) {
      orderBy[sortField] = sortOrder.toLowerCase();
    } else {
      orderBy.createdAt = "desc";
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Get total count for pagination
    const totalItems = await this.model.count({ where });
    const totalPages = Math.ceil(totalItems / limit);

    // Get paginated data
    const data = await this.model.findMany({
      where,
      orderBy,
      skip,
      take: limit,
      include: {
        products: {
          where: { isDeleted: false },
          select: { id: true, name: true, quantity: true },
        },
      },
    });

    return {
      success: true,
      data: data || [],
      pagination: {
        currentPage: page,
        totalPages,
        totalItems,
        itemsPerPage: limit,
      },
    };
  }

  async findByName(name) {
    return this.model.findUnique({ where: { name, isDeleted: false } });
  }

  async findCategoryWithProducts(categoryId) {
    return this.model.findUnique({
      where: { id: categoryId, isDeleted: false },
      include: {
        products: {
          where: { isDeleted: false },
          include: { category: true },
        },
      },
    });
  }

  async getCategoryStats() {
    const categories = await this.model.findMany({
      where: { isDeleted: false },
      include: {
        products: {
          where: { isDeleted: false },
          select: {
            id: true,
            quantity: true,
            price: true,
          },
        },
      },
    });

    return categories.map((category) => ({
      ...category,
      productCount: category.products.length,
      totalValue: category.products.reduce(
        (sum, product) => sum + product.quantity * product.price,
        0
      ),
      totalQuantity: category.products.reduce(
        (sum, product) => sum + product.quantity,
        0
      ),
    }));
  }
}

module.exports = new CategoryRepository();
