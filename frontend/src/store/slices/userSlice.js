import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { usersAPI } from "../../services/api";

// Async thunks with loading messages
export const fetchUsers = createAsyncThunk(
  "users/fetchUsers",
  async (
    {
      page = 1,
      limit = 5,
      search = "",
      status = "",
      roleId = "",
      sortField = "",
      sortOrder = "",
    },
    { rejectWithValue }
  ) => {
    try {
      const params = {
        page,
        limit,
        ...(search && { search }),
        ...(status && { status }),
        ...(roleId && { roleId }),
        ...(sortField && { sortField }),
        ...(sortOrder && { sortOrder }),
      };

      const response = await usersAPI.getAll(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch users"
      );
    }
  },
  {
    meta: {
      loadingMessage: "Loading users...",
    },
  }
);

export const createUser = createAsyncThunk(
  "users/createUser",
  async (userData, { rejectWithValue }) => {
    try {
      const response = await usersAPI.create(userData);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to create user"
      );
    }
  },
  {
    meta: {
      loadingMessage: "Creating user...",
    },
  }
);

export const updateUser = createAsyncThunk(
  "users/updateUser",
  async ({ id, userData }, { rejectWithValue }) => {
    try {
      const response = await usersAPI.update(id, userData);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update user"
      );
    }
  },
  {
    meta: {
      loadingMessage: "Updating user...",
    },
  }
);

export const deleteUser = createAsyncThunk(
  "users/deleteUser",
  async (userId, { rejectWithValue }) => {
    try {
      await usersAPI.delete(userId);
      return userId;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete user"
      );
    }
  },
  {
    meta: {
      loadingMessage: "Deleting user...",
    },
  }
);

export const importUsers = createAsyncThunk(
  "users/importUsers",
  async (userData, { rejectWithValue }) => {
    try {
      const response = await usersAPI.import(userData);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to import users"
      );
    }
  },
  {
    meta: {
      loadingMessage: "Importing users...",
    },
  }
);

// Slice
const userSlice = createSlice({
  name: "users",
  initialState: {
    users: [],
    loading: false,
    error: null,
    currentUser: null,

    // Pagination
    currentPage: 1,
    itemsPerPage: 5,
    totalPages: 1,
    totalItems: 0,

    // Filters
    searchTerm: "",
    statusFilter: "",
    roleFilter: "",

    // Sorting
    sortField: "createdAt",
    sortOrder: "desc",
  },
  reducers: {
    setSearchTerm: (state, action) => {
      state.searchTerm = action.payload;
      state.currentPage = 1;
    },
    setStatusFilter: (state, action) => {
      state.statusFilter = action.payload;
      state.currentPage = 1;
    },
    setRoleFilter: (state, action) => {
      state.roleFilter = action.payload;
      state.currentPage = 1;
    },
    setCurrentPage: (state, action) => {
      state.currentPage = action.payload;
    },
    setSortField: (state, action) => {
      if (state.sortField === action.payload) {
        state.sortOrder = state.sortOrder === "asc" ? "desc" : "asc";
      } else {
        state.sortField = action.payload;
        state.sortOrder = "asc";
      }
    },
    setCurrentUser: (state, action) => {
      state.currentUser = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Users
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.success) {
          state.users = action.payload.data || [];
          if (action.payload.pagination) {
            state.currentPage = action.payload.pagination.page;
            state.totalPages = action.payload.pagination.pages;
            state.totalItems = action.payload.pagination.total;
            state.itemsPerPage = action.payload.pagination.limit;
          }
        } else {
          state.error = "Failed to fetch users";
        }
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Create User
      .addCase(createUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createUser.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.success) {
          state.users.unshift(action.payload.data);
        } else {
          state.error = "Failed to create user";
        }
      })
      .addCase(createUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Update User
      .addCase(updateUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.success) {
          const updatedUser = action.payload.data;
          state.users = state.users.map((user) =>
            user.id === updatedUser.id ? updatedUser : user
          );
        } else {
          state.error = "Failed to update user";
        }
      })
      .addCase(updateUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Delete User
      .addCase(deleteUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.loading = false;
        state.users = state.users.filter((user) => user.id !== action.payload);
      })
      .addCase(deleteUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Import Users
      .addCase(importUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(importUsers.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.success) {
          state.users = action.payload.data || [];
        } else {
          state.error = "Failed to import users";
        }
      })
      .addCase(importUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

// Export actions
export const {
  setCurrentUser,
  clearError,
  setSearchTerm,
  setStatusFilter,
  setRoleFilter,
  setCurrentPage,
  setSortField,
} = userSlice.actions;

// Export reducer
export default userSlice.reducer;
