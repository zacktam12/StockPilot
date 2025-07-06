import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  modals: {
    newProduct: false,
    newCategory: false,
    newSupplier: false,
    newCustomer: false,
    newSale: false,
    newPurchase: false,
  },
  loading: false,
  theme: 'light',
  toast: {
    message: '',
    type: '', // 'success' | 'error' | 'info'
    visible: false,
  },
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleModal: (state, action) => {
      const { modal, value } = action.payload;
      state.modals[modal] = value;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setTheme: (state, action) => {
      state.theme = action.payload;
    },
    showToast: (state, action) => {
      state.toast = {
        message: action.payload.message,
        type: action.payload.type || 'info',
        visible: true,
      };
    },
    hideToast: (state) => {
      state.toast = { message: '', type: '', visible: false };
    },
  }
});

export const { toggleModal, setLoading, setTheme, showToast, hideToast } = uiSlice.actions;
export default uiSlice.reducer;