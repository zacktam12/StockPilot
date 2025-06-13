const productService = require("../services/product.service");

exports.createProduct = async (req, res) => {
  const product = await productService.createProduct(req.body);
  res.status(201).json(product);
};

exports.getAllProducts = async (req, res, next) => {
  try {
    const products = await productService.getAllProducts(req.query);
    res.json({ success: true, data: products });
  } catch (error) {
    next(error);
  }
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

exports.deleteProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    await productService.deleteProduct(Number.parseInt(id));

    res.json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (error) {
    next(error);
  }
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
