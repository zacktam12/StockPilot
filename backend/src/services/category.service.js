const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const createCategory = (data) => prisma.category.create({ data });

const getAllCategories = () =>
  prisma.category.findMany({
    where: { isDeleted: false },
  });

const getCategoryById = (id) =>
  prisma.category.findUnique({
    where: { id: parseInt(id) },
  });

const updateCategory = (id, data) =>
  prisma.category.update({
    where: { id: parseInt(id) },
    data,
  });

const deleteCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    await categoryService.deleteCategory(Number.parseInt(id));

    res.json({
      success: true,
      message: "Category deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createCategory,
  getAllCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
};
