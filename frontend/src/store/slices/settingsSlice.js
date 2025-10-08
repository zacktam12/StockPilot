import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../services/api";
import { showError, showSuccess, showWarning } from "../../services/notificationService";

// Async thunk to fetch settings
export const fetchSettings = createAsyncThunk(
  "settings/fetchSettings",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/settings");
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to fetch settings"
      );
    }
  }
);

// Async thunk to update settings
export const updateSettings = createAsyncThunk(
  "settings/updateSettings",
  async ({ endpoint, data }, { rejectWithValue }) => {
    try {
      const response = await api.put(endpoint, data);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to update settings"
      );
    }
  }
);

const initialState = {
  // Settings data
  settings: {
    // Basic Settings
    appName: "StockPilot",
    theme: "light",
    lowStockThreshold: 5,
    currency: "USD",
    taxRate: 0,
    
    // Company Information
    companyName: "",
    companyEmail: "",
    companyPhone: "",
    companyAddress: "",
    companyTaxId: "",
    companyWebsite: "",
    companyLogo: "",
    
    // Notifications
    emailNotifications: true,
    lowStockAlerts: true,
    salesReports: true,
    newCustomerAlerts: false,
    systemUpdates: true,
    orderConfirmations: true,
    
    // Security
    twoFactorAuth: false,
    passwordExpiry: 90,
    sessionTimeout: 30,
    loginAttempts: 5,
    
    // Additional Settings
    dateFormat: "MM/DD/YYYY",
    timeFormat: "12",
    language: "en",
    autoBackup: false,
    backupFrequency: "daily",
  },
  loading: false,
  error: null,
  lastUpdated: null,
};

const settingsSlice = createSlice({
  name: "settings",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    resetSettings: () => initialState,
    // Local update for immediate UI feedback
    updateLocalSetting: (state, action) => {
      const { key, value } = action.payload;
      if (state.settings.hasOwnProperty(key)) {
        state.settings[key] = value;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Settings
      .addCase(fetchSettings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSettings.fulfilled, (state, action) => {
        state.loading = false;
        // Only update if the payload is different to prevent unnecessary re-renders
        if (JSON.stringify(state.settings) !== JSON.stringify(action.payload)) {
          state.settings = {
            ...state.settings,
            ...action.payload,
          };
          state.lastUpdated = new Date().toISOString();
        }
      })
      .addCase(fetchSettings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        showError(
          'Settings Load Failed',
          'Unable to load application settings. Some features may not work correctly.',
          5000
        );
      })
      // Update Settings
      .addCase(updateSettings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateSettings.fulfilled, (state, action) => {
        state.loading = false;
        state.settings = {
          ...state.settings,
          ...action.payload,
        };
        state.lastUpdated = new Date().toISOString();
        showSuccess(
          'Settings Updated',
          'Your settings have been saved successfully.',
          4000
        );
      })
      .addCase(updateSettings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        showError(
          'Settings Update Failed',
          'Unable to save settings. Please try again.',
          5000
        );
      });
  },
});

export const { clearError, resetSettings, updateLocalSetting } = settingsSlice.actions;

// Selectors
export const selectSettings = (state) => state.settings.settings;
export const selectLowStockThreshold = (state) => state.settings.settings.lowStockThreshold;
export const selectSettingsLoading = (state) => state.settings.loading;
export const selectSettingsError = (state) => state.settings.error;

export default settingsSlice.reducer;