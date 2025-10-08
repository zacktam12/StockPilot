import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../services/api";
import { showSuccess, showError, showWarning } from "../../services/notificationService";

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

export const updatePurchase = createAsyncThunk(
  "purchases/updatePurchase",
  async ({ id, purchaseData }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/purchases/${id}`, purchaseData);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update purchase"
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
    filteredItems: [],
    loading: false,
    error: null,
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10,
    searchTerm: "",
    sortField: "createdAt",
    sortOrder: "desc",
    selectedItems: [],
    selectAll: false,
    currentPurchase: null,
    receipt: null,
    isModalOpen: false,
    editingPurchase: null,
    filters: {
      supplierId: null,
      status: null,
      totalCostRange: { min: null, max: null },
      dateRange: { start: null, end: null },
      hasNotes: false,
    },
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
    setItemsPerPage: (state, action) => {
      state.itemsPerPage = action.payload;
      state.currentPage = 1; // Reset to first page when changing page size
      // totalPages will be updated when the next fetch completes
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
    openCreateModal: (state) => {
      state.isModalOpen = true;
      state.editingPurchase = null;
    },
    openEditModal: (state, action) => {
      state.isModalOpen = true;
      state.editingPurchase = action.payload;
    },
    closeModal: (state) => {
      state.isModalOpen = false;
      state.editingPurchase = null;
    },
    setFilterOptions: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
      state.currentPage = 1; // Reset to first page when filtering
    },
    clearFilters: (state) => {
      state.filters = {
        supplierId: null,
        status: null,
        totalCostRange: { min: null, max: null },
        dateRange: { start: null, end: null },
        hasNotes: false,
      };
      state.currentPage = 1; // Reset to first page when clearing filters
    },
    setFilteredItems: (state, action) => {
      state.filteredItems = action.payload;
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
        // Handle the actual backend response structure
        if (action.payload && action.payload.success && action.payload.data) {
          // Backend returns: { success: true, data: purchases[], pagination: {...} }
          state.items = action.payload.data;
          
          if (action.payload.pagination) {
            state.totalItems = action.payload.pagination.totalItems || 0;
            state.totalPages = action.payload.pagination.totalPages || 1;
            state.currentPage = action.payload.pagination.currentPage || 1;
            state.itemsPerPage = action.payload.pagination.itemsPerPage || 10;
          } else {
            // Fallback if no pagination data
            state.totalItems = state.items.length;
            state.totalPages = Math.ceil(state.items.length / state.itemsPerPage);
            state.currentPage = 1;
          }
        } else if (Array.isArray(action.payload)) {
          // Direct array response (fallback)
          state.items = action.payload;
          state.totalItems = state.items.length;
          state.totalPages = Math.ceil(state.items.length / state.itemsPerPage);
          state.currentPage = 1;
        } else {
          // No data or error
          state.items = [];
          state.totalItems = 0;
          state.totalPages = 1;
          state.currentPage = 1;
        }
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
        // Handle the nested response structure from backend
        if (action.payload && action.payload.success && action.payload.data) {
          state.currentPurchase = action.payload.data;
        } else {
          // Fallback if response structure is different
          state.currentPurchase = action.payload;
        }
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
        // Refresh the purchase list to get updated pagination
        // The useEffect will automatically refetch with current parameters
        
        // Show success notification
        const purchase = action.payload.data || action.payload;
        showSuccess(
          'Purchase Created Successfully',
          `Purchase order ${purchase.poNumber || 'PO-' + purchase.id?.slice(0, 8) || 'N/A'} has been recorded.`,
          4000
        );
      })
      .addCase(createPurchase.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        showError(
          'Purchase Creation Failed',
          action.payload || 'Unable to create the purchase. Please try again.',
          5000
        );
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
        
        // Show success notification
        showSuccess(
          'Purchase Status Updated',
          `Purchase order ${updatedPurchase.poNumber || 'PO-' + updatedPurchase.id?.slice(0, 8) || 'N/A'} status has been updated to ${updatedPurchase.status}.`,
          4000
        );
      })
      .addCase(updatePurchaseStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        showError(
          'Status Update Failed',
          action.payload || 'Unable to update purchase status. Please try again.',
          5000
        );
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
        
        // Show success notification
        showSuccess(
          'Purchase Deleted Successfully',
          'The purchase has been removed from your records.',
          4000
        );
      })
      .addCase(deletePurchase.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        showError(
          'Purchase Deletion Failed',
          action.payload || 'Unable to delete the purchase. Please try again.',
          5000
        );
      })

      // Update Purchase
      .addCase(updatePurchase.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updatePurchase.fulfilled, (state, action) => {
        state.loading = false;
        // Update the current purchase if it's the one being updated
        if (state.currentPurchase && state.currentPurchase.id === action.payload.id) {
          state.currentPurchase = { ...state.currentPurchase, ...action.payload };
        }
        // Update in items list if it exists
        const index = state.items.findIndex(item => item.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = { ...state.items[index], ...action.payload };
        }
        
        // Show success notification
        showSuccess(
          'Purchase Updated Successfully',
          `Purchase order ${action.payload.poNumber || 'PO-' + action.payload.id?.slice(0, 8) || 'N/A'} has been updated.`,
          4000
        );
      })
      .addCase(updatePurchase.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        showError(
          'Purchase Update Failed',
          action.payload || 'Unable to update the purchase. Please try again.',
          5000
        );
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
  setItemsPerPage,
  clearCurrentPurchase,
  clearReceipt,
  clearError,
  toggleItemSelection,
  toggleSelectAll,
  clearSelection,
  openCreateModal,
  openEditModal,
  closeModal,
  setFilterOptions,
  clearFilters,
  setFilteredItems,
} = purchaseSlice.actions;

// Export Reducer
export default purchaseSlice.reducer;
