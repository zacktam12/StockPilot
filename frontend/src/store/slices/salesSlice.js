// src/store/slices/salesSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../services/api";

// Async Thunks
export const fetchSales = createAsyncThunk(
  "sales/fetchSales",
  async (
    { sortField = "created_at", sortOrder = "asc" },
    { rejectWithValue }
  ) => {
    try {
      const response = await api.get(
        `/sales-orders?sortBy=${sortField}&order=${sortOrder}`
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch sales"
      );
    }
  }
);

export const fetchSaleDetails = createAsyncThunk(
  "sales/fetchSaleDetails",
  async (saleId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/sales-orders/${saleId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch sale details"
      );
    }
  }
);

export const createSale = createAsyncThunk(
  "sales/createSale",
  async (saleData, { rejectWithValue }) => {
    try {
      const response = await api.post("/sales-orders", saleData);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to create sale"
      );
    }
  }
);

export const updateSaleStatus = createAsyncThunk(
  "sales/updateStatus",
  async ({ id, status }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/sales-orders/${id}/status`, { status });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update sale status"
      );
    }
  }
);

export const fetchProducts = createAsyncThunk(
  "sales/fetchProducts",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/products");
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch products"
      );
    }
  }
);

export const fetchCustomers = createAsyncThunk(
  "sales/fetchCustomers",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/customers");
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch customers"
      );
    }
  }
);

// Initial State
const initialState = {
  sales: [],
  saleDetails: null,
  products: [],
  customers: [],
  loading: false,
  error: null,
  statusFilter: "all", // 'all', 'completed', 'pending', 'cancelled'
  sortField: "created_at",
  sortOrder: "desc",
  pagination: {
    currentPage: 1,
    itemsPerPage: 10,
    totalItems: 0,
  },
};

// Slice
const salesSlice = createSlice({
  name: "sales",
  initialState,
  reducers: {
    setStatusFilter: (state, action) => {
      state.statusFilter = action.payload;
      state.pagination.currentPage = 1; // Reset to first page when filter changes
    },
    setSortField: (state, action) => {
      state.sortField = action.payload;
    },
    setSortOrder: (state, action) => {
      state.sortOrder = action.payload;
    },
    setCurrentPage: (state, action) => {
      state.pagination.currentPage = action.payload;
    },
    resetSalesState: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      // Fetch Sales
      .addCase(fetchSales.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSales.fulfilled, (state, action) => {
        state.loading = false;
        state.sales = action.payload.data;
        state.pagination.totalItems =
          action.payload.total || action.payload.length;
      })
      .addCase(fetchSales.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch Sale Details
      .addCase(fetchSaleDetails.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.saleDetails = null;
      })
      .addCase(fetchSaleDetails.fulfilled, (state, action) => {
        state.loading = false;
        state.saleDetails = action.payload;
      })
      .addCase(fetchSaleDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Create Sale
      .addCase(createSale.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createSale.fulfilled, (state, action) => {
        state.loading = false;
        state.sales.unshift(action.payload); // Add new sale to beginning of array
      })
      .addCase(createSale.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Update Sale Status
      .addCase(updateSaleStatus.fulfilled, (state, action) => {
        const index = state.sales.findIndex(
          (sale) => sale.id === action.payload.id
        );
        if (index !== -1) {
          state.sales[index] = action.payload;
        }
        if (state.saleDetails?.id === action.payload.id) {
          state.saleDetails = action.payload;
        }
      })

      // Fetch Products
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.products = action.payload;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch Customers
      .addCase(fetchCustomers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCustomers.fulfilled, (state, action) => {
        state.loading = false;
        state.customers = action.payload;
      })
      .addCase(fetchCustomers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

// Export Actions
export const {
  setStatusFilter,
  setSortField,
  setSortOrder,
  setCurrentPage,
  resetSalesState,
} = salesSlice.actions;

// Selectors
export const selectAllSales = (state) => {
  const { sales, statusFilter } = state.sales;

  if (statusFilter === "all") {
    return sales;
  }

  return sales.filter((sale) => sale.status === statusFilter);
};

export const selectFilteredSales = (state) => {
  const sales = selectAllSales(state);
  const { sortField, sortOrder } = state.sales;

  return [...sales].sort((a, b) => {
    const valueA = a[sortField];
    const valueB = b[sortField];

    if (valueA < valueB) {
      return sortOrder === "asc" ? -1 : 1;
    }
    if (valueA > valueB) {
      return sortOrder === "asc" ? 1 : -1;
    }
    return 0;
  });
};

export const selectPaginatedSales = (state) => {
  const sales = selectFilteredSales(state);
  const { currentPage, itemsPerPage } = state.sales.pagination;

  const startIndex = (currentPage - 1) * itemsPerPage;
  return sales.slice(startIndex, startIndex + itemsPerPage);
};

export const selectSalesPagination = (state) => state.sales.pagination;
export const selectSalesLoading = (state) => state.sales.loading;
export const selectSalesError = (state) => state.sales.error;
export const selectSaleDetails = (state) => state.sales.saleDetails;
export const selectProducts = (state) => state.sales.products;
export const selectCustomers = (state) => state.sales.customers;

// Export Reducer
export default salesSlice.reducer;
