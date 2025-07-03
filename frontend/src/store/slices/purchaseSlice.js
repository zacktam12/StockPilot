import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../services/api";

// Async Thunks
export const fetchPurchases = createAsyncThunk(
  "purchases/fetchPurchases",
  async ({ sortBy = "created_at", order = "desc" }, { rejectWithValue }) => {
    try {
      const response = await api.get(
        `/purchases?sortBy=${sortBy}&order=${order}`
      );
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
  async (purchases, { rejectWithValue, dispatch }) => {
    try {
      const response = await api.post("/purchases/import", { purchases });
      // Optionally, refresh purchases list
      dispatch(fetchPurchases({}));
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
    purchases: [], // <-- Ensure purchases array is defined
    currentPurchase: null,
    receipt: null,
    loading: false,
    error: null,
    sortOptions: {
      field: "created_at",
      order: "desc",
    },
    pagination: {
      currentPage: 1,
      totalPages: 1,
      totalItems: 0,
    },
    selectedItems: [],
    selectAll: false,
  },

  isModalOpen: false,
  reducers: {
    setSortOptions: (state, action) => {
      state.sortOptions = action.payload;
    },
    setCurrentPage: (state, action) => {
      state.pagination.currentPage = action.payload;
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
    openModal: (state) => {
      state.isModalOpen = true;
    },
    closeModal: (state) => {
      state.isModalOpen = false;
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
        state.selectedItems = state.purchases.map((purchase) => purchase.id);
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
        state.purchases = action.payload.data;
        state.pagination = {
          currentPage: action.payload.currentPage,
          totalPages: action.payload.totalPages,
          totalItems: action.payload.totalItems,
        };
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
      .addCase(createPurchase.fulfilled, (state, action) => {
        state.loading = false;
        if (!Array.isArray(state.purchases)) state.purchases = [];
        state.purchases.unshift(action.payload);
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
        state.purchases = state.purchases.map((purchase) =>
          purchase.id === action.payload.id ? action.payload : purchase
        );
        if (state.currentPurchase?.id === action.payload.id) {
          state.currentPurchase = action.payload;
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
          (purchase) => purchase.id !== action.payload
        );
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
      });
  },
});

// Export Actions
export const {
  setSortOptions,
  setCurrentPage,
  clearCurrentPurchase,
  clearReceipt,
  clearError,
  openModal,
  closeModal,
  toggleItemSelection,
  toggleSelectAll,
  clearSelection,
} = purchaseSlice.actions;

// Export Reducer
export default purchaseSlice.reducer;
