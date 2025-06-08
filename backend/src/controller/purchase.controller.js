const purchaseService = require("../services/purchase.service");

exports.createPurchase = async (req, res) => {
  const purchase = await purchaseService.createPurchase(req.body);
  res.status(201).json(purchase);
};

exports.getAllPurchases = async (req, res) => {
  const purchases = await purchaseService.getAllPurchases();
  res.json(purchases);
};

exports.getPurchaseById = async (req, res) => {
  const purchase = await purchaseService.getPurchaseById(req.params.id);
  if (!purchase) return res.status(404).json({ error: "Purchase not found" });
  res.json(purchase);
};

exports.updatePurchase = async (req, res) => {
  const purchase = await purchaseService.updatePurchase(
    req.params.id,
    req.body
  );
  res.json(purchase);
};

exports.deletePurchase = async (req, res) => {
  await purchaseService.deletePurchase(req.params.id);
  res.json({ message: "Purchase soft-deleted" });
};
