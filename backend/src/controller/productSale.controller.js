const productSaleService = require("../services/productSale.service");

exports.createProductSale = async (req, res, next) => {
  try {
    const productSale = await productSaleService.createProductSale(req.body);
    res.status(201).json({
      success: true,
      message: "Product sale created successfully",
      data: productSale,
    });
  } catch (error) {
    next(error);
  }
};

exports.getAllProductSales = async (req, res, next) => {
  try {
    const result = await productSaleService.getAllProductSales(req.query);
    res.json({
      success: true,
      data: result.data,
      meta: result.meta,
    });
  } catch (error) {
    next(error);
  }
};

exports.getProductSaleById = async (req, res, next) => {
  try {
    const item = await productSaleService.getProductSaleById(req.params.id);
    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Product sale not found",
      });
    }
    res.json({
      success: true,
      data: item,
    });
  } catch (error) {
    next(error);
  }
};

exports.updateProductSale = async (req, res, next) => {
  try {
    const updated = await productSaleService.updateProductSale(
      req.params.id,
      req.body
    );
    res.json({
      success: true,
      message: "Product sale updated successfully",
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};

exports.deleteProductSale = async (req, res, next) => {
  try {
    await productSaleService.deleteProductSale(req.params.id);
    res.json({
      success: true,
      message: "Product sale deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};
