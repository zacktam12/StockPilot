const express = require("express");
const router = express.Router();
const productController = require("../controller/product.controller");
const {
  validateCreateProduct,
  validateUpdateProduct,
} = require("../validators/product.validator");
const { authenticate, authorize } = require("../middlewares/auth");
const { getPagination } = require("../utils/pagination");
const BaseRepository = require("../utils/BaseRepository");
const { prisma } = require("../config/db");

const productRepo = new BaseRepository(prisma.product);

const getAllProducts = async (req) => {
  const { skip, limit } = getPagination(req);
  return productRepo.findMany({ skip, take: limit });
};

// Route definitions
router.post(
  "/",
  authenticate,
  authorize("admin"),
  validateCreateProduct,
  productController.createProduct
);
router.put(
  "/:id",
  authenticate,
  authorize("admin"),
  validateUpdateProduct,
  productController.updateProduct
);
router.get(
  "/",
  authenticate,
  authorize("admin", "staff"),
  productController.getAllProducts
);
router.delete(
  "/:id",
  authenticate,
  authorize("admin"),
  productController.deleteProduct
);
router.get(
  "/low-stock",
  authenticate,
  authorize("admin", "staff"),
  productController.getLowStockProducts
);
router.get(
  "/out-of-stock",
  authenticate,
  authorize("admin", "staff"),
  productController.getOutOfStockProducts
);
router.get(
  "/:id",
  authenticate,
  authorize("admin", "staff"),
  productController.getProductById
);

// Export both the router and the helper function
module.exports = router;

module.exports.getAllProducts = getAllProducts;
