const purchaseService = require("../services/purchase.service");
const NotificationService = require("../services/notification.service");

exports.createPurchase = async (req, res, next) => {
  try {
    const { items, ...purchaseData } = req.body;
    const userId = req.user.id; // Always use authenticated user

    // Generate a unique, human-readable PO number
    const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    const randomPart = Math.floor(1000 + Math.random() * 9000); // 4-digit random
    const poNumber = `PO-${datePart}-${randomPart}`;

    // Create purchase with userId from backend and generated poNumber
    const purchase = await purchaseService.createPurchase({
      ...purchaseData,
      userId,
      poNumber,
    });

    // Create notification for the purchase
    try {
      const supplier = purchase.supplier;
      await NotificationService.createPurchaseNotification(purchase, supplier);
    } catch (notificationError) {
      console.warn(
        "Failed to create purchase notification:",
        notificationError
      );
    }

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
    const result = await purchaseService.getAllPurchases(req.query);
    res.json({
      success: true,
      data: result.data,
      pagination: result.pagination,
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

exports.updatePurchaseStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!status) {
      return res
        .status(400)
        .json({ success: false, message: "Status is required." });
    }
    const purchase = await purchaseService.updatePurchase(req.params.id, {
      status,
    });
    if (!purchase) {
      return res
        .status(404)
        .json({ success: false, message: "Purchase not found." });
    }
    // Return the purchase object directly for frontend compatibility
    res.json(purchase);
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
