const BaseRepository = require("../utils/BaseRepository");
const { prisma } = require("../config/db");

class CategoryRepository extends BaseRepository {
  constructor() {
    super(prisma.category);
  }

  async findActiveCategories(page = 1, limit = 10, search = "") {
    const where = {
      isDeleted: false,
      ...(search && {
        OR: [
          { name: { contains: search, mode: "insensitive" } },
          { description: { contains: search, mode: "insensitive" } },
        ],
      }),
    };

    return this.findManyWithPagination(where, page, limit, {
      products: {
        where: { isDeleted: false },
        select: { id: true, name: true, quantity: true },
      },
    });
  }

  async findByName(name) {
    return this.findUnique({ name, isDeleted: false });
  }

  async findCategoryWithProducts(categoryId) {
    return this.findUnique(
      { id: categoryId, isDeleted: false },
      {
        products: {
          where: { isDeleted: false },
          include: { category: true },
        },
      }
    );
  }

  async getCategoryStats() {
    const categories = await this.findMany({
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
