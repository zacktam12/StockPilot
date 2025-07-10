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
  // First, update all products in this category to have null categoryId
  await prisma.product.updateMany({
    where: {
      categoryId: id,
      isDeleted: false,
    },
    data: {
      categoryId: null,
    },
  });

  // Then soft delete the category
  return categoryRepo.softDelete({ id: String(id) });
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
