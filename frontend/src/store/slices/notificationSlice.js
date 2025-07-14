import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { notificationsAPI } from "../../services/api";

export const fetchNotifications = createAsyncThunk(
  "notifications/fetchAll",
  async (params = { page: 1, limit: 20 }, { rejectWithValue }) => {
    try {
      console.log("🔔 Fetching notifications with params:", params);
      const response = await notificationsAPI.getAll(params);
      console.log("🔔 API response:", response);
      console.log("🔔 Response data:", response.data);

      // Validate response structure
      if (!response.data) {
        console.error("🔔 Invalid response structure - no data property");
        throw new Error("Invalid response structure");
      }

      return response.data;
    } catch (error) {
      console.error("🔔 Failed to fetch notifications:", error);
      console.error("🔔 Error details:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });

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
      console.log("🔔 Marking notification as read:", id);
      const response = await notificationsAPI.markAsRead(id);
      console.log("🔔 Mark as read response:", response);
      return { id, notification: response.data };
    } catch (error) {
      console.warn("Failed to mark notification as read:", error);
      return rejectWithValue(id);
    }
  }
);

export const markAllAsRead = createAsyncThunk(
  "notifications/markAllAsRead",
  async (_, { rejectWithValue }) => {
    try {
      console.log("🔔 Marking all notifications as read");
      await notificationsAPI.markAllAsRead();
      return true;
    } catch (error) {
      console.warn("Failed to mark all notifications as read:", error);
      return rejectWithValue(false);
    }
  }
);

export const getUnreadCount = createAsyncThunk(
  "notifications/getUnreadCount",
  async (_, { rejectWithValue }) => {
    try {
      console.log("🔔 Getting unread count");
      const response = await notificationsAPI.getUnreadCount();
      console.log("🔔 Unread count response:", response);
      return response.data.count;
    } catch (error) {
      console.warn("Failed to get unread count:", error);
      return rejectWithValue(0);
    }
  }
);

export const clearAllNotifications = createAsyncThunk(
  "notifications/clearAll",
  async (_, { rejectWithValue }) => {
    try {
      console.log("🔔 Clearing all notifications");
      // Note: Backend doesn't have a bulk delete endpoint, so we'll handle this in the frontend
      // In a real implementation, you might want to add a backend endpoint for this
      return true;
    } catch (error) {
      console.warn("Failed to clear all notifications:", error);
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
        console.log("🔔 Redux: Fetch notifications pending");
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        console.log(
          "🔔 Redux: Notifications fulfilled with payload:",
          action.payload
        );
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

        console.log("🔔 Redux: Updated state:", {
          list: state.list,
          pagination: state.pagination,
        });
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        console.log("🔔 Redux: Fetch notifications rejected:", action.payload);
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
