const saleService = require("../services/sale.service");

exports.createSale = async (req, res) => {
  const sale = await saleService.createSale(req.body);
  res.status(201).json(sale);
};

exports.getAllSales = async (req, res) => {
  const sales = await saleService.getAllSales();
  res.json(sales);
};

exports.getSaleById = async (req, res) => {
  const sale = await saleService.getSaleById(req.params.id);
  if (!sale) return res.status(404).json({ error: "Sale not found" });
  res.json(sale);
};

exports.updateSale = async (req, res) => {
  const sale = await saleService.updateSale(req.params.id, req.body);
  res.json(sale);
};

exports.deleteSale = async (req, res, next) => {
  try {
    const { id } = req.params;
    await saleService.deleteSale(Number.parseInt(id));

    res.json({
      success: true,
      message: "Sale deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};
