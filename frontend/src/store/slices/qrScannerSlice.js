// src/store/slices/qrScannerSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../services/api";

// Async thunk: verify scanned QR data (optional — backend validation)
export const verifyQRCode = createAsyncThunk(
  "qrScanner/verifyQRCode",
  async (scannedData, { rejectWithValue }) => {
    try {
      const response = await api.post("/qr/verify", { data: scannedData });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Invalid or unrecognized QR code"
      );
    }
  },
  {
    meta: {
      loadingMessage: "Verifying QR code...",
      loadingType: "inline", // Customize for your app
    },
  }
);

// Initial State
const initialState = {
  lastScannedData: null,
  verificationResult: null,
  error: null,
  scanning: false,
  verifying: false,
  history: [], // Optional: store past scans
};

const qrScannerSlice = createSlice({
  name: "qrScanner",
  initialState,
  reducers: {
    startScanning(state) {
      state.scanning = true;
      state.error = null;
      state.lastScannedData = null;
      state.verificationResult = null;
    },
    stopScanning(state) {
      state.scanning = false;
    },
    setScannedData(state, action) {
      state.lastScannedData = action.payload;
      state.history.unshift({
        data: action.payload,
        timestamp: new Date().toISOString(),
      });
    },
    clearScanResult(state) {
      state.lastScannedData = null;
      state.verificationResult = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(verifyQRCode.pending, (state) => {
        state.verifying = true;
        state.error = null;
        state.verificationResult = null;
      })
      .addCase(verifyQRCode.fulfilled, (state, action) => {
        state.verifying = false;
        state.verificationResult = action.payload;
      })
      .addCase(verifyQRCode.rejected, (state, action) => {
        state.verifying = false;
        state.error = action.payload;
      });
  },
});

export const { startScanning, stopScanning, setScannedData, clearScanResult } =
  qrScannerSlice.actions;

export default qrScannerSlice.reducer;
