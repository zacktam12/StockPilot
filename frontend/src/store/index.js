import { configureStore } from "@reduxjs/toolkit";
import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";
import { combineReducers } from "@reduxjs/toolkit";
import productReducer from "./slices/productSlice";
import notificationReducer from "./slices/notificationSlice";
import dashboardReducer from "./slices/dashboardSlice";
import categoryReducer from "./slices/categorySlice";
import customerReducer from "./slices/customerSlice";
import supplierReducer from "./slices/supplierSlice";
import userReducer from "./slices/userSlice";
import roleReducer from "./slices/roleSlice";
import saleReducer from "./slices/salesSlice";
import purchaseReducer from "./slices/purchaseSlice";
import authReducer from "./slices/authSlice";
import debounceReducer from "./slices/debounceSlice";
import loadingReducer from "./slices/loadingSlice";
import settingsReducer from "./slices/settingsSlice";
import { loadingMiddleware } from "./middleware/loadingMiddleware";
import uiReducer from "./slices/uiSlice";

// Persist configuration
const persistConfig = {
  key: 'root',
  storage,
  whitelist: [
    'product', // Persist product state including pagination
    'category', // Persist category state including pagination
    'customer', // Persist customer state including pagination
    'supplier', // Persist supplier state including pagination
    'user', // Persist user state including pagination
    'sales', // Persist sales state including pagination
    'purchases', // Persist purchases state including pagination
    'auth', // Persist auth state
    'settings', // Persist settings
    'ui', // Persist UI state
  ],
  blacklist: [
    'notifications', // Don't persist notifications
    'dashboard', // Don't persist dashboard realtime data
    'loading', // Don't persist loading state
    'debounce', // Don't persist debounce state
  ],
};

// Combine all reducers
const rootReducer = combineReducers({
  product: productReducer,
  notifications: notificationReducer,
  dashboard: dashboardReducer,
  category: categoryReducer,
  customer: customerReducer,
  supplier: supplierReducer,
  user: userReducer,
  role: roleReducer,
  sales: saleReducer,
  purchases: purchaseReducer,
  auth: authReducer,
  debounce: debounceReducer,
  loading: loadingReducer,
  settings: settingsReducer,
  ui: uiReducer,
});

// Create persisted reducer
// const persistedReducer = persistReducer(persistConfig, rootReducer);
const persistedReducer = rootReducer; // Temporarily disable persist

// Recommended serializable check configuration
const serializableCheck = {
  ignoredActions: [
    "persist/PERSIST", // Ignore Redux Persist actions
    "persist/REHYDRATE", // Ignore Redux Persist actions
    // Add other actions that might contain non-serializable values
  ],
  ignoredPaths: [
    "_persist", // Ignore Redux Persist state
    // Add other paths that might contain non-serializable values
  ],
};

const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck, // Use the configured serializable check
      immutableCheck: {
        ignoredPaths: [
          "notifications.messages", // Paths that change frequently
          "dashboard.realtimeData",
          "_persist", // Ignore Redux Persist state
        ],
      },
    }).concat(loadingMiddleware),
});

// const persistor = persistStore(store);
// persistor.purge(); // Uncomment to clear persisted state if needed

export { store };
