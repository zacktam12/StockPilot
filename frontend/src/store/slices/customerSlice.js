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
      const response = await customersAPI.importFromCSV(data);
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
  isModalOpen: false,
  editingCustomer: null,
  pagination: {
    page: 1,
    limit: 5,
    total: 0,
    pages: 1,
  },
  filters: {
    searchTerm: "",
    sortField: "createdAt",
    sortOrder: "desc",
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
      state.filters.searchTerm = action.payload;
      state.pagination.page = 1;
    },
    setSort: (state, action) => {
      if (state.filters.sortField === action.payload.field) {
        state.filters.sortOrder =
          state.filters.sortOrder === "asc" ? "desc" : "asc";
      } else {
        state.filters.sortField = action.payload.field;
        state.filters.sortOrder = "asc";
      }
    },
    setFilter: (state, action) => {
      state.filters[action.payload.key] = action.payload.value;
      state.pagination.page = 1;
    },
    setCurrentPage: (state, action) => {
      state.pagination.page = action.payload;
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
        state.items = action.payload.data;
        state.pagination = {
          ...state.pagination,
          total: action.payload.total,
          pages: action.payload.pages,
        };
      })
      .addCase(fetchCustomers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createCustomer.fulfilled, (state, action) => {
        state.items.unshift(action.payload);
        state.isModalOpen = false;
      })
      .addCase(updateCustomer.fulfilled, (state, action) => {
        const index = state.items.findIndex(
          (item) => item.id === action.payload.id
        );
        if (index !== -1) {
          state.items[index] = action.payload;
        }
        state.isModalOpen = false;
      })
      .addCase(deleteCustomer.fulfilled, (state, action) => {
        state.items = state.items.filter((item) => item.id !== action.payload);
      });
  },
});

export const {
  setSearchTerm,
  setSort,
  setFilter,
  setCurrentPage,
  openCreateModal,
  openEditModal,
  closeModal,
} = customerSlice.actions;

export default customerSlice.reducer;
