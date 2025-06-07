const productService = require("../services/product.service");

exports.createProduct = async (req, res) => {
  const product = await productService.createProduct(req.body);
  res.status(201).json(product);
};

exports.getAllProducts = async (req, res) => {
  const products = await productService.getAllProducts();
  res.json(products);
};

exports.getProductById = async (req, res) => {
  const product = await productService.getProductById(req.params.id);
  if (!product) return res.status(404).json({ error: "Product not found" });
  res.json(product);
};

exports.updateProduct = async (req, res) => {
  const product = await productService.updateProduct(req.params.id, req.body);
  res.json(product);
};

exports.deleteProduct = async (req, res) => {
  await productService.deleteProduct(req.params.id);
  res.json({ message: "Product deleted (soft delete)" });
};

exports.getOutOfStockProducts = async (req, res, next) => {
  try {
    const result = await productService.getOutOfStockProducts();
    res.json({ success: true, data: result });
  } catch (error) {
    next(error); // shows error in middleware
  }
};
exports.getLowStockProducts = async (req, res, next) => {
  try {
    const result = await productService.getLowStockProducts();
    res.json({ success: true, data: result });
  } catch (error) {
    next(error); // shows error in middleware
  }
};
