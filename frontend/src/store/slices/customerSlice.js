// src/store/slices/customerSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../services/api";

// Helper function for filtering/sorting
const applyFilters = (state) => {
  let filtered = [...state.items];

  // Apply search
  if (state.filters.searchTerm) {
    filtered = filtered.filter(
      (customer) =>
        customer.name
          .toLowerCase()
          .includes(state.filters.searchTerm.toLowerCase()) ||
        customer.email
          .toLowerCase()
          .includes(state.filters.searchTerm.toLowerCase()) ||
        (customer.phone &&
          customer.phone
            .toLowerCase()
            .includes(state.filters.searchTerm.toLowerCase())) ||
        (customer.address &&
          customer.address
            .toLowerCase()
            .includes(state.filters.searchTerm.toLowerCase()))
    );
  }

  // Apply filters
  filtered = filtered.filter(
    (customer) =>
      (!state.filters.options.hasPhone ||
        (customer.phone && customer.phone.trim() !== "")) &&
      (!state.filters.options.hasAddress ||
        (customer.address && customer.address.trim() !== ""))
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
export const fetchCustomers = createAsyncThunk(
  "customer/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/customers");
      return response.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to load customers"
      );
    }
  }
);

export const createCustomer = createAsyncThunk(
  "customer/create",
  async (customerData, { rejectWithValue }) => {
    try {
      const response = await api.post("/customers", customerData);
      return response.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to create customer"
      );
    }
  }
);

export const updateCustomer = createAsyncThunk(
  "customer/update",
  async ({ id, ...customerData }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/customers/${id}`, customerData);
      return response.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to update customer"
      );
    }
  }
);

export const deleteCustomer = createAsyncThunk(
  "customer/delete",
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/customers/${id}`);
      return id;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to delete customer"
      );
    }
  }
);

const initialState = {
  // Data State
  items: [],
  filteredItems: [],

  // UI State
  loading: false,
  error: null,

  // Modal & Form State
  modal: {
    isOpen: false,
    mode: "create", // 'create' or 'edit'
    formData: {
      name: "",
      email: "",
      phone: "",
      address: "",
    },
  },

  // Pagination/Sorting/Filtering
  pagination: {
    currentPage: 1,
    itemsPerPage: 10,
  },
  filters: {
    searchTerm: "",
    sortField: "name",
    sortOrder: "asc",
    options: {
      hasPhone: false,
      hasAddress: false,
    },
  },
};

const customerSlice = createSlice({
  name: "customer",
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
      state.pagination.currentPage = 1;
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
      state.pagination.currentPage = 1;
      applyFilters(state);
    },
    toggleAddressFilter: (state) => {
      state.filters.options.hasAddress = !state.filters.options.hasAddress;
      state.pagination.currentPage = 1;
      applyFilters(state);
    },
    setCurrentPage: (state, action) => {
      state.pagination.currentPage = action.payload;
    },

    // Reset state
    resetCustomerState: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      // Fetch Customers
      .addCase(fetchCustomers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCustomers.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
        applyFilters(state);
      })
      .addCase(fetchCustomers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Create Customer
      .addCase(createCustomer.pending, (state) => {
        state.loading = true;
      })
      .addCase(createCustomer.fulfilled, (state, action) => {
        state.loading = false;
        state.items.unshift(action.payload);
        applyFilters(state);
        state.modal.isOpen = false;
      })
      .addCase(createCustomer.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Update Customer
      .addCase(updateCustomer.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateCustomer.fulfilled, (state, action) => {
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
      .addCase(updateCustomer.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Delete Customer
      .addCase(deleteCustomer.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteCustomer.fulfilled, (state, action) => {
        state.loading = false;
        state.items = state.items.filter((item) => item.id !== action.payload);
        applyFilters(state);
      })
      .addCase(deleteCustomer.rejected, (state, action) => {
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
  setCurrentPage,
  resetCustomerState,
} = customerSlice.actions;

export default customerSlice.reducer;
