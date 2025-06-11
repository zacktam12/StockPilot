const express = require("express");
const router = express.Router();
const categoryController = require("../controller/category.controller");
const {
  validateCreateCategory,
  validateUpdateCategory,
} = require("../validators/category.validator");

router.put("/:id", validateUpdateCategory, categoryController.updateCategory);
router.post("/", validateCreateCategory, categoryController.createCategory);
// router.post("/", categoryController.createCategory);
router.get("/", categoryController.getAllCategories);
router.get("/:id", categoryController.getCategoryById);
router.put("/:id", categoryController.updateCategory);
router.delete("/:id", categoryController.deleteCategory);

module.exports = router;
