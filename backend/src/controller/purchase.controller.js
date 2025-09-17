const purchaseService = require("../services/purchase.service");
const NotificationService = require("../services/notification.service");

// Enhanced error handling function
const handlePurchaseError = (error, res) => {
  console.error('Purchase Controller Error:', error);
  
  // Handle specific Prisma errors
  if (error.code === 'P2002') {
    return res.status(409).json({
      success: false,
      message: 'Purchase with this PO number already exists',
      field: error.meta?.target?.[0] || 'unknown'
    });
  }
  
  if (error.code === 'P2025') {
    return res.status(404).json({
      success: false,
      message: 'Purchase not found'
    });
  }
  
  if (error.code === 'P2003') {
    return res.status(400).json({
      success: false,
      message: 'Invalid supplier or product reference'
    });
  }
  
  // Handle validation errors
  if (error.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: error.details || [error.message]
    });
  }
  
  // Handle insufficient stock errors
  if (error.message && error.message.includes('insufficient stock')) {
    return res.status(400).json({
      success: false,
      message: 'Insufficient stock for one or more products',
      details: error.details
    });
  }
  
  // Default error response
  return res.status(500).json({
    success: false,
    message: 'Internal server error'
  });
};

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
      items, // Pass items to be handled in the transaction
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

    res.status(201).json({
      success: true,
      message: "Purchase created successfully",
      data: purchase,
    });
  } catch (error) {
    handlePurchaseError(error, res);
  }
};

exports.getAllPurchases = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = "",
      status = "",
      supplierId = "",
      paymentMethod = "",
      startDate = "",
      endDate = "",
      sortField = "createdAt",
      sortOrder = "desc"
    } = req.query;

    // Validate pagination parameters
    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit) || 10));

    const result = await purchaseService.getAllPurchases({
      page: pageNum,
      limit: limitNum,
      search,
      status,
      supplierId,
      paymentMethod,
      startDate,
      endDate,
      sortField,
      sortOrder
    });

    res.json({
      success: true,
      data: result.purchases,
      pagination: {
        currentPage: pageNum,
        totalPages: Math.ceil(result.total / limitNum),
        totalItems: result.total,
        itemsPerPage: limitNum,
        hasNext: pageNum < Math.ceil(result.total / limitNum),
        hasPrev: pageNum > 1
      },
      summary: result.summary || {}
    });
  } catch (error) {
    handlePurchaseError(error, res);
  }
};

exports.getPurchaseById = async (req, res, next) => {
  try {
    const result = await purchaseService.getPurchaseById(req.params.id);
    if (!result) {
      return res.status(404).json({
        success: false,
        message: "Purchase not found"
      });
    }
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    handlePurchaseError(error, res);
  }
};

exports.updatePurchase = async (req, res, next) => {
  try {
    const result = await purchaseService.updatePurchase(req.params.id, req.body);
    if (!result) {
      return res.status(404).json({
        success: false,
        message: "Purchase not found"
      });
    }
    res.json({
      success: true,
      message: 'Purchase updated successfully',
      data: result
    });
  } catch (error) {
    handlePurchaseError(error, res);
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
