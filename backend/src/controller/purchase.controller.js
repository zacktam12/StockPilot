const purchaseService = require("../services/purchase.service");

exports.createPurchase = async (req, res, next) => {
  try {
    const purchase = await purchaseService.createPurchase(req.body);
    res.status(201).json({
      success: true,
      message: "Purchase created successfully",
      data: purchase,
    });
  } catch (error) {
    next(error);
  }
};

exports.getAllPurchases = async (req, res, next) => {
  try {
    const result = await purchaseService.getAllPurchases(req.query);
    res.json({
      success: true,
      data: result.data,
      meta: result.meta,
    });
  } catch (error) {
    next(error);
  }
};

exports.getPurchaseById = async (req, res, next) => {
  try {
    const purchase = await purchaseService.getPurchaseById(req.params.id);
    if (!purchase) {
      return res.status(404).json({
        success: false,
        message: "Purchase not found",
      });
    }
    res.json({
      success: true,
      data: purchase,
    });
  } catch (error) {
    next(error);
  }
};

exports.updatePurchase = async (req, res, next) => {
  try {
    const purchase = await purchaseService.updatePurchase(
      req.params.id,
      req.body
    );
    res.json({
      success: true,
      message: "Purchase updated successfully",
      data: purchase,
    });
  } catch (error) {
    next(error);
  }
};

exports.deletePurchase = async (req, res, next) => {
  try {
    await purchaseService.deletePurchase(req.params.id);
    res.json({
      success: true,
      message: "Purchase soft-deleted",
    });
  } catch (error) {
    next(error);
  }
};
