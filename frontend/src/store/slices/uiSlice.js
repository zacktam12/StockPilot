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
  theme: 'light'
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
    }
  }
});

export const { toggleModal, setLoading, setTheme } = uiSlice.actions;
export default uiSlice.reducer;