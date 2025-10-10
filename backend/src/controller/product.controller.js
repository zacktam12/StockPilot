const productService = require("../services/product.service");
const NotificationService = require("../services/notification.service");

// Enhanced error handling function
const handleProductError = (error, res) => {
  // Handle specific Prisma errors
  if (error.code === 'P2002') {
    return res.status(409).json({
      success: false,
      message: 'Product with this information already exists',
      field: error.meta?.target?.[0] || 'unknown'
    });
  }
  
  if (error.code === 'P2025') {
    return res.status(404).json({
      success: false,
      message: 'Product not found'
    });
  }
  
  if (error.code === 'P2003') {
    return res.status(400).json({
      success: false,
      message: 'Invalid category reference'
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
  
  // Default error response
  return res.status(500).json({
    success: false,
    message: 'Internal server error'
  });
};

exports.createProduct = async (req, res, next) => {
  try {
    const result = await productService.createProduct(req.body);
    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: result.data
    });
  } catch (error) {
    handleProductError(error, res);
  }
};

exports.getAllProducts = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = "",
      sortField = "",
      sortOrder = "",
      categoryId = "",
      status = "",
      minPrice = "",
      maxPrice = "",
      lowStock = ""
    } = req.query;

    // Validate pagination parameters
    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit) || 10));

    const result = await productService.getAllProducts({
      page: pageNum,
      limit: limitNum,
      search,
      sortField,
      sortOrder,
      categoryId,
      status,
      minPrice: minPrice ? parseFloat(minPrice) : undefined,
      maxPrice: maxPrice ? parseFloat(maxPrice) : undefined,
      lowStock: lowStock === 'true'
    });

    res.json({
      success: true,
      data: result.products,
      pagination: {
        currentPage: pageNum,
        totalPages: Math.ceil(result.total / limitNum),
        totalItems: result.total,
        itemsPerPage: limitNum,
        hasNext: pageNum < Math.ceil(result.total / limitNum),
        hasPrev: pageNum > 1
      }
    });
  } catch (error) {
    handleProductError(error, res);
  }
};

exports.getProductById = async (req, res, next) => {
  try {
    const result = await productService.getProductById(req.params.id);
    if (!result || !result.success) {
      return res.status(404).json({
        success: false,
        message: "Product not found"
      });
    }
    res.json({
      success: true,
      data: result.data
    });
  } catch (error) {
    handleProductError(error, res);
  }
};

exports.updateProduct = async (req, res, next) => {
  try {
    const result = await productService.updateProduct(req.params.id, req.body);
    if (!result || !result.success) {
      return res.status(404).json({
        success: false,
        message: "Product not found"
      });
    }
    res.json({
      success: true,
      message: 'Product updated successfully',
      data: result.data
    });
  } catch (error) {
    handleProductError(error, res);
  }
};

exports.deleteProduct = async (req, res, next) => {
  try {
    const result = await productService.deleteProduct(req.params.id);
    if (!result) {
      return res.status(404).json({
        success: false,
        message: "Product not found"
      });
    }
    res.json({
      success: true,
      message: "Product deleted successfully"
    });
  } catch (error) {
    handleProductError(error, res);
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
        // Failed to create notification - continue without blocking
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
        // Failed to create notification - continue without blocking
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

exports.uploadProductImage = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No image file uploaded"
      });
    }

    // First, let's verify the product exists
    const { prisma } = require("../config/db");
    const productExists = await prisma.product.findUnique({
      where: { id: String(id) },
      select: { id: true, name: true, isDeleted: true }
    });
    if (!productExists) {
      return res.status(404).json({
        success: false,
        message: "Product not found"
      });
    }

    if (productExists.isDeleted) {
      return res.status(404).json({
        success: false,
        message: "Product has been deleted"
      });
    }

    // Construct the full URL for the uploaded image
    const baseUrl = process.env.BACKEND_URL || "http://localhost:5000";
    const imageUrl = `${baseUrl}/uploads/${req.file.filename}`;
    // Update the product with the new image URL
    const result = await productService.updateProduct(id, { image_url: imageUrl });
    if (!result || !result.success) {
      return res.status(404).json({
        success: false,
        message: "Product not found"
      });
    }

    res.json({
      success: true,
      message: "Product image uploaded successfully",
      data: result.data,
      imageUrl: imageUrl
    });
  } catch (error) {
    // Return more specific error information
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to upload product image",
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};