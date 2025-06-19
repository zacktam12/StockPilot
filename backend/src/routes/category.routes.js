const express = require("express");
const router = express.Router();
const categoryController = require("../controller/category.controller");
const {
  validateCreateCategory,
  validateUpdateCategory,
} = require("../validators/category.validator");
const { authenticate, authorize } = require("../middlewares/auth");

router.post(
  "/",
  authenticate,
  authorize("admin"),
  validateCreateCategory,
  categoryController.createCategory
);
router.put(
  "/:id",
  authenticate,
  authorize("admin", "staff"),
  validateUpdateCategory,
  categoryController.updateCategory
);
router.get(
  "/",
  authenticate,
  authorize("admin", "staff"),
  categoryController.getAllCategories
);
router.get(
  "/:id",
  authenticate,
  authorize("admin", "staff"),
  categoryController.getCategoryById
);
router.delete(
  "/:id",
  authenticate,
  authorize("admin"),
  categoryController.deleteCategory
);

module.exports = router;
