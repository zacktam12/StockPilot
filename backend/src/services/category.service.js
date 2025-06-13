const categoryRepo = require("../repositories/category.repository");

const createCategory = (data) => categoryRepo.create(data);

const getAllCategories = (query) => {
  const page = parseInt(query.page) || 1;
  const limit = parseInt(query.limit) || 10;
  const search = query.search || "";
  return categoryRepo.findActiveCategories(page, limit, search);
};

const getCategoryById = (id) =>
  categoryRepo.findCategoryWithProducts(Number(id));

const updateCategory = (id, data) =>
  categoryRepo.update({ id: Number(id) }, data);

const deleteCategory = (id) => categoryRepo.softDelete({ id: Number(id) });

const getCategoryStats = () => categoryRepo.getCategoryStats();

module.exports = {
  createCategory,
  getAllCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
  getCategoryStats,
};
