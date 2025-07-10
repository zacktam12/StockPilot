const productService = require("../services/product.service");
const NotificationService = require("../services/notification.service");

exports.createProduct = async (req, res, next) => {
  try {
    console.log("Product creation payload:", req.body);
    const result = await productService.createProduct(req.body);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
};

exports.getAllProducts = async (req, res, next) => {
  try {
    const result = await productService.getAllProducts(req.query);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

exports.getProductById = async (req, res, next) => {
  try {
    const result = await productService.getProductById(req.params.id);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

exports.updateProduct = async (req, res, next) => {
  try {
    console.log("Product controller updateProduct called");
    console.log("Product ID:", req.params.id);
    console.log("Request body:", req.body);

    const result = await productService.updateProduct(req.params.id, req.body);
    console.log("Product controller result:", result);
    res.json(result);
  } catch (error) {
    console.error("Product controller error:", error);
    next(error);
  }
};

exports.deleteProduct = async (req, res, next) => {
  try {
    const result = await productService.deleteProduct(req.params.id);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

exports.getLowStockProducts = async (req, res, next) => {
  try {
    const threshold = req.query.threshold || 5;
    const result = await productService.getLowStockProducts(threshold);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

exports.updateStock = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { quantity } = req.body;
    const result = await productService.updateStock(id, quantity);

    // Check if stock is low and create notification
    if (result.data && result.data.quantity <= (result.data.minStock || 5)) {
      try {
        await NotificationService.createLowStockNotification(result.data);
      } catch (notificationError) {
        console.warn(
          "Failed to create low stock notification:",
          notificationError
        );
      }
    }

    res.json(result);
  } catch (error) {
    next(error);
  }
};

exports.incrementStock = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { quantity } = req.body;
    const result = await productService.incrementStock(id, quantity);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

exports.decrementStock = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { quantity } = req.body;
    const result = await productService.decrementStock(id, quantity);

    // Check if stock is low and create notification
    if (result.data && result.data.quantity <= (result.data.minStock || 5)) {
      try {
        await NotificationService.createLowStockNotification(result.data);
      } catch (notificationError) {
        console.warn(
          "Failed to create low stock notification:",
          notificationError
        );
      }
    }

    res.json(result);
  } catch (error) {
    next(error);
  }
};

exports.bulkImportProducts = async (req, res, next) => {
  try {
    const { products } = req.body;

    if (!products || !Array.isArray(products)) {
      return res.status(400).json({
        success: false,
        error: "Products array is required",
      });
    }

    const result = await productService.bulkImportProducts(products);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

exports.bulkDeleteProducts = async (req, res, next) => {
  try {
    const { productIds } = req.body;

    if (!productIds || !Array.isArray(productIds)) {
      return res.status(400).json({
        success: false,
        error: "Product IDs array is required",
      });
    }

    const result = await productService.bulkDeleteProducts(productIds);
    res.json(result);
  } catch (error) {
    next(error);
  }
};
