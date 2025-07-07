const categoryService = require("../services/category.service");

exports.createCategory = async (req, res, next) => {
  try {
    const category = await categoryService.createCategory(req.body);
    res.status(201).json({
      success: true,
      message: "Category created successfully",
      data: category,
    });
  } catch (error) {
    if (
      error.code === "P2002" || // Prisma unique constraint error
      error.message?.includes("Duplicate entry")
    ) {
      return res.status(400).json({
        success: false,
        message: "A category with this name already exists.",
      });
    }
    res.status(500).json({
      success: false,
      message: "An error occurred while creating the category.",
      error: error.message,
    });
  }
};

exports.getAllCategories = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 5,
      search = "",
      sortField = "",
      sortOrder = "",
    } = req.query;

    const result = await categoryService.getAllCategories(
      Number(page),
      Number(limit),
      search,
      sortField,
      sortOrder
    );

    res.json(result);
  } catch (error) {
    next(error);
  }
};

exports.getCategoryById = async (req, res, next) => {
  try {
    const category = await categoryService.getCategoryById(req.params.id);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    res.json({
      success: true,
      data: category,
    });
  } catch (error) {
    next(error);
  }
};

exports.updateCategory = async (req, res, next) => {
  try {
    const category = await categoryService.updateCategory(
      req.params.id,
      req.body
    );
    res.json({
      success: true,
      message: "Category updated successfully",
      data: category,
    });
  } catch (error) {
    next(error);
  }
};

exports.deleteCategory = async (req, res, next) => {
  try {
    await categoryService.deleteCategory(req.params.id);
    res.json({
      success: true,
      message: "Category deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

exports.getCategoryStats = async (req, res, next) => {
  try {
    const stats = await categoryService.getCategoryStats();
    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    next(error);
  }
};
