// src/store/slices/debounceSlice.js
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  debounceTimers: {},
};

const debounceSlice = createSlice({
  name: "debounce",
  initialState,
  reducers: {
    setDebounceTimer: (state, action) => {
      const { key, timerId } = action.payload;
      // Clear existing timer if any
      if (state.debounceTimers[key]) {
        clearTimeout(state.debounceTimers[key]);
      }
      state.debounceTimers[key] = timerId;
    },
    clearDebounceTimer: (state, action) => {
      const { key } = action.payload;
      if (state.debounceTimers[key]) {
        clearTimeout(state.debounceTimers[key]);
        delete state.debounceTimers[key];
      }
    },
  },
});

export const { setDebounceTimer, clearDebounceTimer } = debounceSlice.actions;
export default debounceSlice.reducer;
