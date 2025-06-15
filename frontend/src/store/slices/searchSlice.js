// src/store/slices/searchSlice.js
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  searchTerm: "",
  searchResults: [],
  loading: false,
};

const searchSlice = createSlice({
  name: "search",
  initialState,
  reducers: {
    setSearchTerm: (state, action) => {
      state.searchTerm = action.payload;
    },
    setSearchResults: (state, action) => {
      state.searchResults = action.payload;
      state.loading = false;
    },
    setLoading: (state) => {
      state.loading = true;
    },
  },
});

// Debounced action creator
export const debouncedSearch = (term) => ({
  type: "search/setSearchTerm",
  payload: term,
  meta: {
    debounce: {
      key: "search", // Unique identifier for this debounce
      delay: 500, // Debounce delay in ms
    },
  },
});

export const { setSearchResults, setLoading } = searchSlice.actions;
export default searchSlice.reducer;
