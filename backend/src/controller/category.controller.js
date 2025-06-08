const categoryService = require("../services/category.service");

exports.createCategory = async (req, res) => {
  const category = await categoryService.createCategory(req.body);
  res.status(201).json(category);
};

exports.getAllCategories = async (req, res) => {
  const categories = await categoryService.getAllCategories();
  res.json(categories);
};

exports.getCategoryById = async (req, res) => {
  const category = await categoryService.getCategoryById(req.params.id);
  if (!category) return res.status(404).json({ error: "Category not found" });
  res.json(category);
};

exports.updateCategory = async (req, res) => {
  const category = await categoryService.updateCategory(
    req.params.id,
    req.body
  );
  res.json(category);
};

exports.deleteCategory = async (req, res) => {
  await categoryService.deleteCategory(req.params.id);
  res.json({ message: "Category soft-deleted" });
};
