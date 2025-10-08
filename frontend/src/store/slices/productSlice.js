// src/features/products/productSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import api from "../../services/api";
import { API_URL } from "../../config";
import { showSuccess, showError, showWarning } from "../../services/notificationService";

// Async Thunks with loading messages
export const fetchProducts = createAsyncThunk(
  "products/fetchProducts",
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await api.get("/products", { params });
      return response.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.error || "Failed to fetch products"
      );
    }
  },
  {
    meta: {
      loadingMessage: "Loading products...",
    },
  }
);

export const fetchAllProducts = createAsyncThunk(
  "products/fetchAllProducts",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/products", { params: { limit: 1000 } });
      return response.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.error || "Failed to fetch all products"
      );
    }
  },
  {
    meta: {
      loadingMessage: "Loading all products...",
    },
  }
);

export const fetchCategories = createAsyncThunk(
  "products/fetchCategories",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/categories");
      return response.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.error || "Failed to fetch categories"
      );
    }
  },
  {
    meta: {
      loadingMessage: "Loading categories...",
    },
  }
);

export const fetchProductById = createAsyncThunk(
  "products/fetchProductById",
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.get(`/products/${id}`);
      // Handle the nested response structure from backend
      if (response.data.success && response.data.data) {
        // Transform the data to match frontend expectations
        const product = response.data.data;
        const transformedProduct = {
          id: product.id,
          name: product.name,
          description: product.description,
          sku: product.sku,
          barcode: product.barcode,
          price: parseFloat(product.price),
          cost: parseFloat(product.cost || 0),
          quantity: parseInt(product.quantity),
          min_stock: parseInt(product.min_stock || product.minStock || 0),
          max_stock: parseInt(product.max_stock || product.maxStock || 0),
          image_url: product.image_url || product.image,
          category_id: product.category_id || product.categoryId,
          category: product.category
            ? {
                id: product.category.id,
                name: product.category.name,
              }
            : null,
          created_at: product.created_at || product.createdAt,
          updated_at: product.updated_at || product.updatedAt,
        };
        return transformedProduct;
      } else {
        // Handle case where response.data.data is the product directly
        const product = response.data.data || response.data;
        const transformedProduct = {
          id: product.id,
          name: product.name,
          description: product.description,
          sku: product.sku,
          barcode: product.barcode,
          price: parseFloat(product.price),
          cost: parseFloat(product.cost || 0),
          quantity: parseInt(product.quantity),
          min_stock: parseInt(product.min_stock || product.minStock || 0),
          max_stock: parseInt(product.max_stock || product.maxStock || 0),
          image_url: product.image_url || product.image,
          category_id: product.category_id || product.categoryId,
          category: product.category
            ? {
                id: product.category.id,
                name: product.category.name,
              }
            : null,
          created_at: product.created_at || product.createdAt,
          updated_at: product.updated_at || product.updatedAt,
        };
        return transformedProduct;
      }
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.error || err.message || "Failed to fetch product"
      );
    }
  },
  {
    meta: {
      loadingMessage: "Loading product details...",
    },
  }
);

export const updateProduct = createAsyncThunk(
  "products/updateProduct",
  async (productData, { rejectWithValue }) => {
    try {
      const { id, ...data } = productData;
      const response = await api.put(`/products/${id}`, data);
      // Handle the nested response structure from backend
      if (response.data.success && response.data.data) {
        // Transform the data to match frontend expectations
        const product = response.data.data;
        const transformedProduct = {
          id: product.id,
          name: product.name,
          description: product.description,
          sku: product.sku,
          barcode: product.barcode,
          price: parseFloat(product.price),
          cost: parseFloat(product.cost || 0),
          quantity: parseInt(product.quantity),
          min_stock: parseInt(product.min_stock || product.minStock || 0),
          max_stock: parseInt(product.max_stock || product.maxStock || 0),
          image_url: product.image_url || product.image,
          category_id: product.category_id || product.categoryId,
          category: product.category
            ? {
                id: product.category.id,
                name: product.category.name,
              }
            : null,
          created_at: product.created_at || product.createdAt,
          updated_at: product.updated_at || product.updatedAt,
        };
        return transformedProduct;
      } else {
        throw new Error("Invalid response structure");
      }
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.error || err.message || "Failed to update product"
      );
    }
  },
  {
    meta: {
      loadingMessage: "Updating product...",
    },
  }
);

export const deleteProduct = createAsyncThunk(
  "products/deleteProduct",
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/products/${id}`);
      return id;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.error || "Failed to delete product"
      );
    }
  },
  {
    meta: {
      loadingMessage: "Deleting product...",
    },
  }
);


export const createProduct = createAsyncThunk(
  "products/createProduct",
  async (productData, { rejectWithValue }) => {
    try {
      const response = await api.post("/products", productData);
      return response.data;
    } catch (err) {
      console.error("Error response:", err.response?.data);
      return rejectWithValue(
        err.response?.data?.error || "Failed to create product"
      );
    }
  },
  {
    meta: {
      loadingMessage: "Creating product...",
    },
  }
);

export const saveProduct = createAsyncThunk(
  "products/saveProduct",
  async (productData, { rejectWithValue }) => {
    try {
      const url = productData.id ? `/products/${productData.id}` : "/products";
      const method = productData.id ? "put" : "post";

      const response = await api[method](url, productData);
      return response.data;
    } catch (err) {
      console.error("Error response:", err.response?.data);
      return rejectWithValue(
        err.response?.data?.error || "Failed to save product"
      );
    }
  },
  {
    meta: {
      loadingMessage: "Saving product...",
    },
  }
);

export const importProducts = createAsyncThunk(
  "products/importProducts",
  async (products, { rejectWithValue }) => {
    try {
      const response = await api.post("/products/bulk", { products });
      return response.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.error || "Failed to import products"
      );
    }
  },
  {
    meta: {
      loadingMessage: "Importing products...",
    },
  }
);

export const bulkDeleteProducts = createAsyncThunk(
  "products/bulkDeleteProducts",
  async (productIds, { rejectWithValue }) => {
    try {
      const response = await api.delete("/products/bulk", {
        data: { productIds },
      });
      return { ids: productIds, message: response.data.message };
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.error || "Failed to delete products"
      );
    }
  },
  {
    meta: {
      loadingMessage: "Deleting products...",
    },
  }
);

export const updateStock = createAsyncThunk(
  "products/updateStock",
  async ({ id, quantity }, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/products/${id}/stock`, { quantity });
      return response.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.error || "Failed to update stock"
      );
    }
  }
);

export const incrementStock = createAsyncThunk(
  "products/incrementStock",
  async ({ id, quantity }, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/products/${id}/stock/increment`, {
        quantity,
      });
      return response.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.error || "Failed to increment stock"
      );
    }
  }
);

export const decrementStock = createAsyncThunk(
  "products/decrementStock",
  async ({ id, quantity }, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/products/${id}/stock/decrement`, {
        quantity,
      });
      return response.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.error || "Failed to decrement stock"
      );
    }
  }
);

export const uploadProductImage = createAsyncThunk(
  "products/uploadProductImage",
  async ({ productId, file }, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append('image', file);

      // Create a custom axios instance for file uploads
      const uploadApi = axios.create({
        baseURL: API_URL,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      // Add auth token
      const token = localStorage.getItem('authToken');
      if (token) {
        uploadApi.defaults.headers.Authorization = `Bearer ${token}`;
      }

      const response = await uploadApi.post(`/products/${productId}/image`, formData);

      return response.data;
    } catch (err) {
      console.error('Upload error details:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status
      });
      
      const errorMessage = err.response?.data?.message || 
                          err.response?.data?.error || 
                          err.message || 
                          "Failed to upload product image";
      
      return rejectWithValue(errorMessage);
    }
  },
  {
    meta: {
      loadingMessage: "Uploading image...",
    },
  }
);

const initialState = {
  // Product List State
  items: [],
  filteredItems: [],
  allProducts: [], // Separate field for all products (used in sales)
  selectedProduct: null, // Selected product for detail view
  loading: false,
  error: null,

  // Pagination/Sorting/Filtering
  currentPage: 1,
  itemsPerPage: 10, // Set to 10 items per page
  totalPages: 1,
  totalItems: 0,
  searchTerm: "",
  sortField: "createdAt",
  sortOrder: "desc",

  // Advanced Filters
  filters: {
    categoryId: null,
    status: null,
    priceRange: { min: null, max: null },
    stockRange: { min: null, max: null },
    hasImage: false,
    hasBarcode: false,
    hasSku: false,
  },

  // Bulk Selection
  selectedItems: [],
  selectAll: false,

  // Modal State
  isProductModalOpen: false,
  isProductViewModalOpen: false,
  isCSVImportModalOpen: false,
  editingProduct: null,
  viewingProduct: null,

  // Categories State
  categories: [],
  categoriesLoading: false,
  categoriesError: null,
};

const productSlice = createSlice({
  name: "products",
  initialState,
  reducers: {
    // UI State Management
    openProductModal: (state, action) => {
      state.isProductModalOpen = true;
      state.editingProduct = action.payload || null;
    },
    closeProductModal: (state) => {
      state.isProductModalOpen = false;
      state.editingProduct = null;
    },
    openProductViewModal: (state, action) => {
      state.isProductViewModalOpen = true;
      state.viewingProduct = action.payload || null;
    },
    closeProductViewModal: (state) => {
      state.isProductViewModalOpen = false;
      state.viewingProduct = null;
    },
    openCSVImportModal: (state) => {
      state.isCSVImportModalOpen = true;
    },
    closeCSVImportModal: (state) => {
      state.isCSVImportModalOpen = false;
    },

    // Filter/Sort Management
    setSearchTerm: (state, action) => {
      state.searchTerm = action.payload;
      state.currentPage = 1; // Reset to first page when searching
    },
    setSortField: (state, action) => {
      const newField = action.payload;
      if (state.sortField === newField) {
        // Toggle order if same field
        state.sortOrder = state.sortOrder === "asc" ? "desc" : "asc";
      } else {
        // Set new field with default ascending order
        state.sortField = newField;
        state.sortOrder = "asc";
      }
      // Reset to first page when sorting changes
      state.currentPage = 1;
    },
    setFilterOptions: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
      state.currentPage = 1; // Reset to first page when filtering
    },
    clearFilters: (state) => {
      state.filters = initialState.filters;
      state.currentPage = 1;
    },
    setCurrentPage: (state, action) => {
      state.currentPage = action.payload;
    },
    setItemsPerPage: (state, action) => {
      state.itemsPerPage = action.payload;
      state.currentPage = 1; // Reset to first page when changing page size
      state.totalPages = Math.ceil(state.filteredItems.length / state.itemsPerPage);
    },
    
    // Update pagination when filtered items change
    updatePagination: (state) => {
      state.totalItems = state.filteredItems.length;
      state.totalPages = Math.ceil(state.filteredItems.length / state.itemsPerPage);
      if (state.currentPage > state.totalPages && state.totalPages > 0) {
        state.currentPage = 1;
      }
    },

    // Bulk Selection Management
    toggleItemSelection: (state, action) => {
      const itemId = action.payload;
      const index = state.selectedItems.indexOf(itemId);
      if (index > -1) {
        state.selectedItems.splice(index, 1);
      } else {
        state.selectedItems.push(itemId);
      }
      state.selectAll =
        state.selectedItems.length === state.filteredItems.length;
    },
    toggleSelectAll: (state) => {
      if (state.selectAll) {
        state.selectedItems = [];
      } else {
        state.selectedItems = state.filteredItems.map((item) => item.id);
      }
      state.selectAll = !state.selectAll;
    },
    clearSelection: (state) => {
      state.selectedItems = [];
      state.selectAll = false;
    },

    // Reset State
    resetProductState: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      // Fetch Products
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.success) {
          state.items = action.payload.data || [];
          state.filteredItems = action.payload.data || [];
          if (action.payload.pagination) {
            state.currentPage = action.payload.pagination.currentPage || action.payload.pagination.page;
            state.totalPages = action.payload.pagination.totalPages || action.payload.pagination.pages;
            state.totalItems = action.payload.pagination.totalItems || action.payload.pagination.total;
            state.itemsPerPage = action.payload.pagination.itemsPerPage || action.payload.pagination.limit;
          }
        } else {
          state.error = "Failed to fetch products";
        }
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch All Products (for sales)
      .addCase(fetchAllProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllProducts.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.success) {
          // Store all products in a separate field for sales
          state.allProducts = action.payload.data || [];
          state.filteredItems = action.payload.data || [];
        } else {
          state.error = "Failed to fetch all products";
        }
      })
      .addCase(fetchAllProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch Categories
      .addCase(fetchCategories.pending, (state) => {
        state.categoriesLoading = true;
        state.categoriesError = null;
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.categoriesLoading = false;
        state.categories = action.payload.data || action.payload || [];
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.categoriesLoading = false;
        state.categoriesError = action.payload;
      })


      // Save Product
      .addCase(saveProduct.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(saveProduct.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.success) {
          const product = action.payload.data;
          const existingIndex = state.items.findIndex(
            (item) => item.id === product.id
          );
          if (existingIndex >= 0) {
            state.items[existingIndex] = product;
            state.filteredItems[existingIndex] = product;
            // Show update success notification
            showSuccess(
              'Product Updated Successfully',
              `"${product.name}" has been updated.`,
              4000
            );
          } else {
            state.items.unshift(product);
            state.filteredItems.unshift(product);
            // Show create success notification
            showSuccess(
              'Product Created Successfully',
              `"${product.name}" has been added to your inventory.`,
              4000
            );
          }
          state.isProductModalOpen = false;
          // Re-apply filters after adding/updating
          // applyFilters(state); // This line is removed as per the edit hint
        } else {
          state.error = "Failed to save product";
          showError(
            'Product Save Failed',
            'Unable to save the product. Please try again.',
            5000
          );
        }
      })
      .addCase(saveProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        showError(
          'Product Save Failed',
          action.payload || 'An unexpected error occurred while saving the product.',
          5000
        );
      })

      // Create Product
      .addCase(createProduct.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createProduct.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.success) {
          const product = action.payload.data;
          // Add the new product to the beginning of the list
          state.items.unshift(product);
          state.filteredItems.unshift(product);
          
          // Update pagination to account for the new item
          state.totalItems += 1;
          state.totalPages = Math.ceil(state.totalItems / state.itemsPerPage);
          
          // If we're not on the first page, we might need to adjust pagination
          if (state.currentPage > state.totalPages && state.totalPages > 0) {
            state.currentPage = 1;
          }
          
          // Show success notification
          showSuccess(
            'Product Created Successfully',
            `"${product.name}" has been added to your inventory.`,
            4000
          );
        } else {
          state.error = "Failed to create product";
          showError(
            'Product Creation Failed',
            'Unable to create the product. Please try again.',
            5000
          );
        }
      })
      .addCase(createProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        showError(
          'Product Creation Failed',
          action.payload || 'An unexpected error occurred while creating the product.',
          5000
        );
      })

      // Update Stock
      .addCase(updateStock.fulfilled, (state, action) => {
        if (action.payload.success) {
          const updatedProduct = action.payload.data;
          const index = state.items.findIndex(
            (item) => item.id === updatedProduct.id
          );
          if (index !== -1) {
            state.items[index] = updatedProduct;
            state.filteredItems[index] = updatedProduct;
          }
        }
      })

      // Increment Stock
      .addCase(incrementStock.fulfilled, (state, action) => {
        if (action.payload.success) {
          const updatedProduct = action.payload.data;
          const index = state.items.findIndex(
            (item) => item.id === updatedProduct.id
          );
          if (index !== -1) {
            state.items[index] = updatedProduct;
            state.filteredItems[index] = updatedProduct;
          }
        }
      })

      // Decrement Stock
      .addCase(decrementStock.fulfilled, (state, action) => {
        if (action.payload.success) {
          const updatedProduct = action.payload.data;
          const index = state.items.findIndex(
            (item) => item.id === updatedProduct.id
          );
          if (index !== -1) {
            state.items[index] = updatedProduct;
            state.filteredItems[index] = updatedProduct;
          }
        }
      })

      // Import Products
      .addCase(importProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(importProducts.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.success) {
          const newProducts = action.payload.data || [];
          state.items.unshift(...newProducts);
          state.filteredItems.unshift(...newProducts);
          state.isCSVImportModalOpen = false;
          
          // Show success notification
          showSuccess(
            'Products Imported Successfully',
            `${newProducts.length} product(s) have been imported from CSV.`,
            4000
          );
          // Re-apply filters after importing
          // applyFilters(state); // This line is removed as per the edit hint
        } else {
          state.error = "Failed to import products";
          showError(
            'Import Failed',
            'Unable to import products from CSV. Please check the file format and try again.',
            5000
          );
        }
      })
      .addCase(importProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        showError(
          'Import Failed',
          action.payload || 'An unexpected error occurred while importing products.',
          5000
        );
      })

      // Bulk Delete Products
      .addCase(bulkDeleteProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(bulkDeleteProducts.fulfilled, (state, action) => {
        state.loading = false;
        const deletedIds = action.payload.ids;
        state.items = state.items.filter(
          (item) => !deletedIds.includes(item.id)
        );
        state.filteredItems = state.filteredItems.filter(
          (item) => !deletedIds.includes(item.id)
        );
        state.selectedItems = [];
        state.selectAll = false;
        
        // Show success notification
        showSuccess(
          'Products Deleted Successfully',
          `${deletedIds.length} product(s) have been removed from your inventory.`,
          4000
        );
      })
      .addCase(bulkDeleteProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        showError(
          'Bulk Delete Failed',
          action.payload || 'Unable to delete the selected products. Please try again.',
          5000
        );
      })

      // Fetch Product by ID
      .addCase(fetchProductById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProductById.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        state.selectedProduct = action.payload;
      })
      .addCase(fetchProductById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.selectedProduct = null;
      })

      // Update Product
      .addCase(updateProduct.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateProduct.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        state.selectedProduct = action.payload;
        // Update the product in the items list
        const index = state.items.findIndex(item => item.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
        // Update filtered items
        const filteredIndex = state.filteredItems.findIndex(item => item.id === action.payload.id);
        if (filteredIndex !== -1) {
          state.filteredItems[filteredIndex] = action.payload;
        }
        
        // Show success notification
        showSuccess(
          'Product Updated Successfully',
          `"${action.payload.name}" has been updated.`,
          4000
        );
      })
      .addCase(updateProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        showError(
          'Product Update Failed',
          action.payload || 'Unable to update the product. Please try again.',
          5000
        );
      })

      // Delete Product
      .addCase(deleteProduct.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteProduct.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedProduct = null;
        // Remove from items list
        state.items = state.items.filter(item => item.id !== action.payload);
        state.filteredItems = state.filteredItems.filter(item => item.id !== action.payload);
        state.selectedItems = state.selectedItems.filter(id => id !== action.payload);
        
        // Show success notification
        showSuccess(
          'Product Deleted Successfully',
          'The product has been removed from your inventory.',
          4000
        );
      })
      .addCase(deleteProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        showError(
          'Product Deletion Failed',
          action.payload || 'Unable to delete the product. Please try again.',
          5000
        );
      })

      // Upload Product Image
      .addCase(uploadProductImage.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(uploadProductImage.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        if (action.payload.success && action.payload.data) {
          // Update the selected product with new image
          if (state.selectedProduct && state.selectedProduct.id === action.payload.data.id) {
            state.selectedProduct = action.payload.data;
          }
          // Update the product in the items list
          const index = state.items.findIndex(item => item.id === action.payload.data.id);
          if (index !== -1) {
            state.items[index] = action.payload.data;
          }
          // Update filtered items
          const filteredIndex = state.filteredItems.findIndex(item => item.id === action.payload.data.id);
          if (filteredIndex !== -1) {
            state.filteredItems[filteredIndex] = action.payload.data;
          }
          
          // Show success notification
          showSuccess(
            'Image Uploaded Successfully',
            `Product image has been updated.`,
            4000
          );
        }
      })
      .addCase(uploadProductImage.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        showError(
          'Image Upload Failed',
          action.payload || 'Unable to upload the product image. Please try again.',
          5000
        );
      });
  },
});

export const {
  openProductModal,
  closeProductModal,
  openProductViewModal,
  closeProductViewModal,
  openCSVImportModal,
  closeCSVImportModal,
  setSearchTerm,
  setSortField,
  setFilterOptions,
  clearFilters,
  setCurrentPage,
  setItemsPerPage,
  toggleItemSelection,
  toggleSelectAll,
  clearSelection,
  resetProductState,
} = productSlice.actions;

export default productSlice.reducer;
