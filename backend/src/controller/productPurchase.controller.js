const service = require("../services/productPurchase.service");

exports.createProductPurchase = async (req, res) => {
  const result = await service.createProductPurchase(req.body);
  res.status(201).json(result);
};

exports.getAllProductPurchases = async (req, res) => {
  const result = await service.getAllProductPurchases();
  res.json(result);
};

exports.getProductPurchaseById = async (req, res) => {
  const result = await service.getProductPurchaseById(req.params.id);
  if (!result) return res.status(404).json({ error: "Not found" });
  res.json(result);
};

exports.updateProductPurchase = async (req, res) => {
  const result = await service.updateProductPurchase(req.params.id, req.body);
  res.json(result);
};

exports.deleteProductPurchase = async (req, res) => {
  await service.deleteProductPurchase(req.params.id);
  res.json({ message: "Deleted successfully" });
};
