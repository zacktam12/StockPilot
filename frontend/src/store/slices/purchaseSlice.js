// ...rest of your imports and code

const purchaseSlice = createSlice({
  name: "purchases",
  initialState: {
    purchases: [],
    currentPurchase: null,
    receipt: null,
    loading: false,
    error: null,
    sortOptions: {
      field: "created_at",
      order: "desc",
    },
    pagination: {
      currentPage: 1,
      totalPages: 1,
      totalItems: 0,
    },
    isModalOpen: false, // <-- Added property
  },
  reducers: {
    setSortOptions: (state, action) => {
      state.sortOptions = action.payload;
    },
    setCurrentPage: (state, action) => {
      state.pagination.currentPage = action.payload;
    },
    clearCurrentPurchase: (state) => {
      state.currentPurchase = null;
    },
    clearReceipt: (state) => {
      state.receipt = null;
    },
    clearError: (state) => {
      state.error = null;
    },
    openModal: (state) => {
      state.isModalOpen = true;
    },
    closeModal: (state) => {
      state.isModalOpen = false;
    },
  },
  extraReducers: (builder) => {
    // ...rest of your extraReducers
    builder
      // Fetch Purchases
      .addCase(fetchPurchases.pending, (state) => {
        state.loading = true;
        state.error = null;
      });
    // ...rest of your cases
  },
});

// Export Actions
export const {
  setSortOptions,
  setCurrentPage,
  clearCurrentPurchase,
  clearReceipt,
  clearError,
  openModal,
  closeModal, // <-- Export closeModal
} = purchaseSlice.actions;

// Export Reducer
export default purchaseSlice.reducer;
