const productSaleService = require("../services/productSale.service");

exports.createProductSale = async (req, res) => {
  const productSale = await productSaleService.createProductSale(req.body);
  res.status(201).json(productSale);
};

exports.getAllProductSales = async (req, res) => {
  const items = await productSaleService.getAllProductSales();
  res.json(items);
};

exports.getProductSaleById = async (req, res) => {
  const item = await productSaleService.getProductSaleById(req.params.id);
  if (!item) return res.status(404).json({ error: "Not found" });
  res.json(item);
};

exports.updateProductSale = async (req, res) => {
  const updated = await productSaleService.updateProductSale(
    req.params.id,
    req.body
  );
  res.json(updated);
};

exports.deleteProductSale = async (req, res) => {
  await productSaleService.deleteProductSale(req.params.id);
  res.json({ message: "Deleted" });
};
