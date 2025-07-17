// src/store/slices/supplierSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../services/api";

// Async Thunks
export const fetchSuppliers = createAsyncThunk(
  "supplier/fetchAll",
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await api.get("/suppliers", { params });
      return response.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to load suppliers"
      );
    }
  }
);

export const createSupplier = createAsyncThunk(
  "supplier/create",
  async (supplierData, { rejectWithValue }) => {
    try {
      const response = await api.post("/suppliers", supplierData);
      return response.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to create supplier"
      );
    }
  }
);

export const updateSupplier = createAsyncThunk(
  "supplier/update",
  async ({ id, ...supplierData }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/suppliers/${id}`, supplierData);
      return response.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to update supplier"
      );
    }
  }
);

export const deleteSupplier = createAsyncThunk(
  "supplier/delete",
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/suppliers/${id}`);
      return id;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to delete supplier"
      );
    }
  }
);

// Bulk operations
export const bulkDeleteSuppliers = createAsyncThunk(
  "supplier/bulkDelete",
  async (ids, { rejectWithValue }) => {
    try {
      await api.post("/suppliers/bulk-delete", { ids });
      return ids;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to delete suppliers"
      );
    }
  }
);

export const bulkUpdateSuppliers = createAsyncThunk(
  "supplier/bulkUpdate",
  async ({ ids, data }, { rejectWithValue }) => {
    try {
      await api.post("/suppliers/bulk-update", { ids, data });
      return { ids, data };
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to update suppliers"
      );
    }
  }
);

// Import/Export operations
export const importSuppliers = createAsyncThunk(
  "supplier/import",
  async (suppliers, { rejectWithValue }) => {
    try {
      const response = await api.post("/suppliers/import", { suppliers });
      return response.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to import suppliers"
      );
    }
  }
);

export const exportSuppliers = createAsyncThunk(
  "supplier/export",
  async (params, { rejectWithValue }) => {
    try {
      const response = await api.get("/suppliers/export", {
        params,
        responseType: "blob",
      });

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "suppliers.csv");
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      return { success: true };
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to export suppliers"
      );
    }
  }
);

const initialState = {
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
  isModalOpen: false,
  editingSupplier: null,
  filters: {
    hasPhone: false,
    hasAddress: false,
    hasEmail: false,
    hasCompany: false,
  },
};

const supplierSlice = createSlice({
  name: "supplier",
  initialState,
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
    setFilter: (state, action) => {
      state.filters[action.payload.key] = action.payload.value;
      state.currentPage = 1;
    },
    setCurrentPage: (state, action) => {
      state.currentPage = action.payload;
    },
    openCreateModal: (state) => {
      state.isModalOpen = true;
      state.editingSupplier = null;
    },
    openEditModal: (state, action) => {
      state.isModalOpen = true;
      state.editingSupplier = action.payload;
    },
    closeModal: (state) => {
      state.isModalOpen = false;
      state.editingSupplier = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Suppliers
      .addCase(fetchSuppliers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSuppliers.fulfilled, (state, action) => {
        state.loading = false;
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
      })
      .addCase(fetchSuppliers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Create Supplier
      .addCase(createSupplier.pending, (state) => {
        state.loading = true;
      })
      .addCase(createSupplier.fulfilled, (state) => {
        // Refresh the supplier list to get updated pagination
        // The useEffect will automatically refetch with current parameters
        state.isModalOpen = false;
      })
      .addCase(createSupplier.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Update Supplier
      .addCase(updateSupplier.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateSupplier.fulfilled, (state) => {
        // Refresh the supplier list to get updated data
        // The useEffect will automatically refetch with current parameters
        state.isModalOpen = false;
      })
      .addCase(updateSupplier.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Delete Supplier
      .addCase(deleteSupplier.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteSupplier.fulfilled, (state) => {
        state.loading = false;
        // Refresh the supplier list to get updated pagination
        // The useEffect will automatically refetch with current parameters
      })
      .addCase(deleteSupplier.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Bulk Delete Suppliers
      .addCase(bulkDeleteSuppliers.pending, (state) => {
        state.loading = true;
      })
      .addCase(bulkDeleteSuppliers.fulfilled, (state) => {
        state.loading = false;
        // Refresh the supplier list to get updated pagination
        // The useEffect will automatically refetch with current parameters
      })
      .addCase(bulkDeleteSuppliers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Bulk Update Suppliers
      .addCase(bulkUpdateSuppliers.pending, (state) => {
        state.loading = true;
      })
      .addCase(bulkUpdateSuppliers.fulfilled, (state) => {
        state.loading = false;
        // Refresh the supplier list to get updated data
        // The useEffect will automatically refetch with current parameters
      })
      .addCase(bulkUpdateSuppliers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Import Suppliers
      .addCase(importSuppliers.pending, (state) => {
        state.loading = true;
      })
      .addCase(importSuppliers.fulfilled, (state) => {
        state.loading = false;
        // Refresh the supplier list to get updated pagination
        // The useEffect will automatically refetch with current parameters
      })
      .addCase(importSuppliers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Export Suppliers
      .addCase(exportSuppliers.pending, (state) => {
        state.loading = true;
      })
      .addCase(exportSuppliers.fulfilled, (state) => {
        state.loading = false;
        // Export completed successfully
      })
      .addCase(exportSuppliers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const {
  setSearchTerm,
  setSortField,
  setFilter,
  setCurrentPage,
  openCreateModal,
  openEditModal,
  closeModal,
} = supplierSlice.actions;

export default supplierSlice.reducer;
