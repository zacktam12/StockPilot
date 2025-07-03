const purchaseService = require("../services/purchase.service");

exports.createPurchase = async (req, res, next) => {
  try {
    const { items, ...purchaseData } = req.body;
    const userId = req.user.id; // Always use authenticated user
    // Create purchase with userId from backend
    const purchase = await purchaseService.createPurchase({
      ...purchaseData,
      userId,
    });
    // If items are present, link products to purchase
    if (items && Array.isArray(items) && items.length > 0) {
      // You may need to implement this in the service/repository
      await Promise.all(
        items.map((item) =>
          purchaseService.linkProductToPurchase(purchase.id, item)
        )
      );
    }
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
    const purchases = await purchaseService.getAllPurchases(req.query);
    res.json({
      success: true,
      data: purchases, // <-- Fix here
      // meta: ... (add pagination if needed)
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

exports.importPurchases = async (req, res, next) => {
  try {
    const { purchases } = req.body;
    if (!Array.isArray(purchases) || purchases.length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "No purchases provided for import." });
    }
    const result = await purchaseService.importPurchases(purchases);
    res.status(201).json({
      success: true,
      message: "Purchases imported successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};
