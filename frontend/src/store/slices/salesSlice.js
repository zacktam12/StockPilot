// src/store/slices/salesSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../services/api";

// Async Thunks
export const fetchSales = createAsyncThunk(
  "sales/fetchSales",
  async (
    {
      page = 1,
      limit = 5,
      search = "",
      status = "all",
      sortBy = "created_at",
      order = "desc",
    } = {},
    { rejectWithValue }
  ) => {
    try {
      console.log("Fetching sales with params:", {
        page,
        limit,
        search,
        status,
      });
      let url = `/sales?page=${page}&limit=${limit}&sortBy=${sortBy}&order=${order}`;
      if (search) url += `&search=${encodeURIComponent(search)}`;
      if (status && status !== "all") url += `&status=${status}`;
      console.log("API URL:", url);

      // Add timeout to prevent infinite loading
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

      const response = await api.get(url, {
        signal: controller.signal,
        timeout: 10000,
      });

      clearTimeout(timeoutId);
      console.log("Sales API response:", response.data);
      return response.data; // Should be { data: [], total: N }
    } catch (error) {
      console.error("Sales API error:", error);

      if (error.name === "AbortError") {
        return rejectWithValue(
          "Request timeout. Please check your connection."
        );
      }

      // Handle authentication errors specifically
      if (
        error.response?.status === 401 ||
        error.response?.data?.message?.includes("No token provided")
      ) {
        return rejectWithValue("Authentication failed. Please login again.");
      }

      if (
        error.code === "ECONNREFUSED" ||
        error.message.includes("Network Error")
      ) {
        return rejectWithValue(
          "Cannot connect to server. Please check if the backend is running."
        );
      }

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
      const response = await api.get(`/sales/${saleId}`);
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
      const response = await api.post("/sales", saleData);
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
      const response = await api.put(`/sales/${id}/status`, { status });
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

// Placeholders for bulk actions
export const bulkDeleteSales = createAsyncThunk(
  "sales/bulkDelete",
  async (ids, { rejectWithValue }) => {
    try {
      console.log("Attempting to bulk delete sales with IDs:", ids);
      await api.delete("/sales/bulk", { data: { ids } });
      console.log("Bulk delete successful for IDs:", ids);
      return ids;
    } catch (error) {
      console.error("Error bulk deleting sales:", error);
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete sales"
      );
    }
  }
);

export const importSales = createAsyncThunk(
  "sales/import",
  async (data, { rejectWithValue }) => {
    try {
      const response = await api.post("/sales/import", data);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to import sales"
      );
    }
  }
);

export const exportSales = createAsyncThunk(
  "sales/export",
  async (ids, { rejectWithValue }) => {
    try {
      const response = await api.post("/sales/export", { ids });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to export sales"
      );
    }
  }
);

export const updateSale = createAsyncThunk(
  "sales/updateSale",
  async ({ id, ...data }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/sales/${id}`, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update sale"
      );
    }
  }
);

export const deleteSale = createAsyncThunk(
  "sales/deleteSale",
  async (id, { rejectWithValue }) => {
    try {
      console.log("Attempting to delete sale with ID:", id);
      await api.delete(`/sales/${id}`);
      console.log("Sale deleted successfully:", id);
      return id;
    } catch (error) {
      console.error("Error deleting sale:", error);
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete sale"
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
  statusFilter: "all",
  sortField: "created_at",
  sortOrder: "desc",
  pagination: {
    currentPage: 1,
    itemsPerPage: 5,
    totalItems: 0,
    totalPages: 0,
  },
};

// Slice
const salesSlice = createSlice({
  name: "sales",
  initialState,
  reducers: {
    setStatusFilter: (state, action) => {
      state.statusFilter = action.payload;
      state.pagination.currentPage = 1;
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
        console.log("Sales fetch pending");
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSales.fulfilled, (state, action) => {
        console.log("Sales fetch fulfilled:", action.payload);
        state.loading = false;
        state.sales = action.payload.data || [];
        state.pagination.totalItems = action.payload.total || 0;
        state.pagination.totalPages = Math.ceil(
          (action.payload.total || 0) / state.pagination.itemsPerPage
        );
      })
      .addCase(fetchSales.rejected, (state, action) => {
        console.log("fetchSales.rejected error:", action.payload);
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
        state.sales.unshift(action.payload);
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
      })

      // Bulk delete
      .addCase(bulkDeleteSales.fulfilled, (state, action) => {
        state.sales = state.sales.filter(
          (sale) => !action.payload.includes(sale.id)
        );
        state.pagination.totalItems -= action.payload.length;
      })

      // Import
      .addCase(importSales.fulfilled, (state, action) => {
        state.sales = [...action.payload, ...state.sales];
        state.pagination.totalItems += action.payload.length;
      })

      // Update Sale
      .addCase(updateSale.fulfilled, (state, action) => {
        const idx = state.sales.findIndex(
          (sale) => sale.id === action.payload.id
        );
        if (idx !== -1) {
          state.sales[idx] = action.payload;
        }
        if (state.saleDetails?.id === action.payload.id) {
          state.saleDetails = action.payload;
        }
      })

      // Delete Sale
      .addCase(deleteSale.fulfilled, (state, action) => {
        state.sales = state.sales.filter((sale) => sale.id !== action.payload);
        state.pagination.totalItems -= 1;
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
  if (statusFilter === "all") return sales;
  return sales.filter((sale) => sale.status === statusFilter);
};

export const selectFilteredSales = (state) => {
  const sales = selectAllSales(state);
  const { sortField, sortOrder } = state.sales;

  return [...sales].sort((a, b) => {
    const valueA = a[sortField];
    const valueB = b[sortField];
    if (valueA < valueB) return sortOrder === "asc" ? -1 : 1;
    if (valueA > valueB) return sortOrder === "asc" ? 1 : -1;
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
