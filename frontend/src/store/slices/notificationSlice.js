import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { notificationsAPI } from "../../services/api";

export const fetchNotifications = createAsyncThunk(
  "notifications/fetchAll",
  async (params = { page: 1, limit: 20 }, { rejectWithValue }) => {
    try {
      const response = await notificationsAPI.getAll(params);
      // Validate response structure
      if (!response.data) {
        throw new Error("Invalid response structure");
      }

      return response.data;
    } catch (error) {
      return rejectWithValue({
        data: [],
        currentPage: 1,
        totalPages: 1,
        totalItems: 0,
        limit: 20,
        error: error.message || "Failed to fetch notifications",
      });
    }
  }
);

export const markAsRead = createAsyncThunk(
  "notifications/markAsRead",
  async (id, { rejectWithValue }) => {
    try {
      const response = await notificationsAPI.markAsRead(id);
      return { id, notification: response.data };
    } catch (error) {
      return rejectWithValue(id);
    }
  }
);

export const markAllAsRead = createAsyncThunk(
  "notifications/markAllAsRead",
  async (_, { rejectWithValue }) => {
    try {
      await notificationsAPI.markAllAsRead();
      return true;
    } catch (error) {
      return rejectWithValue(false);
    }
  }
);

export const getUnreadCount = createAsyncThunk(
  "notifications/getUnreadCount",
  async (_, { rejectWithValue }) => {
    try {
      const response = await notificationsAPI.getUnreadCount();
      return response.data.count;
    } catch (error) {
      return rejectWithValue(0);
    }
  }
);

export const clearAllNotifications = createAsyncThunk(
  "notifications/clearAll",
  async (_, { rejectWithValue }) => {
    try {
      // Note: Backend doesn't have a bulk delete endpoint, so we'll handle this in the frontend
      // In a real implementation, you might want to add a backend endpoint for this
      return true;
    } catch (error) {
      return rejectWithValue(false);
    }
  }
);

const notificationSlice = createSlice({
  name: "notifications",
  initialState: {
    list: [],
    unreadCount: 0,
    loading: false,
    error: null,
    pagination: {
      currentPage: 1,
      totalPages: 1,
      totalItems: 0,
      limit: 20,
    },
  },
  reducers: {
    addNotification: (state, action) => {
      state.list.unshift(action.payload);
      state.unreadCount += 1;
    },
    clearNotifications: (state) => {
      state.list = [];
      state.unreadCount = 0;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotifications.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;

        // Ensure we have valid data
        const payload = action.payload || {};
        state.list = payload.data || [];
        state.pagination = {
          currentPage: payload.currentPage || 1,
          totalPages: payload.totalPages || 1,
          totalItems: payload.totalItems || 0,
          limit: payload.limit || 20,
        };
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.error || "Failed to fetch notifications";
        state.list = action.payload?.data || [];
        state.pagination = {
          currentPage: action.payload?.currentPage || 1,
          totalPages: action.payload?.totalPages || 1,
          totalItems: action.payload?.totalItems || 0,
          limit: action.payload?.limit || 20,
        };
      })
      .addCase(markAsRead.fulfilled, (state, action) => {
        const index = state.list.findIndex((n) => n.id === action.payload.id);
        if (index !== -1) {
          state.list[index].read = true;
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
      })
      .addCase(markAllAsRead.fulfilled, (state) => {
        state.list = state.list.map((n) => ({ ...n, read: true }));
        state.unreadCount = 0;
      })
      .addCase(clearAllNotifications.fulfilled, (state) => {
        state.list = [];
        state.unreadCount = 0;
        state.pagination = {
          currentPage: 1,
          totalPages: 1,
          totalItems: 0,
          limit: 20,
        };
      })
      .addCase(getUnreadCount.fulfilled, (state, action) => {
        state.unreadCount = action.payload;
      });
  },
});

export const { addNotification, clearNotifications, clearError } =
  notificationSlice.actions;
export default notificationSlice.reducer;
