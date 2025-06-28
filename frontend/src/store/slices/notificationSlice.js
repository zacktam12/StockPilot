import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { API_URL } from "../../config";

export const fetchNotifications = createAsyncThunk(
  "notifications/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const res = await fetch(`${API_URL}/notifications`);
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      const data = await res.json();
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.warn("Failed to fetch notifications:", error);
      return rejectWithValue([]);
    }
  }
);

export const markAsRead = createAsyncThunk(
  "notifications/markAsRead",
  async (id, { rejectWithValue }) => {
    try {
      const res = await fetch(`${API_URL}/notifications/mark-read/${id}`, {
        method: "POST",
      });
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      return id;
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
      const res = await fetch(`${API_URL}/notifications/mark-all-read`, {
        method: "POST",
      });
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      return true;
    } catch (error) {
      console.warn("Failed to mark all notifications as read:", error);
      return rejectWithValue(false);
    }
  }
);

const notificationSlice = createSlice({
  name: "notifications",
  initialState: {
    list: [],
    unreadCount: 0,
  },
  reducers: {
    addNotification: (state, action) => {
      state.list.unshift(action.payload);
      state.unreadCount += 1;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        const notifications = Array.isArray(action.payload)
          ? action.payload
          : [];
        state.list = notifications;
        state.unreadCount = notifications.filter((n) => !n.read).length;
      })
      .addCase(fetchNotifications.rejected, (state) => {
        state.list = [];
        state.unreadCount = 0;
      })
      .addCase(markAsRead.fulfilled, (state, action) => {
        const index = state.list.findIndex((n) => n.id === action.payload);
        if (index !== -1) {
          state.list[index].read = true;
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
      })
      .addCase(markAllAsRead.fulfilled, (state) => {
        state.list = state.list.map((n) => ({ ...n, read: true }));
        state.unreadCount = 0;
      });
  },
});

export const { addNotification } = notificationSlice.actions;
export default notificationSlice.reducer;
