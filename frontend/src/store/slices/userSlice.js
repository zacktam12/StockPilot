import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { usersAPI } from "../../services/api";
import { showSuccess, showError, showWarning } from "../../services/notificationService";

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
    itemsPerPage: 10,
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
    setItemsPerPage: (state, action) => {
      state.itemsPerPage = action.payload;
      state.currentPage = 1; // Reset to first page when changing page size
      state.totalPages = Math.ceil(state.totalItems / state.itemsPerPage);
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
            state.currentPage = action.payload.pagination.currentPage || action.payload.pagination.page;
            state.totalPages = action.payload.pagination.totalPages || action.payload.pagination.pages;
            state.totalItems = action.payload.pagination.totalItems || action.payload.pagination.total;
            state.itemsPerPage = action.payload.pagination.itemsPerPage || action.payload.pagination.limit;
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
          
          // Show success notification
          const user = action.payload.data;
          showSuccess(
            'User Created Successfully',
            `"${user.firstName} ${user.lastName}" has been added to your users.`,
            4000
          );
        } else {
          state.error = "Failed to create user";
          showError(
            'User Creation Failed',
            'Unable to create the user. Please try again.',
            5000
          );
        }
      })
      .addCase(createUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        showError(
          'User Creation Failed',
          action.payload || 'An unexpected error occurred while creating the user.',
          5000
        );
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
          
          // Show success notification
          showSuccess(
            'User Updated Successfully',
            `"${updatedUser.firstName} ${updatedUser.lastName}" has been updated.`,
            4000
          );
        } else {
          state.error = "Failed to update user";
          showError(
            'User Update Failed',
            'Unable to update the user. Please try again.',
            5000
          );
        }
      })
      .addCase(updateUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        showError(
          'User Update Failed',
          action.payload || 'An unexpected error occurred while updating the user.',
          5000
        );
      })

      // Delete User
      .addCase(deleteUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.loading = false;
        
        // Update the user's status to Deactivated instead of removing them
        const deactivatedData = action.payload?.data;
        if (deactivatedData) {
          state.users = state.users.map((user) =>
            user.id === deactivatedData.id 
              ? { ...user, status: 'Deactivated', deactivatedAt: deactivatedData.deactivatedAt, deactivatedBy: deactivatedData.deactivatedBy }
              : user
          );
        }
        
        // Show success notification
        showSuccess(
          'User Deactivated Successfully',
          'The user has been deactivated and will remain visible with "Deactivated" status.',
          4000
        );
      })
      .addCase(deleteUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        showError(
          'User Deletion Failed',
          action.payload || 'Unable to delete the user. Please try again.',
          5000
        );
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
          
          // Show success notification
          showSuccess(
            'Users Imported Successfully',
            `${action.payload.data?.length || 0} user(s) have been imported from CSV.`,
            4000
          );
        } else {
          state.error = "Failed to import users";
          showError(
            'Import Failed',
            'Unable to import users from CSV. Please check the file format and try again.',
            5000
          );
        }
      })
      .addCase(importUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        showError(
          'Import Failed',
          action.payload || 'An unexpected error occurred while importing users.',
          5000
        );
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
  setItemsPerPage,
  setSortField,
} = userSlice.actions;

// Export reducer
export default userSlice.reducer;
