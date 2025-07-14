// src/features/products/productSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../services/api";

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

export const deleteProduct = createAsyncThunk(
  "products/deleteProduct",
  async (productId, { rejectWithValue }) => {
    try {
      const response = await api.delete(`/products/${productId}`);
      return { id: productId, message: response.data.message };
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

export const saveProduct = createAsyncThunk(
  "products/saveProduct",
  async (productData, { rejectWithValue }) => {
    try {
      console.log("saveProduct called with data:", productData);
      const url = productData.id ? `/products/${productData.id}` : "/products";
      const method = productData.id ? "put" : "post";
      console.log("Making", method.toUpperCase(), "request to:", url);

      const response = await api[method](url, productData);
      console.log("saveProduct response:", response.data);
      return response.data;
    } catch (err) {
      console.error("saveProduct error:", err);
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

const initialState = {
  // Product List State
  items: [],
  filteredItems: [],
  allProducts: [], // Separate field for all products (used in sales)
  loading: false,
  error: null,

  // Pagination/Sorting/Filtering
  currentPage: 1,
  itemsPerPage: 5, // Set to 5 items per page
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
        console.log("fetchProducts fulfilled:", action.payload);
        if (action.payload.success) {
          state.items = action.payload.data || [];
          state.filteredItems = action.payload.data || [];
          console.log("Updated items count:", state.items.length);
          if (action.payload.pagination) {
            state.currentPage = action.payload.pagination.page;
            state.totalPages = action.payload.pagination.pages;
            state.totalItems = action.payload.pagination.total;
            state.itemsPerPage = action.payload.pagination.limit;
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
        console.log("fetchAllProducts fulfilled:", action.payload);
        if (action.payload.success) {
          // Store all products in a separate field for sales
          state.allProducts = action.payload.data || [];
          state.filteredItems = action.payload.data || [];
          console.log("All products loaded:", state.allProducts.length);
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

      // Delete Product
      .addCase(deleteProduct.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteProduct.fulfilled, (state, action) => {
        state.loading = false;
        state.items = state.items.filter(
          (item) => item.id !== action.payload.id
        );
        state.filteredItems = state.filteredItems.filter(
          (item) => item.id !== action.payload.id
        );
      })
      .addCase(deleteProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
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
          } else {
            state.items.unshift(product);
            state.filteredItems.unshift(product);
          }
          state.isProductModalOpen = false;
          // Re-apply filters after adding/updating
          // applyFilters(state); // This line is removed as per the edit hint
        } else {
          state.error = "Failed to save product";
        }
      })
      .addCase(saveProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
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
          // Re-apply filters after importing
          // applyFilters(state); // This line is removed as per the edit hint
        } else {
          state.error = "Failed to import products";
        }
      })
      .addCase(importProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
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
      })
      .addCase(bulkDeleteProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
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
  toggleItemSelection,
  toggleSelectAll,
  clearSelection,
  resetProductState,
} = productSlice.actions;

export default productSlice.reducer;
