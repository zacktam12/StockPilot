// src/store/slices/salesSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../services/api";
import { showSuccess, showError, showWarning } from "../../services/notificationService";

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
      let url = `/sales?page=${page}&limit=${limit}&sortBy=${sortBy}&order=${order}`;
      if (search) url += `&search=${encodeURIComponent(search)}`;
      if (status && status !== "all") url += `&status=${status}`;
      // Add timeout to prevent infinite loading
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

      const response = await api.get(url, {
        signal: controller.signal,
        timeout: 10000,
      });

      clearTimeout(timeoutId);
      return response.data; // Should be { data: [], total: N }
    } catch (error) {
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

export const fetchSaleById = createAsyncThunk(
  "sales/fetchSaleById",
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
      // Fetch all products without pagination (use a large limit)
      const response = await api.get("/products?limit=1000");
      return response.data;
    } catch (error) {
      console.error("Failed to fetch products:", error);
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
      // Fetch all customers without pagination (use a large limit)
      const response = await api.get("/customers?limit=1000");
      return response.data;
    } catch (error) {
      console.error("Failed to fetch customers:", error);
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
      await api.delete("/sales/bulk", { data: { ids } });
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
      await api.delete(`/sales/${id}`);
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
  selectedSale: null,
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
  filters: {
    customerId: null,
    status: null,
    totalPriceRange: { min: null, max: null },
    dateRange: { start: null, end: null },
    paymentMethod: null,
  },
  filteredItems: [],
  selectedItems: [],
  selectAll: false,
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
    setItemsPerPage: (state, action) => {
      state.pagination.itemsPerPage = action.payload;
      state.pagination.currentPage = 1; // Reset to first page when changing page size
      state.pagination.totalPages = Math.ceil((state.pagination.totalItems || 0) / state.pagination.itemsPerPage);
    },
    setFilterOptions: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
      state.pagination.currentPage = 1; // Reset to first page when filtering
    },
    clearFilters: (state) => {
      state.filters = {
        customerId: null,
        status: null,
        totalPriceRange: { min: null, max: null },
        dateRange: { start: null, end: null },
        paymentMethod: null,
      };
      state.pagination.currentPage = 1; // Reset to first page when clearing filters
    },
    setFilteredItems: (state, action) => {
      state.filteredItems = action.payload;
    },
    toggleItemSelection: (state, action) => {
      const id = action.payload;
      if (state.selectedItems.includes(id)) {
        state.selectedItems = state.selectedItems.filter((item) => item !== id);
      } else {
        state.selectedItems.push(id);
      }
      state.selectAll = false;
    },
    toggleSelectAll: (state) => {
      if (state.selectAll) {
        state.selectedItems = [];
        state.selectAll = false;
      } else {
        state.selectedItems = state.sales.map((sale) => sale.id);
        state.selectAll = true;
      }
    },
    clearSelection: (state) => {
      state.selectedItems = [];
      state.selectAll = false;
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
        state.sales = action.payload.data || [];
        // Backend returns pagination data in action.payload.pagination object
        state.pagination.totalItems = action.payload.pagination?.totalItems || 0;
        state.pagination.totalPages = action.payload.pagination?.totalPages || 0;
        state.pagination.currentPage = action.payload.pagination?.currentPage || state.pagination.currentPage;
        state.pagination.itemsPerPage = action.payload.pagination?.itemsPerPage || state.pagination.itemsPerPage;
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
        // Extract data from response
        state.saleDetails = action.payload?.data || action.payload;
      })
      .addCase(fetchSaleDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch Sale By ID
      .addCase(fetchSaleById.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.saleDetails = null;
      })
      .addCase(fetchSaleById.fulfilled, (state, action) => {
        state.loading = false;
        // Extract data from response
        state.saleDetails = action.payload?.data || action.payload;
      })
      .addCase(fetchSaleById.rejected, (state, action) => {
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
        // Extract data from response
        const saleData = action.payload?.data || action.payload;
        state.sales.unshift(saleData);
        
        // Show success notification
        showSuccess(
          'Sale Created Successfully',
          `Sale order has been recorded successfully.`,
          4000
        );
      })
      .addCase(createSale.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        showError(
          'Sale Creation Failed',
          action.payload || 'Unable to create the sale. Please try again.',
          5000
        );
      })

      // Update Sale Status
      .addCase(updateSaleStatus.fulfilled, (state, action) => {
        // Extract data from response
        const saleData = action.payload?.data || action.payload;
        const index = state.sales.findIndex(
          (sale) => sale.id === saleData.id
        );
        if (index !== -1) {
          state.sales[index] = saleData;
        }
        if (state.saleDetails?.id === saleData.id) {
          state.saleDetails = saleData;
        }
        
        // Show success notification
        showSuccess(
          'Sale Status Updated',
          `Sale order ${saleData.orderNumber || 'SO-' + saleData.id?.slice(0, 8) || 'N/A'} status has been updated to ${saleData.status}.`,
          4000
        );
      })
      .addCase(updateSaleStatus.rejected, (state, action) => {
        showError(
          'Status Update Failed',
          action.payload || 'Unable to update sale status. Please try again.',
          5000
        );
      })

      // Fetch Products
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false;
        // Extract data array from response - ensure it's always an array
        const data = action.payload?.data || action.payload || [];
        state.products = Array.isArray(data) ? data : [];
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.products = [];
      })

      // Fetch Customers
      .addCase(fetchCustomers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCustomers.fulfilled, (state, action) => {
        state.loading = false;
        // Extract data array from response - ensure it's always an array
        const data = action.payload?.data || action.payload || [];
        state.customers = Array.isArray(data) ? data : [];
      })
      .addCase(fetchCustomers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.customers = [];
      })

      // Bulk delete
      .addCase(bulkDeleteSales.fulfilled, (state, action) => {
        state.sales = state.sales.filter(
          (sale) => !action.payload.includes(sale.id)
        );
        state.pagination.totalItems -= action.payload.length;
        
        // Show success notification
        showSuccess(
          'Sales Deleted Successfully',
          `${action.payload.length} sale(s) have been removed from your records.`,
          4000
        );
      })
      .addCase(bulkDeleteSales.rejected, (state, action) => {
        showError(
          'Bulk Delete Failed',
          action.payload || 'Unable to delete the selected sales. Please try again.',
          5000
        );
      })

      // Import
      .addCase(importSales.fulfilled, (state, action) => {
        state.sales = [...action.payload, ...state.sales];
        state.pagination.totalItems += action.payload.length;
        
        // Show success notification
        showSuccess(
          'Sales Imported Successfully',
          `${action.payload.length} sale(s) have been imported from CSV.`,
          4000
        );
      })
      .addCase(importSales.rejected, (state, action) => {
        showError(
          'Import Failed',
          action.payload || 'Unable to import sales from CSV. Please check the file format and try again.',
          5000
        );
      })

      // Update Sale
      .addCase(updateSale.fulfilled, (state, action) => {
        // Extract data from response
        const saleData = action.payload?.data || action.payload;
        const idx = state.sales.findIndex(
          (sale) => sale.id === saleData.id
        );
        if (idx !== -1) {
          state.sales[idx] = saleData;
        }
        if (state.saleDetails?.id === saleData.id) {
          state.saleDetails = saleData;
        }
        
        // Note: Notification removed to avoid duplicate notifications
        // The notification is already shown by the edit drawer/form
      })
      .addCase(updateSale.rejected, (state, action) => {
        showError(
          'Sale Update Failed',
          action.payload || 'Unable to update the sale. Please try again.',
          5000
        );
      })

      // Delete Sale
      .addCase(deleteSale.fulfilled, (state, action) => {
        state.sales = state.sales.filter((sale) => sale.id !== action.payload);
        state.pagination.totalItems -= 1;
        
        // Show success notification
        showSuccess(
          'Sale Deleted Successfully',
          'The sale has been removed from your records.',
          4000
        );
      })
      .addCase(deleteSale.rejected, (state, action) => {
        showError(
          'Sale Deletion Failed',
          action.payload || 'Unable to delete the sale. Please try again.',
          5000
        );
      });
  },
});

// Export Actions
export const {
  setStatusFilter,
  setSortField,
  setSortOrder,
  setCurrentPage,
  setItemsPerPage,
  setFilterOptions,
  clearFilters,
  setFilteredItems,
  toggleItemSelection,
  toggleSelectAll,
  clearSelection,
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
