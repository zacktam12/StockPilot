const productRepository = require("../repositories/product.repository");
const { generateProductIdentifiers } = require("../utils/generators");
const cacheService = require("./cache.service");

// Helper function to get low stock threshold from settings
const getLowStockThreshold = async () => {
  try {
    const { prisma } = require("../config/db");
    const settings = await prisma.settings.findFirst();
    return settings?.lowStockThreshold || 10; // Default to 10 if not set
  } catch (error) {
    console.warn(
      "Failed to get low stock threshold from settings, using default:",
      error.message
    );
    return 10; // Default fallback
  }
};

const createProduct = async (data) => {
  try {
    // Accept both JSON and multipart/form-data (req.body may be a string if multipart)
    if (!data || typeof data !== "object") {
      // Try to parse if it's a string (from multipart/form-data)
      if (typeof data === "string") {
        try {
          data = JSON.parse(data);
        } catch {
          throw new Error("Product data is missing or invalid");
        }
      } else {
        throw new Error("Product data is missing or invalid");
      }
    }

    // Auto-generate SKU and barcode if not provided
    if (!data.sku || data.sku.trim() === "") {
      const { sku } = await generateProductIdentifiers(data.name);
      data.sku = sku;
      console.log(`Auto-generated SKU: ${sku}`);
    } else {
      // Check if provided SKU already exists
      const existingProduct = await productRepository.findBySku(data.sku);
      if (existingProduct) {
        throw new Error(`Product with SKU "${data.sku}" already exists`);
      }
    }

    // Auto-generate barcode if not provided
    if (!data.barcode || data.barcode.trim() === "") {
      const { barcode } = await generateProductIdentifiers(data.name);
      data.barcode = barcode;
      console.log(`Auto-generated barcode: ${barcode}`);
    } else {
      // Check if provided barcode already exists
      const existingProduct = await productRepository.findByBarcode(
        data.barcode
      );
      if (existingProduct) {
        throw new Error(
          `Product with barcode "${data.barcode}" already exists`
        );
      }
    }

    // Map frontend field names to backend field names
    const productData = {
      name: data.name,
      description: data.description,
      sku: data.sku,
      barcode: data.barcode,
      price: parseFloat(data.price),
      cost: data.cost ? parseFloat(data.cost) : null,
      quantity: parseInt(data.quantity) || 0,
      minStock: data.minStock ? parseInt(data.minStock) : null,
      maxStock: data.maxStock ? parseInt(data.maxStock) : null,
      categoryId: data.categoryId,
      image: data.image_url || data.image, // Prioritize image_url from frontend
    };

    const product = await productRepository.create(productData);
    
    // Invalidate cache
    await cacheService.deletePattern('products:*');
    
    return { success: true, data: product };
  } catch (error) {
    // Handle Prisma unique constraint errors
    if (error.code === "P2002") {
      if (error.meta?.target?.includes("sku")) {
        throw new Error(`Product with SKU "${data.sku}" already exists`);
      }
      if (error.meta?.target?.includes("barcode")) {
        throw new Error(
          `Product with barcode "${data.barcode}" already exists`
        );
      }
    }
    throw new Error(`Failed to create product: ${error.message}`);
  }
};

const getAllProducts = async (query = {}) => {
  try {
    console.log("getAllProducts received query:", query);

    const {
      page = 1,
      limit = 5,
      search,
      categoryId,
      status,
      priceRange,
      stockRange,
      hasImage,
      hasBarcode,
      hasSku,
      sortField = "createdAt",
      sortOrder = "desc",
      minPrice,
      maxPrice,
      lowStock
    } = query;

    // Generate cache key
    const cacheKey = cacheService.generateKey(
      'products',
      page.toString(),
      limit.toString(),
      search || '',
      categoryId || '',
      status || '',
      sortField,
      sortOrder,
      minPrice || '',
      maxPrice || '',
      lowStock ? 'true' : 'false'
    );

    // Try to get from cache first
    const cached = await cacheService.get(cacheKey);
    if (cached) {
      return cached;
    }

    // Coerce string booleans to real booleans for checkbox filters
    const coerceBoolean = (val) => {
      if (val === "true") return true;
      if (val === "false") return false;
      return val;
    };

    // Parse price and stock ranges if they're strings
    let parsedPriceRange = priceRange;
    let parsedStockRange = stockRange;

    if (typeof priceRange === "string") {
      try {
        parsedPriceRange = JSON.parse(priceRange);
      } catch (e) {
        console.warn("Failed to parse priceRange:", e);
        parsedPriceRange = null;
      }
    }

    if (typeof stockRange === "string") {
      try {
        parsedStockRange = JSON.parse(stockRange);
      } catch (e) {
        console.warn("Failed to parse stockRange:", e);
        parsedStockRange = null;
      }
    }

    // If limit is very high (like 1000), treat it as "fetch all"
    const actualLimit = limit >= 1000 ? undefined : parseInt(limit);
    const actualPage = limit >= 1000 ? undefined : parseInt(page);

    const filters = {
      search,
      categoryId,
      status,
      priceRange: parsedPriceRange,
      stockRange: parsedStockRange,
      hasImage: coerceBoolean(hasImage),
      hasBarcode: coerceBoolean(hasBarcode),
      hasSku: coerceBoolean(hasSku),
      sortField,
      sortOrder,
    };

    const result = await productRepository.findActiveProducts(
      actualPage,
      actualLimit,
      filters
    );

    // Transform the data to match frontend expectations
    const transformedData = result.data.map((product) => ({
      id: product.id,
      name: product.name,
      description: product.description,
      sku: product.sku,
      barcode: product.barcode,
      price: parseFloat(product.price),
      cost: parseFloat(product.cost || 0),
      quantity: parseInt(product.quantity),
      minStock: parseInt(product.minStock || 0),
      maxStock: parseInt(product.maxStock || 0),
      image_url: product.image,
      category_id: product.categoryId,
      category: product.category
        ? {
            id: product.category.id,
            name: product.category.name,
          }
        : null,
      created_at: product.createdAt,
      updated_at: product.updatedAt,
    }));

    const finalResult = {
      products: transformedData,
      total: result.pagination.total,
      pagination: {
        page: result.pagination.page,
        limit: result.pagination.limit,
        total: result.pagination.total,
        pages: result.pagination.pages,
      },
    };

    // Cache the result for 5 minutes
    await cacheService.set(cacheKey, finalResult, 300);

    return finalResult;
  } catch (error) {
    throw new Error(`Failed to fetch products: ${error.message}`);
  }
};

const getProductById = async (id) => {
  try {
    const product = await productRepository.findUnique(
      { id: String(id) },
      { category: true }
    );
    if (!product) {
      throw new Error("Product not found");
    }
    return { success: true, data: product };
  } catch (error) {
    throw new Error(`Failed to fetch product: ${error.message}`);
  }
};

const updateProduct = async (id, data) => {
  try {
    console.log("Update product called with id:", id);
    console.log("Update product data:", data);

    // Get existing product to check current SKU and barcode
    const existingProduct = await productRepository.findUnique(
      { id: String(id) },
      { category: true }
    );

    if (!existingProduct) {
      throw new Error("Product not found");
    }

    // Auto-generate SKU if not provided and doesn't exist
    if ((!data.sku || data.sku.trim() === "") && !existingProduct.sku) {
      const { sku } = await generateProductIdentifiers(data.name);
      data.sku = sku;
      console.log(`Auto-generated SKU for existing product: ${sku}`);
    }

    // Auto-generate barcode if not provided and doesn't exist
    if (
      (!data.barcode || data.barcode.trim() === "") &&
      !existingProduct.barcode
    ) {
      const { barcode } = await generateProductIdentifiers(data.name);
      data.barcode = barcode;
      console.log(`Auto-generated barcode for existing product: ${barcode}`);
    }

    // Map frontend field names to backend field names
    const productData = {
      name: data.name,
      description: data.description,
      sku: data.sku,
      barcode: data.barcode,
      price: parseFloat(data.price),
      cost: data.cost ? parseFloat(data.cost) : null,
      quantity: parseInt(data.quantity) || 0,
      minStock: data.minStock ? parseInt(data.minStock) : null,
      maxStock: data.maxStock ? parseInt(data.maxStock) : null,
      categoryId: data.categoryId,
      image: data.image_url || data.image, // Prioritize image_url from frontend
    };

    console.log("Mapped product data:", productData);

    const product = await productRepository.update(
      { id: String(id) },
      productData
    );

    console.log("Updated product result:", product);

    // Fetch the updated product with category information
    const updatedProduct = await productRepository.findUnique(
      { id: String(id) },
      { category: true }
    );

    // Transform the data to match frontend expectations
    const transformedProduct = {
      id: updatedProduct.id,
      name: updatedProduct.name,
      description: updatedProduct.description,
      sku: updatedProduct.sku,
      barcode: updatedProduct.barcode,
      price: parseFloat(updatedProduct.price),
      cost: parseFloat(updatedProduct.cost || 0),
      quantity: parseInt(updatedProduct.quantity),
      minStock: parseInt(updatedProduct.minStock || 0),
      maxStock: parseInt(updatedProduct.maxStock || 0),
      image_url: updatedProduct.image,
      category_id: updatedProduct.categoryId,
      category: updatedProduct.category
        ? {
            id: updatedProduct.category.id,
            name: updatedProduct.category.name,
          }
        : null,
      created_at: updatedProduct.createdAt,
      updated_at: updatedProduct.updatedAt,
    };

    // Invalidate cache
    await cacheService.deletePattern('products:*');
    
    return { success: true, data: transformedProduct };
  } catch (error) {
    console.error("Error updating product:", error);
    throw new Error(`Failed to update product: ${error.message}`);
  }
};

const deleteProduct = async (id) => {
  try {
    // Convert id to string since it's a UUID
    const productId = String(id);
    await productRepository.update({ id: productId }, { isDeleted: true });
    
    // Invalidate cache
    await cacheService.deletePattern('products:*');
    
    return { success: true, message: "Product deleted successfully" };
  } catch (error) {
    throw new Error(`Failed to delete product: ${error.message}`);
  }
};

const getLowStockProducts = async (threshold = null) => {
  try {
    // Use provided threshold or get from settings
    const lowStockThreshold = threshold || (await getLowStockThreshold());
    const products = await productRepository.findLowStockProducts(
      lowStockThreshold
    );
    return { success: true, data: products };
  } catch (error) {
    throw new Error(`Failed to fetch low stock products: ${error.message}`);
  }
};

const updateStock = async (id, quantity) => {
  try {
    const product = await productRepository.updateStock(
      String(id),
      parseInt(quantity)
    );
    return { success: true, data: product };
  } catch (error) {
    throw new Error(`Failed to update stock: ${error.message}`);
  }
};

const incrementStock = async (id, quantity) => {
  try {
    const product = await productRepository.incrementStock(
      String(id),
      parseInt(quantity)
    );
    return { success: true, data: product };
  } catch (error) {
    throw new Error(`Failed to increment stock: ${error.message}`);
  }
};

const decrementStock = async (id, quantity) => {
  try {
    const product = await productRepository.decrementStock(
      String(id),
      parseInt(quantity)
    );
    return { success: true, data: product };
  } catch (error) {
    throw new Error(`Failed to decrement stock: ${error.message}`);
  }
};

const bulkImportProducts = async (products) => {
  try {
    console.log("Bulk importing products:", products.length);

    const results = [];
    const errors = [];

    for (let i = 0; i < products.length; i++) {
      try {
        const product = products[i];

        // Map CSV fields to product data format
        const mappedProduct = {
          name: product.name || product.Name || "",
          description: product.description || product.Description || "",
          sku: product.sku || product.SKU || "",
          barcode: product.barcode || product.Barcode || "",
          price: product.price || product.Price || 0,
          cost: product.cost || product.Cost || null,
          quantity: product.quantity || product.Quantity || 0,
          minStock: product.minStock || product["Min Stock"] || null,
          maxStock: product.maxStock || product["Max Stock"] || null,
          categoryId: product.categoryId || product["Category ID"] || null,
          image_url: product.image_url || product["Image URL"] || "",
        };

        // Handle category name to ID mapping if needed
        if (product.Category && !mappedProduct.categoryId) {
          try {
            const { prisma } = require("../config/db");
            const category = await prisma.category.findFirst({
              where: { name: product.Category },
            });
            if (category) {
              mappedProduct.categoryId = category.id;
            }
          } catch (categoryError) {
            console.warn(`Could not find category: ${product.Category}`);
          }
        }

        // Validate required fields
        if (!mappedProduct.name || mappedProduct.name.trim() === "") {
          throw new Error("Name is required");
        }

        if (!mappedProduct.price || isNaN(parseFloat(mappedProduct.price))) {
          throw new Error("Valid price is required");
        }

        const result = await createProduct(mappedProduct);
        results.push(result.data);
      } catch (error) {
        errors.push({
          index: i,
          product: products[i],
          error: error.message,
        });
      }
    }

    return {
      success: true,
      data: results,
      importedCount: results.length,
      errorCount: errors.length,
      errors: errors,
    };
  } catch (error) {
    throw new Error(`Failed to bulk import products: ${error.message}`);
  }
};

const bulkDeleteProducts = async (productIds) => {
  try {
    console.log("Bulk deleting products:", productIds.length);

    const results = [];
    const errors = [];

    for (let i = 0; i < productIds.length; i++) {
      try {
        const result = await productRepository.delete(productIds[i]);
        results.push(result);
      } catch (error) {
        errors.push({
          index: i,
          productId: productIds[i],
          error: error.message,
        });
      }
    }

    return {
      success: true,
      data: results,
      deletedCount: results.length,
      errorCount: errors.length,
      errors: errors,
    };
  } catch (error) {
    throw new Error(`Failed to bulk delete products: ${error.message}`);
  }
};

module.exports = {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  getLowStockProducts,
  updateStock,
  incrementStock,
  decrementStock,
  bulkImportProducts,
  bulkDeleteProducts,
};
