// src/store/slices/supplierSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../services/api";

// Helper function for filtering/sorting
const applyFilters = (state) => {
  let filtered = [...state.items];

  // Apply search
  if (state.filters.searchTerm) {
    filtered = filtered.filter(
      (supplier) =>
        supplier.name
          .toLowerCase()
          .includes(state.filters.searchTerm.toLowerCase()) ||
        (supplier.contactName &&
          supplier.contactName
            .toLowerCase()
            .includes(state.filters.searchTerm.toLowerCase())) ||
        (supplier.email &&
          supplier.email
            .toLowerCase()
            .includes(state.filters.searchTerm.toLowerCase())) ||
        (supplier.phone &&
          supplier.phone
            .toLowerCase()
            .includes(state.filters.searchTerm.toLowerCase())) ||
        (supplier.address &&
          supplier.address
            .toLowerCase()
            .includes(state.filters.searchTerm.toLowerCase())) ||
        (supplier.companyName &&
          supplier.companyName
            .toLowerCase()
            .includes(state.filters.searchTerm.toLowerCase()))
    );
  }

  // Apply filters
  filtered = filtered.filter(
    (supplier) =>
      (!state.filters.options.hasPhone ||
        (supplier.phone && supplier.phone.trim() !== "")) &&
      (!state.filters.options.hasAddress ||
        (supplier.address && supplier.address.trim() !== "")) &&
      (!state.filters.options.hasEmail ||
        (supplier.email && supplier.email.trim() !== "")) &&
      (!state.filters.options.hasCompany ||
        (supplier.companyName && supplier.companyName.trim() !== ""))
  );

  // Apply sorting
  filtered.sort((a, b) => {
    const aValue = a[state.filters.sortField];
    const bValue = b[state.filters.sortField];
    if (aValue < bValue) return state.filters.sortOrder === "asc" ? -1 : 1;
    if (aValue > bValue) return state.filters.sortOrder === "asc" ? 1 : -1;
    return 0;
  });

  state.filteredItems = filtered;
};

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
  filteredItems: [],
  loading: false,
  error: null,
  currentPage: 1,
  totalPages: 1,
  totalItems: 0,
  itemsPerPage: 10,
  modal: {
    isOpen: false,
    mode: "create", // 'create' or 'edit'
    formData: {
      name: "",
      contactName: "",
      email: "",
      phone: "",
      address: "",
      companyName: "",
    },
  },
  filters: {
    searchTerm: "",
    sortField: "name",
    sortOrder: "asc",
    options: {
      hasPhone: false,
      hasAddress: false,
      hasEmail: false,
      hasCompany: false,
    },
  },
};

const supplierSlice = createSlice({
  name: "supplier",
  initialState,
  reducers: {
    // Modal actions
    openCreateModal: (state) => {
      state.modal = {
        isOpen: true,
        mode: "create",
        formData: initialState.modal.formData,
      };
      state.error = null;
    },
    openEditModal: (state, action) => {
      state.modal = {
        isOpen: true,
        mode: "edit",
        formData: action.payload,
      };
      state.error = null;
    },
    closeModal: (state) => {
      state.modal.isOpen = false;
    },

    // Form actions
    setFormField: (state, action) => {
      const { field, value } = action.payload;
      state.modal.formData = {
        ...state.modal.formData,
        [field]: value,
      };
    },
    resetForm: (state) => {
      state.modal.formData = initialState.modal.formData;
    },

    // Filter/sort actions
    setSearchTerm: (state, action) => {
      state.filters.searchTerm = action.payload;
      state.currentPage = 1;
      applyFilters(state);
    },
    setSort: (state, action) => {
      if (state.filters.sortField === action.payload.field) {
        state.filters.sortOrder =
          state.filters.sortOrder === "asc" ? "desc" : "asc";
      } else {
        state.filters.sortField = action.payload.field;
        state.filters.sortOrder = "asc";
      }
      applyFilters(state);
    },
    togglePhoneFilter: (state) => {
      state.filters.options.hasPhone = !state.filters.options.hasPhone;
      state.currentPage = 1;
      applyFilters(state);
    },
    toggleAddressFilter: (state) => {
      state.filters.options.hasAddress = !state.filters.options.hasAddress;
      state.currentPage = 1;
      applyFilters(state);
    },
    toggleEmailFilter: (state) => {
      state.filters.options.hasEmail = !state.filters.options.hasEmail;
      state.currentPage = 1;
      applyFilters(state);
    },
    toggleCompanyFilter: (state) => {
      state.filters.options.hasCompany = !state.filters.options.hasCompany;
      state.currentPage = 1;
      applyFilters(state);
    },
    setCurrentPage: (state, action) => {
      state.currentPage = action.payload;
    },

    // Reset state
    resetSupplierState: () => initialState,
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
        // Handle paginated response from backend
        if (action.payload && action.payload.data) {
          state.items = action.payload.data;
          state.totalItems = action.payload.pagination?.totalItems || 0;
          state.totalPages = action.payload.pagination?.totalPages || 1;
          state.currentPage = action.payload.pagination?.currentPage || 1;
          state.itemsPerPage = action.payload.pagination?.itemsPerPage || 10;
        } else {
          // Fallback for non-paginated response
          state.items = Array.isArray(action.payload) ? action.payload : [];
          state.totalItems = state.items.length;
          state.totalPages = Math.ceil(state.items.length / state.itemsPerPage);
        }
        applyFilters(state);
      })
      .addCase(fetchSuppliers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Create Supplier
      .addCase(createSupplier.pending, (state) => {
        state.loading = true;
      })
      .addCase(createSupplier.fulfilled, (state, action) => {
        state.loading = false;
        state.items.unshift(action.payload);
        applyFilters(state);
        state.modal.isOpen = false;
      })
      .addCase(createSupplier.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Update Supplier
      .addCase(updateSupplier.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateSupplier.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.items.findIndex(
          (item) => item.id === action.payload.id
        );
        if (index !== -1) {
          state.items[index] = action.payload;
        }
        applyFilters(state);
        state.modal.isOpen = false;
      })
      .addCase(updateSupplier.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Delete Supplier
      .addCase(deleteSupplier.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteSupplier.fulfilled, (state, action) => {
        state.loading = false;
        state.items = state.items.filter((item) => item.id !== action.payload);
        applyFilters(state);
      })
      .addCase(deleteSupplier.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Bulk Delete Suppliers
      .addCase(bulkDeleteSuppliers.pending, (state) => {
        state.loading = true;
      })
      .addCase(bulkDeleteSuppliers.fulfilled, (state, action) => {
        state.loading = false;
        state.items = state.items.filter(
          (item) => !action.payload.includes(item.id)
        );
        applyFilters(state);
      })
      .addCase(bulkDeleteSuppliers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Bulk Update Suppliers
      .addCase(bulkUpdateSuppliers.pending, (state) => {
        state.loading = true;
      })
      .addCase(bulkUpdateSuppliers.fulfilled, (state, action) => {
        state.loading = false;
        const updatedItems = state.items.map((item) =>
          action.payload.ids.includes(item.id) ? action.payload.data : item
        );
        state.items = updatedItems;
        applyFilters(state);
      })
      .addCase(bulkUpdateSuppliers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Import Suppliers
      .addCase(importSuppliers.pending, (state) => {
        state.loading = true;
      })
      .addCase(importSuppliers.fulfilled, (state, action) => {
        state.loading = false;
        state.items = [...state.items, ...action.payload];
        applyFilters(state);
      })
      .addCase(importSuppliers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Export Suppliers
      .addCase(exportSuppliers.pending, (state) => {
        state.loading = true;
      })
      .addCase(exportSuppliers.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
        applyFilters(state);
      })
      .addCase(exportSuppliers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const {
  openCreateModal,
  openEditModal,
  closeModal,
  setFormField,
  resetForm,
  setSearchTerm,
  setSort,
  togglePhoneFilter,
  toggleAddressFilter,
  toggleEmailFilter,
  toggleCompanyFilter,
  setCurrentPage,
  resetSupplierState,
} = supplierSlice.actions;

export default supplierSlice.reducer;
