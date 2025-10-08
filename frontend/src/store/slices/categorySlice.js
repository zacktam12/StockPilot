import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../services/api";
import { showSuccess, showError, showWarning } from "../../services/notificationService";

// Helper function to filter and sort items
const getFilteredItems = (items, searchTerm, sortField, sortOrder, filters) => {
  let filtered = [...items];

  // Apply search filter
  if (searchTerm) {
    filtered = filtered.filter((item) =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }

  // Apply description filter
  if (filters.options.hasDescription) {
    filtered = filtered.filter((item) => item.description && item.description.trim() !== "");
  }

  // Apply date range filter
  if (filters.dateRange.from && filters.dateRange.to) {
    const fromDate = new Date(filters.dateRange.from);
    const toDate = new Date(filters.dateRange.to);
    filtered = filtered.filter((item) => {
      const itemDate = new Date(item.createdAt);
      return itemDate >= fromDate && itemDate <= toDate;
    });
  }

  // Apply sorting
  filtered.sort((a, b) => {
    let aValue = a[sortField];
    let bValue = b[sortField];

    // Handle date sorting
    if (sortField === "createdAt" || sortField === "created_at") {
      aValue = new Date(a.createdAt || a.created_at);
      bValue = new Date(b.createdAt || b.created_at);
    }

    // Handle string sorting
    if (typeof aValue === "string") {
      aValue = aValue.toLowerCase();
      bValue = bValue.toLowerCase();
    }

    if (sortOrder === "asc") {
      return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
    } else {
      return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
    }
  });

  return filtered;
};

// Async Thunks
export const fetchCategories = createAsyncThunk(
  "category/fetchAll",
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await api.get("/categories", { params });
      return response.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to fetch categories"
      );
    }
  }
);

export const createCategory = createAsyncThunk(
  "category/create",
  async (data, { rejectWithValue }) => {
    try {
      const res = await api.post("/categories", data);
      return res.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to create category"
      );
    }
  }
);

export const updateCategory = createAsyncThunk(
  "category/update",
  async ({ id, ...data }, { rejectWithValue }) => {
    try {
      const res = await api.put(`/categories/${id}`, data);
      return res.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to update category"
      );
    }
  }
);

export const deleteCategory = createAsyncThunk(
  "category/delete",
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/categories/${id}`);
      return id;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to delete category"
      );
    }
  }
);

export const importCategories = createAsyncThunk(
  "category/import",
  async (categories, { rejectWithValue }) => {
    try {
      const response = await api.post("/categories/bulk", { categories });
      return response.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to import categories"
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
  itemsPerPage: 5,
  searchTerm: "",
  sortField: "name",
  sortOrder: "asc",
  selectedItems: [],
  selectAll: false,
  modal: {
    isOpen: false,
    mode: "create",
    currentCategory: null,
    isLoading: false,
  },
  filters: {
    options: {
      hasDescription: false,
    },
    dateRange: { from: "", to: "" },
  },
};

const categorySlice = createSlice({
  name: "category",
  initialState,
  reducers: {
    openCreateModal: (state) => {
      state.modal = {
        isOpen: true,
        mode: "create",
        currentCategory: null,
        isLoading: false,
      };
    },
    openEditModal: (state, action) => {
      state.modal = {
        isOpen: true,
        mode: "edit",
        currentCategory: action.payload,
        isLoading: false,
      };
    },
    openCategoryModal: (state, action) => {
      state.modal = {
        isOpen: true,
        mode: action.payload ? "edit" : "create",
        currentCategory: action.payload || null,
        isLoading: false,
      };
    },
    closeModal: (state) => {
      state.modal.isOpen = false;
    },
    setSearchTerm: (state, action) => {
      state.searchTerm = action.payload;
      state.currentPage = 1; // Reset to first page when searching
      state.filteredItems = getFilteredItems(
        state.items,
        state.searchTerm,
        state.sortField,
        state.sortOrder,
        state.filters
      );
    },
    setSort: (state, action) => {
      const { field } = action.payload;
      if (state.sortField === field) {
        state.sortOrder = state.sortOrder === "asc" ? "desc" : "asc";
      } else {
        state.sortField = field;
        state.sortOrder = "asc";
      }
      // Reset to first page when sorting changes
      state.currentPage = 1;
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
      state.filteredItems = getFilteredItems(
        state.items,
        state.searchTerm,
        state.sortField,
        state.sortOrder,
        state.filters
      );
    },
    setFilterOptions: (state, action) => {
      state.filters.options = { ...state.filters.options, ...action.payload };
      state.filteredItems = getFilteredItems(
        state.items,
        state.searchTerm,
        state.sortField,
        state.sortOrder,
        state.filters
      );
    },
    toggleDescriptionFilter: (state) => {
      state.filters.options.hasDescription =
        !state.filters.options.hasDescription;
    },
    setDateRangeFilter: (state, action) => {
      state.filters.dateRange = action.payload;
      state.currentPage = 1;
      state.filteredItems = getFilteredItems(
        state.items,
        state.searchTerm,
        state.sortField,
        state.sortOrder,
        state.filters
      );
    },
    clearDateRangeFilter: (state) => {
      state.filters.dateRange = { from: "", to: "" };
      state.currentPage = 1;
      state.filteredItems = getFilteredItems(
        state.items,
        state.searchTerm,
        state.sortField,
        state.sortOrder,
        state.filters
      );
    },
    setCurrentPage: (state, action) => {
      state.currentPage = action.payload;
    },
    setItemsPerPage: (state, action) => {
      state.itemsPerPage = action.payload;
      state.currentPage = 1; // Reset to first page when changing page size
      // Recalculate totalPages based on totalItems, not items.length
      state.totalPages = Math.ceil(state.totalItems / state.itemsPerPage);
    },
    resetCategoryState: () => initialState,
    // Selection functionality
    toggleItemSelection: (state, action) => {
      const itemId = action.payload;
      const index = state.selectedItems.indexOf(itemId);
      if (index > -1) {
        state.selectedItems.splice(index, 1);
      } else {
        state.selectedItems.push(itemId);
      }
      // Update selectAll based on current selection
      state.selectAll = state.selectedItems.length === state.filteredItems.length && state.filteredItems.length > 0;
    },
    toggleSelectAll: (state) => {
      if (state.selectAll) {
        state.selectedItems = [];
      } else {
        state.selectedItems = state.filteredItems.map(item => item.id);
      }
      state.selectAll = !state.selectAll;
    },
    clearSelection: (state) => {
      state.selectedItems = [];
      state.selectAll = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCategories.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.loading = false;
        // Handle both paginated and non-paginated responses
        if (action.payload && action.payload.success && action.payload.data) {
          // Server-side paginated response
          state.items = action.payload.data;
          if (action.payload.pagination) {
            state.totalItems = action.payload.pagination.totalItems || 0;
            state.totalPages = action.payload.pagination.totalPages || 1;
            state.currentPage = action.payload.pagination.currentPage || 1;
            state.itemsPerPage = action.payload.pagination.itemsPerPage || 5;
          } else {
            // Fallback for non-paginated responses
            state.totalItems = state.items.length;
            state.totalPages = Math.ceil(
              state.items.length / state.itemsPerPage
            );
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
        
        // Update filtered items
        state.filteredItems = getFilteredItems(
          state.items,
          state.searchTerm,
          state.sortField,
          state.sortOrder,
          state.filters
        );
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createCategory.pending, (state) => {
        state.modal.isLoading = true;
      })
      .addCase(createCategory.fulfilled, (state, action) => {
        state.modal.isLoading = false;
        // Handle the response structure from backend
        const categoryData = action.payload.data || action.payload;

        // Add the new category to the beginning of the items array
        state.items.unshift(categoryData);

        // Update pagination info for client-side pagination
        state.totalItems = state.items.length;
        state.totalPages = Math.ceil(state.totalItems / state.itemsPerPage);

        // Reset to first page to show the new category
        state.currentPage = 1;

        // Update filtered items
        state.filteredItems = getFilteredItems(
          state.items,
          state.searchTerm,
          state.sortField,
          state.sortOrder,
          state.filters
        );

        state.modal.isOpen = false;
        
        // Show success notification
        showSuccess(
          'Category Created Successfully',
          `"${categoryData.name}" has been added to your categories.`,
          4000
        );
      })
      .addCase(createCategory.rejected, (state, action) => {
        state.modal.isLoading = false;
        state.error = action.payload;
        showError(
          'Category Creation Failed',
          action.payload || 'Unable to create the category. Please try again.',
          5000
        );
      })
      .addCase(updateCategory.pending, (state) => {
        state.modal.isLoading = true;
      })
      .addCase(updateCategory.fulfilled, (state, action) => {
        // Handle the response structure from backend
        const categoryData = action.payload.data || action.payload;
        const index = state.items.findIndex(
          (item) => item.id === categoryData.id
        );
        if (index !== -1) {
          state.items[index] = categoryData;
        }
        
        // Update filtered items
        state.filteredItems = getFilteredItems(
          state.items,
          state.searchTerm,
          state.sortField,
          state.sortOrder,
          state.filters
        );
        
        state.modal.isLoading = false;
        state.modal.isOpen = false;
        
        // Show success notification
        showSuccess(
          'Category Updated Successfully',
          `"${categoryData.name}" has been updated.`,
          4000
        );
      })
      .addCase(updateCategory.rejected, (state, action) => {
        state.modal.isLoading = false;
        state.error = action.payload;
        showError(
          'Category Update Failed',
          action.payload || 'Unable to update the category. Please try again.',
          5000
        );
      })
      .addCase(deleteCategory.pending, (state, action) => {
        state.items = state.items.map((item) =>
          item.id === action.meta.arg ? { ...item, _deleting: true } : item
        );
      })
      .addCase(deleteCategory.fulfilled, (state, action) => {
        state.items = state.items.filter((item) => item.id !== action.payload);

        // Update pagination info for client-side pagination
        state.totalItems = state.items.length;
        state.totalPages = Math.ceil(state.totalItems / state.itemsPerPage);

        // Adjust current page if needed
        if (state.currentPage > state.totalPages && state.totalPages > 0) {
          state.currentPage = state.totalPages;
        }

        // Update filtered items
        state.filteredItems = getFilteredItems(
          state.items,
          state.searchTerm,
          state.sortField,
          state.sortOrder,
          state.filters
        );

        // Trigger dashboard refresh after category deletion
        // We'll dispatch this from the component instead to avoid circular imports
        
        // Show success notification
        showSuccess(
          'Category Deleted Successfully',
          'The category has been removed from your categories.',
          4000
        );
      })
      .addCase(deleteCategory.rejected, (state, action) => {
        state.items = state.items.map((item) =>
          item.id === action.meta.arg ? { ...item, _deleting: false } : item
        );
        state.error = action.payload;
        showError(
          'Category Deletion Failed',
          action.payload || 'Unable to delete the category. Please try again.',
          5000
        );
      })
      .addCase(importCategories.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(importCategories.fulfilled, (state, action) => {
        state.loading = false;
        // Handle the response structure from backend
        const newCategories = action.payload.data || action.payload || [];
        
        // Add the new categories to the beginning of the items array
        state.items.unshift(...newCategories);

        // Update pagination info for client-side pagination
        state.totalItems = state.items.length;
        state.totalPages = Math.ceil(state.totalItems / state.itemsPerPage);

        // Reset to first page to show the new categories
        state.currentPage = 1;

        // Update filtered items
        state.filteredItems = getFilteredItems(
          state.items,
          state.searchTerm,
          state.sortField,
          state.sortOrder,
          state.filters
        );
        
        // Show success notification
        showSuccess(
          'Categories Imported Successfully',
          `${newCategories.length} categor${newCategories.length === 1 ? 'y' : 'ies'} imported from CSV.`,
          4000
        );
      })
      .addCase(importCategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        showError(
          'Category Import Failed',
          action.payload || 'Unable to import categories. Please check the file format and try again.',
          5000
        );
      });
  },
});

export const {
  openCreateModal,
  openEditModal,
  openCategoryModal,
  closeModal,
  setSearchTerm,
  setSort,
  setSortField,
  setFilterOptions,
  toggleDescriptionFilter,
  setDateRangeFilter,
  clearDateRangeFilter,
  setCurrentPage,
  setItemsPerPage,
  resetCategoryState,
  toggleItemSelection,
  toggleSelectAll,
  clearSelection,
} = categorySlice.actions;

export default categorySlice.reducer;
