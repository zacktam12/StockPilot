const categoryRepo = require("../repositories/category.repository");
const { prisma } = require("../config/db");
const cacheService = require("./cache.service");

// Function to calculate category summary statistics
const calculateCategorySummary = async (where) => {
  try {
    const [totalCategories, activeCategories, inactiveCategories, parentCategories] = await Promise.all([
      prisma.category.count({ where }),
      prisma.category.count({ where: { ...where, isActive: true } }),
      prisma.category.count({ where: { ...where, isActive: false } }),
      prisma.category.count({ where: { ...where, parentId: null } })
    ]);

    return {
      totalCategories,
      activeCategories,
      inactiveCategories,
      parentCategories
    };
  } catch (error) {
    console.error('Error calculating category summary:', error);
    return {
      totalCategories: 0,
      activeCategories: 0,
      inactiveCategories: 0,
      parentCategories: 0
    };
  }
};

const createCategory = async (data) => {
  const result = await categoryRepo.create(data);
  
  // Invalidate cache
  await cacheService.deletePattern('categories:*');
  
  return result;
};

const getAllCategories = async (params = {}) => {
  const {
    page = 1,
    limit = 10,
    search = "",
    parentId = "",
    isActive = "",
    sortField = "sortOrder",
    sortOrder = "asc"
  } = params;

  // Generate cache key
  const cacheKey = cacheService.generateKey(
    'categories',
    page.toString(),
    limit.toString(),
    search || '',
    parentId || '',
    isActive || '',
    sortField,
    sortOrder
  );

  // Try to get from cache first
  const cached = await cacheService.get(cacheKey);
  if (cached) {
    return cached;
  }

  const pageNum = parseInt(page, 10) || 1;
  const limitNum = parseInt(limit, 10) || 10;

  const result = await categoryRepo.findActiveCategories(
    pageNum,
    limitNum,
    search,
    parentId,
    isActive,
    sortField,
    sortOrder
  );

  // Calculate summary statistics
  const where = { isDeleted: false };
  if (search) where.OR = [
    { name: { contains: search } },
    { description: { contains: search } },
    { slug: { contains: search } }
  ];
  if (parentId && parentId !== "all") where.parentId = parentId;
  if (isActive && isActive !== "all") where.isActive = isActive === "true";

  const summary = await calculateCategorySummary(where);

  const finalResult = {
    categories: result.data,
    total: result.pagination.total,
    summary
  };

  // Cache the result for 10 minutes (categories change less frequently)
  await cacheService.set(cacheKey, finalResult, 600);

  return finalResult;
};

const getCategoryById = (id) =>
  categoryRepo.findCategoryWithProducts(String(id));

const updateCategory = async (id, data) => {
  const result = await categoryRepo.update({ id: String(id) }, data);
  
  // Invalidate cache
  await cacheService.deletePattern('categories:*');
  
  return result;
};

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
    const result = await categoryRepo.softDelete({ id: String(id) });
    
    // Invalidate cache
    await cacheService.deletePattern('categories:*');
    
    return result;
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
