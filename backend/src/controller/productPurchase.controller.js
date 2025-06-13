const service = require("../services/productPurchase.service");

exports.createProductPurchase = async (req, res, next) => {
  try {
    const result = await service.createProductPurchase(req.body);
    res.status(201).json({
      success: true,
      message: "Product purchase created successfully.",
      data: result,
    });
  } catch (error) {
    // Unique constraint error (duplicate)
    if (error.code === "P2002") {
      return res.status(400).json({
        success: false,
        message: "A product purchase with these details already exists.",
      });
    }
    // Prisma required field or validation error
    if (
      error.message?.includes("Argument") &&
      error.message?.includes("is missing")
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Some required information is missing. Please fill in all required fields and try again.",
        details: error.message,
      });
    }
    // Prisma validation error for not allowed fields
    if (error.message?.includes("is not allowed")) {
      return res.status(400).json({
        success: false,
        message:
          "Your request contains fields that are not allowed. Please remove any extra fields and try again.",
        details: error.message,
      });
    }
    // Any other error
    res.status(500).json({
      success: false,
      message:
        "An unexpected error occurred while creating the product purchase.",
      error: error.message,
    });
  }
};

exports.getAllProductPurchases = async (req, res, next) => {
  try {
    const result = await service.getAllProductPurchases(req.query);
    res.json({
      success: true,
      data: result.data,
      meta: result.meta,
    });
  } catch (error) {
    next(error);
  }
};

exports.getProductPurchaseById = async (req, res, next) => {
  try {
    const result = await service.getProductPurchaseById(req.params.id);
    if (!result) {
      return res.status(404).json({
        success: false,
        message: "Product purchase not found.",
      });
    }
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

exports.updateProductPurchase = async (req, res, next) => {
  try {
    const result = await service.updateProductPurchase(req.params.id, req.body);
    res.json({
      success: true,
      message: "Product purchase updated successfully.",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

exports.deleteProductPurchase = async (req, res, next) => {
  try {
    await service.deleteProductPurchase(req.params.id);
    res.json({
      success: true,
      message: "Product purchase deleted successfully.",
    });
  } catch (error) {
    next(error);
  }
};
