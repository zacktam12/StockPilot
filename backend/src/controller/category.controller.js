const categoryService = require("../services/category.service");

// Enhanced error handling function
const handleCategoryError = (error, res) => {
  // Handle specific Prisma errors
  if (error.code === 'P2002') {
    return res.status(409).json({
      success: false,
      message: 'Category with this name or slug already exists',
      field: error.meta?.target?.[0] || 'unknown'
    });
  }
  
  if (error.code === 'P2025') {
    return res.status(404).json({
      success: false,
      message: 'Category not found'
    });
  }
  
  if (error.code === 'P2003') {
    return res.status(400).json({
      success: false,
      message: 'Invalid parent category reference'
    });
  }
  
  // Handle validation errors
  if (error.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: error.details || [error.message]
    });
  }
  
  // Handle category in use errors
  if (error.message && error.message.includes('category is in use')) {
    return res.status(400).json({
      success: false,
      message: 'Cannot delete category: it contains products or subcategories'
    });
  }
  
  // Default error response
  return res.status(500).json({
    success: false,
    message: 'Internal server error'
  });
};

exports.createCategory = async (req, res, next) => {
  try {
    const result = await categoryService.createCategory(req.body);
    res.status(201).json({
      success: true,
      message: "Category created successfully",
      data: result,
    });
  } catch (error) {
    handleCategoryError(error, res);
  }
};

exports.getAllCategories = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = "",
      parentId = "",
      isActive = "",
      sortField = "sortOrder",
      sortOrder = "asc"
    } = req.query;

    // Validate pagination parameters
    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit) || 10));

    const result = await categoryService.getAllCategories({
      page: pageNum,
      limit: limitNum,
      search,
      parentId,
      isActive,
      sortField,
      sortOrder
    });

    res.json({
      success: true,
      data: result.categories,
      pagination: {
        currentPage: pageNum,
        totalPages: Math.ceil(result.total / limitNum),
        totalItems: result.total,
        itemsPerPage: limitNum,
        hasNext: pageNum < Math.ceil(result.total / limitNum),
        hasPrev: pageNum > 1
      },
      summary: result.summary || {}
    });
  } catch (error) {
    handleCategoryError(error, res);
  }
};

exports.getCategoryById = async (req, res, next) => {
  try {
    const result = await categoryService.getCategoryById(req.params.id);
    if (!result) {
      return res.status(404).json({
        success: false,
        message: "Category not found"
      });
    }
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    handleCategoryError(error, res);
  }
};

exports.updateCategory = async (req, res, next) => {
  try {
    const result = await categoryService.updateCategory(req.params.id, req.body);
    if (!result) {
      return res.status(404).json({
        success: false,
        message: "Category not found"
      });
    }
    res.json({
      success: true,
      message: 'Category updated successfully',
      data: result
    });
  } catch (error) {
    handleCategoryError(error, res);
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

exports.bulkImportCategories = async (req, res, next) => {
  try {
    const { categories } = req.body;

    if (!categories || !Array.isArray(categories)) {
      return res.status(400).json({
        success: false,
        error: "Categories array is required",
      });
    }

    const result = await categoryService.bulkImportCategories(categories);
    res.json(result);
  } catch (error) {
    next(error);
  }
};