import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

export const fetchNotifications = createAsyncThunk(
  "notifications/fetchAll",
  async () => {
    const res = await fetch("http://localhost:5000/api/notifications");
    const data = await res.json();
    return data;
  }
);

export const markAsRead = createAsyncThunk(
  "notifications/markAsRead",
  async (id) => {
    await fetch(`http://localhost:5000/api/notifications/mark-read/${id}`, {
      method: "POST",
    });
    return id;
  }
);

export const markAllAsRead = createAsyncThunk(
  "notifications/markAllAsRead",
  async () => {
    await fetch("http://localhost:5000/api/notifications/mark-all-read", {
      method: "POST",
    });
    return;
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
        state.list = action.payload;
        state.unreadCount = action.payload.filter((n) => !n.read).length;
      })
      .addCase(markAsRead.fulfilled, (state, action) => {
        const index = state.list.findIndex((n) => n.id === action.payload);
        if (index !== -1) {
          state.list[index].read = true;
          state.unreadCount -= 1;
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
