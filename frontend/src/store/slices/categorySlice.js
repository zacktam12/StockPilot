import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../services/api";

const applyFilters = (state) => {
  let filtered = [...state.items];

  if (state.filters.searchTerm) {
    filtered = filtered.filter(
      (category) =>
        category.name
          .toLowerCase()
          .includes(state.filters.searchTerm.toLowerCase()) ||
        category.description
          ?.toLowerCase()
          .includes(state.filters.searchTerm.toLowerCase())
    );
  }

  if (state.filters.options.hasDescription) {
    filtered = filtered.filter(
      (category) => category.description && category.description.trim() !== ""
    );
  }

  filtered.sort((a, b) => {
    const aVal = a[state.filters.sortField];
    const bVal = b[state.filters.sortField];
    if (aVal < bVal) return state.filters.sortOrder === "asc" ? -1 : 1;
    if (aVal > bVal) return state.filters.sortOrder === "asc" ? 1 : -1;
    return 0;
  });

  state.filteredItems = filtered;
};

// Async Thunks
export const fetchCategories = createAsyncThunk(
  "category/fetchAll",
  async (params = {}, { rejectWithValue }) => {
    try {
      const { sortBy = "name", order = "asc", ...filters } = params;
      const response = await api.get("/categories", {
        params: { sortBy, order, ...filters },
      });
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
      const res = await api.patch(`/categories/${id}`, data);
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

const initialState = {
  items: [],
  filteredItems: [],
  loading: false,
  error: null,
  modal: {
    isOpen: false,
    mode: "create",
    currentCategory: null,
    isLoading: false,
  },
  pagination: {
    currentPage: 1,
    itemsPerPage: 10,
    totalItems: 0,
  },
  filters: {
    searchTerm: "",
    sortField: "name",
    sortOrder: "asc",
    options: {
      hasDescription: false,
    },
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
      state.filters.searchTerm = action.payload;
      state.pagination.currentPage = 1;
      applyFilters(state);
    },
    setSort: (state, action) => {
      const { field } = action.payload;
      if (state.filters.sortField === field) {
        state.filters.sortOrder =
          state.filters.sortOrder === "asc" ? "desc" : "asc";
      } else {
        state.filters.sortField = field;
        state.filters.sortOrder = "asc";
      }
      applyFilters(state);
    },
    setSortField: (state, action) => {
      state.filters.sortField = action.payload;
      applyFilters(state);
    },
    setFilterOptions: (state, action) => {
      state.filters.options = { ...state.filters.options, ...action.payload };
      applyFilters(state);
    },
    toggleDescriptionFilter: (state) => {
      state.filters.options.hasDescription =
        !state.filters.options.hasDescription;
      applyFilters(state);
    },
    setCurrentPage: (state, action) => {
      state.pagination.currentPage = action.payload;
    },
    resetCategoryState: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCategories.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.data || action.payload;
        state.pagination.totalItems =
          action.payload.total || action.payload.length;
        applyFilters(state);
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
        state.items.unshift(action.payload);
        state.pagination.totalItems += 1;
        applyFilters(state);
        state.modal.isOpen = false;
      })
      .addCase(createCategory.rejected, (state, action) => {
        state.modal.isLoading = false;
        state.error = action.payload;
      })
      .addCase(updateCategory.pending, (state) => {
        state.modal.isLoading = true;
      })
      .addCase(updateCategory.fulfilled, (state, action) => {
        const index = state.items.findIndex(
          (item) => item.id === action.payload.id
        );
        if (index !== -1) {
          state.items[index] = action.payload;
        }
        applyFilters(state);
        state.modal.isLoading = false;
        state.modal.isOpen = false;
      })
      .addCase(updateCategory.rejected, (state, action) => {
        state.modal.isLoading = false;
        state.error = action.payload;
      })
      .addCase(deleteCategory.pending, (state, action) => {
        state.items = state.items.map((item) =>
          item.id === action.meta.arg ? { ...item, _deleting: true } : item
        );
      })
      .addCase(deleteCategory.fulfilled, (state, action) => {
        state.items = state.items.filter((item) => item.id !== action.payload);
        state.pagination.totalItems -= 1;
        applyFilters(state);
      })
      .addCase(deleteCategory.rejected, (state, action) => {
        state.items = state.items.map((item) =>
          item.id === action.meta.arg ? { ...item, _deleting: false } : item
        );
        state.error = action.payload;
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
  setCurrentPage,
  resetCategoryState,
} = categorySlice.actions;

export default categorySlice.reducer;
