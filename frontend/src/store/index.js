import { configureStore } from "@reduxjs/toolkit";
import { persistStore } from "redux-persist";
import productReducer from "./slices/productSlice";
import notificationReducer from "./slices/notificationSlice";
import qrScannerReducer from "./slices/qrScannerSlice";
import dashboardReducer from "./slices/dashboardSlice";
import categoryReducer from "./slices/categorySlice";
import customerReducer from "./slices/customerSlice";
import supplierReducer from "./slices/supplierSlice";
import userReducer from "./slices/userSlice";
import saleReducer from "./slices/salesSlice";
import debounceReducer from "./slices/debounceSlice";
import loadingReducer from "./slices/loadingSlice";
import { loadingMiddleware } from "./middleware/loadingMiddleware";

// Recommended serializable check configuration
const serializableCheck = {
  ignoredActions: [
    "qrScanner/setScannerInstance", // Add any non-serializable actions here
    // Add other actions that might contain non-serializable values
  ],
  ignoredPaths: [
    "qrScanner.instance", // Add paths to non-serializable state
    // Add other paths that might contain non-serializable values
  ],
};

const store = configureStore({
  reducer: {
    product: productReducer,
    notifications: notificationReducer,
    qrScanner: qrScannerReducer,
    dashboard: dashboardReducer,
    category: categoryReducer,
    customer: customerReducer,
    supplier: supplierReducer,
    user: userReducer,
    sales: saleReducer,
    debounce: debounceReducer,
    loading: loadingReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck, // Use the configured serializable check
      immutableCheck: {
        ignoredPaths: [
          "notifications.messages", // Paths that change frequently
          "dashboard.realtimeData",
        ],
      },
    }).concat(loadingMiddleware),
});
const persistor = persistStore(store);
persistor.purge();
// Optional: If using Redux Persist
export { store, persistor };
