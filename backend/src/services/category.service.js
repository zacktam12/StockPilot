const categoryRepo = require("../repositories/category.repository");

const createCategory = (data) => categoryRepo.create(data);

const getAllCategories = (
  page = 1,
  limit = 10,
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

const deleteCategory = (id) => categoryRepo.softDelete({ id: String(id) });

const getCategoryStats = () => categoryRepo.getCategoryStats();

module.exports = {
  createCategory,
  getAllCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
  getCategoryStats,
};
