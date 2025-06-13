const saleService = require("../services/sale.service");

exports.createSale = async (req, res, next) => {
  try {
    const sale = await saleService.createSale(req.body);
    res.status(201).json({
      success: true,
      message: "Sale created successfully",
      data: sale,
    });
  } catch (error) {
    next(error);
  }
};

exports.getAllSales = async (req, res, next) => {
  try {
    const result = await saleService.getAllSales(req.query); // supports pagination/search if available
    res.json({
      success: true,
      data: result.data,
      meta: result.meta,
    });
  } catch (error) {
    next(error);
  }
};

exports.getSaleById = async (req, res, next) => {
  try {
    const sale = await saleService.getSaleById(req.params.id);
    if (!sale) {
      return res.status(404).json({
        success: false,
        message: "Sale not found",
      });
    }

    res.json({
      success: true,
      data: sale,
    });
  } catch (error) {
    next(error);
  }
};

exports.updateSale = async (req, res, next) => {
  try {
    const sale = await saleService.updateSale(req.params.id, req.body);
    res.json({
      success: true,
      message: "Sale updated successfully",
      data: sale,
    });
  } catch (error) {
    next(error);
  }
};

exports.deleteSale = async (req, res, next) => {
  try {
    await saleService.deleteSale(Number.parseInt(req.params.id));
    res.json({
      success: true,
      message: "Sale deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};
