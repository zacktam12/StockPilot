// src/features/products/productSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../services/api";

// Async Thunks with loading messages
export const fetchProducts = createAsyncThunk(
  "products/fetchProducts",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/products");
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
      await api.delete(`/products/${productId}`);
      return productId;
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
      const url = productData.id ? `/products/${productData.id}` : "/products";
      const method = productData.id ? "put" : "post";
      const response = await api[method](url, productData);
      return response.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.error || "Failed to save product"
      );
    }
  }
  // Remove the meta property entirely, or make it static if you want:
  // {
  //   meta: { loadingMessage: "Saving product..." }
  // }
);
const initialState = {
  // Product List State
  items: [],
  filteredItems: [],
  loading: false, // Keep for local loading states
  error: null,

  // Pagination/Sorting/Filtering
  currentPage: 1,
  itemsPerPage: 10,
  searchTerm: "",
  sortField: "name",
  sortOrder: "asc",
  filterOptions: {
    lowStock: false,
    hasImage: false,
    hasCategory: false,
  },

  // Modal State
  isProductModalOpen: false,
  editingProduct: null,

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

    // Filter/Sort Management
    setSearchTerm: (state, action) => {
      state.searchTerm = action.payload;
      state.currentPage = 1;
      applyFilters(state);
    },
    setSortField: (state, action) => {
      if (state.sortField === action.payload) {
        state.sortOrder = state.sortOrder === "asc" ? "desc" : "asc";
      } else {
        state.sortField = action.payload;
        state.sortOrder = "asc";
      }
      applyFilters(state);
    },
    setFilterOptions: (state, action) => {
      state.filterOptions = { ...state.filterOptions, ...action.payload };
      state.currentPage = 1;
      applyFilters(state);
    },
    setCurrentPage: (state, action) => {
      state.currentPage = action.payload;
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
        state.items = action.payload;
        applyFilters(state);
      })
      .addCase(fetchProducts.rejected, (state, action) => {
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
        state.categories = action.payload;
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
        state.items = state.items.filter((item) => item.id !== action.payload);
        applyFilters(state);
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
        const existingIndex = state.items.findIndex(
          (item) => item.id === action.payload.id
        );
        if (existingIndex >= 0) {
          state.items[existingIndex] = action.payload;
        } else {
          state.items.unshift(action.payload);
        }
        applyFilters(state);
        state.isProductModalOpen = false;
      })
      .addCase(saveProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

// Helper function to apply filters/sorting
function applyFilters(state) {
  let filtered = [...state.items];

  // Apply search
  if (state.searchTerm) {
    filtered = filtered.filter(
      (product) =>
        product.name.toLowerCase().includes(state.searchTerm.toLowerCase()) ||
        product.description
          ?.toLowerCase()
          .includes(state.searchTerm.toLowerCase()) ||
        (product.category &&
          product.category.name
            .toLowerCase()
            .includes(state.searchTerm.toLowerCase()))
    );
  }

  // Apply filters
  filtered = filtered.filter((product) => {
    return (
      (!state.filterOptions.lowStock || product.quantity <= 10) &&
      (!state.filterOptions.hasImage || product.image_url) &&
      (!state.filterOptions.hasCategory || product.category_id)
    );
  });

  // Apply sorting
  filtered.sort((a, b) => {
    const aValue = a[state.sortField];
    const bValue = b[state.sortField];

    if (aValue < bValue) return state.sortOrder === "asc" ? -1 : 1;
    if (aValue > bValue) return state.sortOrder === "asc" ? 1 : -1;
    return 0;
  });

  state.filteredItems = filtered;
}

export const {
  openProductModal,
  closeProductModal,
  setSearchTerm,
  setSortField,
  setFilterOptions,
  setCurrentPage,
  resetProductState,
} = productSlice.actions;

export default productSlice.reducer;
