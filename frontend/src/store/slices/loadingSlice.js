// src/store/slices/loadingSlice.js
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  isLoading: false,
  loadingQueue: [],
  loadingMessage: null,
};

export const loadingSlice = createSlice({
  name: "loading",
  initialState,
  reducers: {
    startLoading: (state, action) => {
      state.loadingQueue.push(action.payload?.message || null);
      state.isLoading = true;
      state.loadingMessage = action.payload?.message || null;
    },
    stopLoading: (state) => {
      state.loadingQueue.pop();
      state.isLoading = state.loadingQueue.length > 0;
      state.loadingMessage =
        state.loadingQueue.length > 0
          ? state.loadingQueue[state.loadingQueue.length - 1]
          : null;
    },
    resetLoading: () => initialState,
  },
});

export const { startLoading, stopLoading, resetLoading } = loadingSlice.actions;
export default loadingSlice.reducer;
