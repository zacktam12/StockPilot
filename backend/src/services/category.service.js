const categoryRepo = require("../repositories/category.repository");
const { prisma } = require("../config/db");

const createCategory = (data) => categoryRepo.create(data);

const getAllCategories = (
  page = 1,
  limit = 5,
  search = "",
  sortField = "",
  sortOrder = ""
) => {
  return categoryRepo.findActiveCategories(
    page,
    limit,
    search,
    sortField,
    sortOrder
  );
};

const getCategoryById = (id) =>
  categoryRepo.findCategoryWithProducts(String(id));

const updateCategory = (id, data) =>
  categoryRepo.update({ id: String(id) }, data);

const deleteCategory = async (id) => {
  try {
    // First, get all products in this category
    const productsInCategory = await prisma.product.findMany({
      where: {
        categoryId: id,
        isDeleted: false,
      },
    });

    // Update each product individually to remove the category reference
    for (const product of productsInCategory) {
      await prisma.product.update({
        where: { id: product.id },
        data: {
          categoryId: null,
        },
      });
    }

    // Then soft delete the category
    return categoryRepo.softDelete({ id: String(id) });
  } catch (error) {
    console.error("Error deleting category:", error);
    throw error;
  }
};

const getCategoryStats = () => categoryRepo.getCategoryStats();

module.exports = {
  createCategory,
  getAllCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
  getCategoryStats,
};
