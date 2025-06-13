const productRepository = require("../repositories/product.repository");

const createProduct = (data) => productRepository.create(data);

const getAllProducts = () =>
  productRepository.findMany({
    where: { isDeleted: false },
  });

const getProductById = (id) =>
  productRepository.findUnique({ id: Number(id), isDeleted: false });

const updateProduct = (id, data) =>
  productRepository.update({ id: Number(id) }, data);

const deleteProduct = (id) =>
  productRepository.update({ id: Number(id) }, { isDeleted: true });

const getLowStockProducts = () =>
  productRepository.findMany({
    where: {
      quantity: { lt: 5 },
      isDeleted: false,
    },
  });

const getOutOfStockProducts = () =>
  productRepository.findMany({
    where: {
      quantity: 0,
      isDeleted: false,
    },
  });

module.exports = {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  getLowStockProducts,
  getOutOfStockProducts,
};
