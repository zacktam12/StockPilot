// src/store/slices/customerSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { customersAPI } from "../../services/api";
import { showSuccess, showError, showWarning } from "../../services/notificationService";

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

export const fetchCustomerById = createAsyncThunk(
  "customer/fetchCustomerById",
  async (id, { rejectWithValue }) => {
    try {
      const response = await customersAPI.getById(id);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch customer"
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
  selectedCustomer: null,
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
  isDrawerOpen: false,
  editingCustomer: null,
  selectedItems: [],
  selectAll: false,
  filters: {
    searchTerm: "",
    sortField: "createdAt",
    sortOrder: "desc",
    hasPhone: false,
    hasAddress: false,
  },
  pagination: {
    page: 1,
    pages: 1,
    limit: 5,
    total: 0,
  },
};

// Slice
const customerSlice = createSlice({
  name: "customer",
  initialState,
  reducers: {
    setSearchTerm: (state, action) => {
      state.searchTerm = action.payload;
      state.filters.searchTerm = action.payload;
      state.currentPage = 1; // Reset to first page when searching
      state.pagination.page = 1;
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
      state.pagination.page = 1;
    },
    setSort: (state, action) => {
      const { field, order } = action.payload;
      state.sortField = field;
      state.sortOrder = order || "asc";
      state.filters.sortField = field;
      state.filters.sortOrder = order || "asc";
      // Reset to first page when sorting changes
      state.currentPage = 1;
      state.pagination.page = 1;
    },
    setFilter: (state, action) => {
      state.filters[action.payload.key] = action.payload.value;
      state.currentPage = 1;
      state.pagination.page = 1;
    },
    setCurrentPage: (state, action) => {
      state.currentPage = action.payload;
      state.pagination.page = action.payload;
    },
    setItemsPerPage: (state, action) => {
      state.itemsPerPage = action.payload;
      state.currentPage = 1; // Reset to first page when changing page size
      state.pagination.page = 1;
      state.pagination.limit = action.payload;
      // Recalculate totalPages based on totalItems, not items.length
      state.totalPages = Math.ceil(state.totalItems / action.payload);
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
    openCreateDrawer: (state) => {
      state.isDrawerOpen = true;
      state.editingCustomer = null;
    },
    openEditDrawer: (state, action) => {
      state.isDrawerOpen = true;
      state.editingCustomer = action.payload;
    },
    closeDrawer: (state) => {
      state.isDrawerOpen = false;
      state.editingCustomer = null;
    },
    setSelectedItems: (state, action) => {
      state.selectedItems = action.payload;
    },
    toggleSelectedItem: (state, action) => {
      const itemId = action.payload;
      if (state.selectedItems.includes(itemId)) {
        state.selectedItems = state.selectedItems.filter(id => id !== itemId);
      } else {
        state.selectedItems.push(itemId);
      }
    },
    clearSelectedItems: (state) => {
      state.selectedItems = [];
    },
    toggleItemSelection: (state, action) => {
      const itemId = action.payload;
      if (state.selectedItems.includes(itemId)) {
        state.selectedItems = state.selectedItems.filter(id => id !== itemId);
      } else {
        state.selectedItems.push(itemId);
      }
    },
    toggleSelectAll: (state) => {
      if (state.selectedItems.length === state.items.length) {
        state.selectedItems = [];
        state.selectAll = false;
      } else {
        state.selectedItems = state.items.map(item => item.id);
        state.selectAll = true;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCustomers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCustomerById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCustomerById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedCustomer = action.payload.data || action.payload;
      })
      .addCase(fetchCustomerById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchCustomers.fulfilled, (state, action) => {
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
            // Update pagination object
            state.pagination = {
              page: state.currentPage,
              pages: state.totalPages,
              limit: state.itemsPerPage,
              total: state.totalItems,
            };
          } else {
            // Fallback for flattened response structure
            state.totalItems = action.payload.total || 0;
            state.totalPages = action.payload.pages || 1;
            state.currentPage = action.payload.page || 1;
            state.itemsPerPage = 5;
            
            // Update pagination object
            state.pagination = {
              page: state.currentPage,
              pages: state.totalPages,
              limit: state.itemsPerPage,
              total: state.totalItems,
            };
          }
        } else if (Array.isArray(action.payload)) {
          // Non-paginated response or direct array
          state.items = action.payload;
          state.totalItems = state.items.length;
          state.totalPages = Math.ceil(state.items.length / state.itemsPerPage);
          
          // Update pagination object
          state.pagination = {
            page: state.currentPage,
            pages: state.totalPages,
            limit: state.itemsPerPage,
            total: state.totalItems,
          };
        } else {
          // Fallback
          state.items = [];
          state.totalItems = 0;
          state.totalPages = 1;
          
          // Update pagination object
          state.pagination = {
            page: 1,
            pages: 1,
            limit: 5,
            total: 0,
          };
        }
      })
      .addCase(fetchCustomers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createCustomer.fulfilled, (state, action) => {
        // Refresh the customer list to get updated pagination
        // The useEffect will automatically refetch with current parameters
        state.isModalOpen = false;
        state.isDrawerOpen = false;
        
        // Show success notification
        const customer = action.payload.data || action.payload;
        showSuccess(
          'Customer Created Successfully',
          `"${customer.name || customer.firstName + ' ' + customer.lastName}" has been added to your customers.`,
          4000
        );
      })
      .addCase(createCustomer.rejected, (state, action) => {
        showError(
          'Customer Creation Failed',
          action.payload || 'Unable to create the customer. Please try again.',
          5000
        );
      })
      .addCase(updateCustomer.fulfilled, (state, action) => {
        // Update selectedCustomer if it matches the updated customer
        const updatedCustomer = action.payload.data || action.payload;
        if (state.selectedCustomer && state.selectedCustomer.id === updatedCustomer.id) {
          state.selectedCustomer = updatedCustomer;
        }
        // Refresh the customer list to get updated data
        // The useEffect will automatically refetch with current parameters
        state.isModalOpen = false;
        state.isDrawerOpen = false;
        
        // Show success notification
        showSuccess(
          'Customer Updated Successfully',
          `"${updatedCustomer.name || updatedCustomer.firstName + ' ' + updatedCustomer.lastName}" has been updated.`,
          4000
        );
      })
      .addCase(updateCustomer.rejected, (state, action) => {
        showError(
          'Customer Update Failed',
          action.payload || 'Unable to update the customer. Please try again.',
          5000
        );
      })
      .addCase(deleteCustomer.fulfilled, (state, action) => {
        state.items = state.items.filter((item) => item.id !== action.payload);
        
        // Show success notification
        showSuccess(
          'Customer Deleted Successfully',
          'The customer has been removed from your customer list.',
          4000
        );
      })
      .addCase(deleteCustomer.rejected, (state, action) => {
        showError(
          'Customer Deletion Failed',
          action.payload || 'Unable to delete the customer. Please try again.',
          5000
        );
      });
  },
});

export const {
  setSearchTerm,
  setSortField,
  setSort,
  setFilter,
  setCurrentPage,
  setItemsPerPage,
  openCreateModal,
  openEditModal,
  closeModal,
  openCreateDrawer,
  openEditDrawer,
  closeDrawer,
  setSelectedItems,
  toggleSelectedItem,
  clearSelectedItems,
  toggleItemSelection,
  toggleSelectAll,
} = customerSlice.actions;

export default customerSlice.reducer;
