import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../services/api";

// Async Thunks
export const fetchPurchases = createAsyncThunk(
  "purchases/fetchPurchases",
  async (
    {
      page = 1,
      limit = 10,
      search = "",
      sortField = "",
      sortOrder = "",
      status = "",
      supplierId = "",
      startDate = "",
      endDate = "",
    },
    { rejectWithValue }
  ) => {
    try {
      const params = {
        page,
        limit,
        search,
        sortField,
        sortOrder,
        status,
        supplierId,
        startDate,
        endDate,
      };
      const response = await api.get("/purchases", { params });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch purchases"
      );
    }
  }
);

export const fetchPurchaseById = createAsyncThunk(
  "purchases/fetchPurchaseById",
  async (purchaseId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/purchases/${purchaseId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch purchase"
      );
    }
  }
);

export const createPurchase = createAsyncThunk(
  "purchases/createPurchase",
  async (purchaseData, { rejectWithValue }) => {
    try {
      const response = await api.post("/purchases", purchaseData);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to create purchase"
      );
    }
  }
);

export const updatePurchase = createAsyncThunk(
  "purchases/updatePurchase",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/purchases/${id}`, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update purchase"
      );
    }
  }
);

export const updatePurchaseStatus = createAsyncThunk(
  "purchases/updateStatus",
  async ({ id, status }, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/purchases/${id}/status`, { status });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update status"
      );
    }
  }
);

export const deletePurchase = createAsyncThunk(
  "purchases/deletePurchase",
  async (purchaseId, { rejectWithValue }) => {
    try {
      await api.delete(`/purchases/${purchaseId}`);
      return purchaseId;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete purchase"
      );
    }
  }
);

// Bulk operations
export const bulkDeletePurchases = createAsyncThunk(
  "purchases/bulkDelete",
  async (ids, { rejectWithValue }) => {
    try {
      await api.post("/purchases/bulk-delete", { ids });
      return ids;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete purchases"
      );
    }
  }
);

export const bulkUpdatePurchases = createAsyncThunk(
  "purchases/bulkUpdate",
  async ({ ids, data }, { rejectWithValue }) => {
    try {
      await api.post("/purchases/bulk-update", { ids, data });
      return { ids, data };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update purchases"
      );
    }
  }
);

// Statistics
export const fetchPurchaseStats = createAsyncThunk(
  "purchases/fetchStats",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/purchases/stats/overview");
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch purchase statistics"
      );
    }
  }
);

// Receipt generation
export const generateReceipt = createAsyncThunk(
  "purchases/generateReceipt",
  async (purchaseId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/purchases/${purchaseId}/receipt`);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to generate receipt"
      );
    }
  }
);

// Export to CSV
export const exportPurchases = createAsyncThunk(
  "purchases/export",
  async (params, { rejectWithValue }) => {
    try {
      const response = await api.get("/purchases/export", {
        params,
        responseType: "blob",
      });

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `purchases-${new Date().toISOString().split("T")[0]}.csv`
      );
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      return "Export completed";
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to export purchases"
      );
    }
  }
);

// Import from CSV
export const importPurchases = createAsyncThunk(
  "purchases/import",
  async (formData, { rejectWithValue }) => {
    try {
      const response = await api.post("/purchases/import", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to import purchases"
      );
    }
  }
);

// Slice
const purchaseSlice = createSlice({
  name: "purchases",
  initialState: {
    purchases: [],
    currentPurchase: null,
    receipt: null,
    stats: null,
    loading: false,
    error: null,
    selectedPurchases: [],
    filters: {
      search: "",
      status: "",
      supplierId: "",
      startDate: "",
      endDate: "",
    },
    sortOptions: {
      field: "createdAt",
      order: "desc",
    },
    pagination: {
      currentPage: 1,
      totalPages: 1,
      totalItems: 0,
      itemsPerPage: 10,
    },
  },

  reducers: {
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
      state.pagination.currentPage = 1; // Reset to first page when filters change
    },
    setSortOptions: (state, action) => {
      state.sortOptions = action.payload;
    },
    setCurrentPage: (state, action) => {
      state.pagination.currentPage = action.payload;
    },
    setSelectedPurchases: (state, action) => {
      state.selectedPurchases = action.payload;
    },
    togglePurchaseSelection: (state, action) => {
      const purchaseId = action.payload;
      const index = state.selectedPurchases.indexOf(purchaseId);
      if (index > -1) {
        state.selectedPurchases.splice(index, 1);
      } else {
        state.selectedPurchases.push(purchaseId);
      }
    },
    selectAllPurchases: (state, action) => {
      if (action.payload) {
        state.selectedPurchases = state.purchases.map((p) => p.id);
      } else {
        state.selectedPurchases = [];
      }
    },
    clearCurrentPurchase: (state) => {
      state.currentPurchase = null;
    },
    clearReceipt: (state) => {
      state.receipt = null;
    },
    clearError: (state) => {
      state.error = null;
    },
    clearStats: (state) => {
      state.stats = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Purchases
      .addCase(fetchPurchases.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPurchases.fulfilled, (state, action) => {
        state.loading = false;
        state.purchases = action.payload.data;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchPurchases.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch Purchase by ID
      .addCase(fetchPurchaseById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPurchaseById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentPurchase = action.payload.data;
      })
      .addCase(fetchPurchaseById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Create Purchase
      .addCase(createPurchase.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createPurchase.fulfilled, (state, action) => {
        state.loading = false;
        state.purchases.unshift(action.payload.data);
        state.pagination.totalItems += 1;
      })
      .addCase(createPurchase.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Update Purchase
      .addCase(updatePurchase.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updatePurchase.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.purchases.findIndex(
          (p) => p.id === action.payload.data.id
        );
        if (index !== -1) {
          state.purchases[index] = action.payload.data;
        }
        if (state.currentPurchase?.id === action.payload.data.id) {
          state.currentPurchase = action.payload.data;
        }
      })
      .addCase(updatePurchase.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Update Status
      .addCase(updatePurchaseStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updatePurchaseStatus.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.purchases.findIndex(
          (p) => p.id === action.payload.data.id
        );
        if (index !== -1) {
          state.purchases[index] = action.payload.data;
        }
        if (state.currentPurchase?.id === action.payload.data.id) {
          state.currentPurchase = action.payload.data;
        }
      })
      .addCase(updatePurchaseStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Delete Purchase
      .addCase(deletePurchase.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deletePurchase.fulfilled, (state, action) => {
        state.loading = false;
        state.purchases = state.purchases.filter(
          (p) => p.id !== action.payload
        );
        state.pagination.totalItems -= 1;
        state.selectedPurchases = state.selectedPurchases.filter(
          (id) => id !== action.payload
        );
      })
      .addCase(deletePurchase.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Bulk Delete
      .addCase(bulkDeletePurchases.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(bulkDeletePurchases.fulfilled, (state, action) => {
        state.loading = false;
        state.purchases = state.purchases.filter(
          (p) => !action.payload.includes(p.id)
        );
        state.pagination.totalItems -= action.payload.length;
        state.selectedPurchases = [];
      })
      .addCase(bulkDeletePurchases.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Bulk Update
      .addCase(bulkUpdatePurchases.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(bulkUpdatePurchases.fulfilled, (state, action) => {
        state.loading = false;
        const { ids, data } = action.payload;
        state.purchases = state.purchases.map((p) =>
          ids.includes(p.id) ? { ...p, ...data } : p
        );
        state.selectedPurchases = [];
      })
      .addCase(bulkUpdatePurchases.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch Stats
      .addCase(fetchPurchaseStats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPurchaseStats.fulfilled, (state, action) => {
        state.loading = false;
        state.stats = action.payload.data;
      })
      .addCase(fetchPurchaseStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Generate Receipt
      .addCase(generateReceipt.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(generateReceipt.fulfilled, (state, action) => {
        state.loading = false;
        state.receipt = action.payload.data;
      })
      .addCase(generateReceipt.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Export
      .addCase(exportPurchases.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(exportPurchases.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(exportPurchases.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Import
      .addCase(importPurchases.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(importPurchases.fulfilled, (state) => {
        state.loading = false;
        // Refresh the purchases list after import
        // The component should call fetchPurchases after successful import
      })
      .addCase(importPurchases.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

// Export Actions
export const {
  setFilters,
  setSortOptions,
  setCurrentPage,
  setSelectedPurchases,
  togglePurchaseSelection,
  selectAllPurchases,
  clearCurrentPurchase,
  clearReceipt,
  clearError,
  clearStats,
} = purchaseSlice.actions;

// Export Reducer
export default purchaseSlice.reducer;
