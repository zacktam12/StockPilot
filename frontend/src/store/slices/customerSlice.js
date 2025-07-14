// src/store/slices/customerSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { customersAPI } from "../../services/api";

// Async Thunks
export const fetchCustomers = createAsyncThunk(
  "customer/fetchCustomers",
  async (params, { rejectWithValue }) => {
    try {
      const response = await customersAPI.getAll(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch customers"
      );
    }
  }
);

export const createCustomer = createAsyncThunk(
  "customer/createCustomer",
  async (customerData, { rejectWithValue }) => {
    try {
      const response = await customersAPI.create(customerData);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to create customer"
      );
    }
  }
);

export const updateCustomer = createAsyncThunk(
  "customer/updateCustomer",
  async ({ id, ...data }, { rejectWithValue }) => {
    try {
      const response = await customersAPI.update(id, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update customer"
      );
    }
  }
);

export const deleteCustomer = createAsyncThunk(
  "customer/deleteCustomer",
  async (id, { rejectWithValue }) => {
    try {
      await customersAPI.delete(id);
      return id;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete customer"
      );
    }
  }
);

export const importCustomers = createAsyncThunk(
  "customer/importCustomers",
  async (data, { rejectWithValue }) => {
    try {
      const response = await customersAPI.bulkImport(data);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to import customers"
      );
    }
  }
);

// Initial State
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
  editingCustomer: null,
  filters: {
    hasPhone: false,
    hasAddress: false,
  },
};

// Slice
const customerSlice = createSlice({
  name: "customer",
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
      state.editingCustomer = null;
    },
    openEditModal: (state, action) => {
      state.isModalOpen = true;
      state.editingCustomer = action.payload;
    },
    closeModal: (state) => {
      state.isModalOpen = false;
      state.editingCustomer = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCustomers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCustomers.fulfilled, (state, action) => {
        state.loading = false;
        console.log("fetchCustomers fulfilled:", action.payload);
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
        console.log("Updated customer state:", {
          itemsCount: state.items.length,
          currentPage: state.currentPage,
          totalPages: state.totalPages,
          totalItems: state.totalItems,
        });
      })
      .addCase(fetchCustomers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createCustomer.fulfilled, (state) => {
        // Refresh the customer list to get updated pagination
        // The useEffect will automatically refetch with current parameters
        state.isModalOpen = false;
      })
      .addCase(updateCustomer.fulfilled, (state) => {
        // Refresh the customer list to get updated data
        // The useEffect will automatically refetch with current parameters
        state.isModalOpen = false;
      })
      .addCase(deleteCustomer.fulfilled, (state, action) => {
        state.items = state.items.filter((item) => item.id !== action.payload);
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
} = customerSlice.actions;

export default customerSlice.reducer;
