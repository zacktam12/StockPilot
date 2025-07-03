const productRepository = require("../repositories/product.repository");

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

    // Defensive: Always ensure SKU is at least an empty string
    if (typeof data.sku === "undefined" || data.sku === null) {
      data.sku = "";
    }

    // Check if SKU already exists
    if (data.sku) {
      const existingProduct = await productRepository.findBySku(data.sku);
      if (existingProduct) {
        throw new Error(`Product with SKU "${data.sku}" already exists`);
      }
    }

    // Check if barcode already exists
    if (data.barcode) {
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
      image: data.image || data.image_url, // Handle both image and image_url from frontend
    };

    const product = await productRepository.create(productData);
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
    } = query;

    const filters = {
      search,
      categoryId,
      status,
      priceRange,
      stockRange,
      hasImage,
      hasBarcode,
      hasSku,
      sortField,
      sortOrder,
    };

    const result = await productRepository.findActiveProducts(
      parseInt(page),
      parseInt(limit),
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

    return {
      success: true,
      data: transformedData,
      pagination: {
        page: result.pagination.page,
        limit: result.pagination.limit,
        total: result.pagination.total,
        pages: result.pagination.pages,
      },
    };
  } catch (error) {
    throw new Error(`Failed to fetch products: ${error.message}`);
  }
};

const getProductById = async (id) => {
  try {
    const product = await productRepository.findUnique({
      id: String(id),
      isDeleted: false,
    });
    if (!product) {
      throw new Error("Product not found");
    }

    // Transform the data to match frontend expectations
    return {
      success: true,
      data: {
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
      },
    };
  } catch (error) {
    throw new Error(`Failed to fetch product: ${error.message}`);
  }
};

const updateProduct = async (id, data) => {
  try {
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
      image: data.image || data.image_url, // Handle both image and image_url from frontend
    };

    const product = await productRepository.update(
      { id: String(id) },
      productData
    );
    return { success: true, data: product };
  } catch (error) {
    throw new Error(`Failed to update product: ${error.message}`);
  }
};

const deleteProduct = async (id) => {
  try {
    // Convert id to string since it's a UUID
    const productId = String(id);
    await productRepository.update({ id: productId }, { isDeleted: true });
    return { success: true, message: "Product deleted successfully" };
  } catch (error) {
    throw new Error(`Failed to delete product: ${error.message}`);
  }
};

const getLowStockProducts = async (threshold = 5) => {
  try {
    const products = await productRepository.findLowStockProducts(threshold);
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
};
