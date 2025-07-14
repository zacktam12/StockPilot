import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../services/api";

// Async Thunks
export const fetchPurchases = createAsyncThunk(
  "purchases/fetchPurchases",
  async (params = {}, { rejectWithValue }) => {
    try {
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
      // Do not send userId from frontend
      const payload = {
        supplierId: purchaseData.supplierId,
        totalCost: purchaseData.totalCost,
        discount: purchaseData.discount || 0,
        tax: purchaseData.tax || 0,
        status: purchaseData.status || "pending",
        notes: purchaseData.notes || "",
        items: purchaseData.items || [],
      };
      const response = await api.post("/purchases", payload);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to create purchase"
      );
    }
  }
);

export const updatePurchaseStatus = createAsyncThunk(
  "purchases/updateStatus",
  async ({ id, status }, { rejectWithValue }) => {
    try {
      // Map 'completed' to 'received' for backend
      const mappedStatus = status === "completed" ? "received" : status;
      const response = await api.patch(`/purchases/${id}/status`, {
        status: mappedStatus,
      });
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

export const importPurchases = createAsyncThunk(
  "purchases/importPurchases",
  async (purchases, { rejectWithValue }) => {
    try {
      const response = await api.post("/purchases/import", { purchases });
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
    items: [],
    loading: false,
    error: null,
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 5,
    searchTerm: "",
    sortField: "createdAt",
    sortOrder: "desc",
    selectedItems: [],
    selectAll: false,
    currentPurchase: null,
    receipt: null,
  },

  reducers: {
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
    setCurrentPage: (state, action) => {
      state.currentPage = action.payload;
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
        state.selectedItems = state.items.map((purchase) => purchase.id);
        state.selectAll = true;
      }
    },
    clearSelection: (state) => {
      state.selectedItems = [];
      state.selectAll = false;
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
        console.log("fetchPurchases fulfilled:", action.payload);
        if (action.payload && action.payload.data) {
          // Server-side paginated response
          state.items = action.payload.data;
          if (action.payload.pagination) {
            state.totalItems =
              action.payload.pagination.totalItems || action.payload.total || 0;
            state.totalPages =
              action.payload.pagination.totalPages || action.payload.pages || 1;
            state.currentPage =
              action.payload.pagination.currentPage || action.payload.page || 1;
            state.itemsPerPage = action.payload.pagination.itemsPerPage || 5;
          } else {
            // Fallback for flattened response structure
            state.totalItems = action.payload.total || 0;
            state.totalPages = action.payload.pages || 1;
            state.currentPage = action.payload.page || 1;
            state.itemsPerPage = 5;
          }
        } else if (Array.isArray(action.payload)) {
          // Non-paginated response or direct array
          state.items = action.payload;
          state.totalItems = state.items.length;
          state.totalPages = Math.ceil(state.items.length / state.itemsPerPage);
        } else {
          // Fallback
          state.items = [];
          state.totalItems = 0;
          state.totalPages = 1;
        }
        console.log("Updated purchase state:", {
          itemsCount: state.items.length,
          currentPage: state.currentPage,
          totalPages: state.totalPages,
          totalItems: state.totalItems,
        });
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
        state.currentPurchase = action.payload;
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
      .addCase(createPurchase.fulfilled, (state) => {
        state.loading = false;
        // Refresh the purchase list to get updated pagination
        // The useEffect will automatically refetch with current parameters
      })
      .addCase(createPurchase.rejected, (state, action) => {
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
        // Update the specific purchase in the local state
        const updatedPurchase = action.payload.data || action.payload;
        const index = state.items.findIndex(
          (item) => item.id === updatedPurchase.id
        );
        if (index !== -1) {
          state.items[index] = { ...state.items[index], ...updatedPurchase };
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
      .addCase(deletePurchase.fulfilled, (state) => {
        state.loading = false;
        // Refresh the purchase list to get updated pagination
        // The useEffect will automatically refetch with current parameters
      })
      .addCase(deletePurchase.rejected, (state, action) => {
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
        state.receipt = action.payload;
      })
      .addCase(generateReceipt.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Import Purchases
      .addCase(importPurchases.pending, (state) => {
        state.loading = true;
      })
      .addCase(importPurchases.fulfilled, (state) => {
        state.loading = false;
        // Refresh the purchase list to get updated pagination
        // The useEffect will automatically refetch with current parameters
      })
      .addCase(importPurchases.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

// Export Actions
export const {
  setSearchTerm,
  setSortField,
  setCurrentPage,
  clearCurrentPurchase,
  clearReceipt,
  clearError,
  toggleItemSelection,
  toggleSelectAll,
  clearSelection,
} = purchaseSlice.actions;

// Export Reducer
export default purchaseSlice.reducer;
