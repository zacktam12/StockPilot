// src/App.jsx
import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import AppRoutes from "./routes/AppRoutes";
import LoadingOverlay from "./components/shared/LoadingOverlay";
import ToastNotification from "./components/shared/ToastNotification";
import { NotificationProvider } from "./contexts/NotificationContext";
import { hideToast, clearAllToasts } from "./store/slices/uiSlice";

function App() {
  // Use only the global loading state
  const isLoading = useSelector((state) => state.loading.isLoading);
  const toast = useSelector((state) => state.ui.toast);
  const dispatch = useDispatch();


  // Clear any existing toast messages on app load
  useEffect(() => {
    dispatch(clearAllToasts());
  }, [dispatch]);

  return (
    <NotificationProvider>
      <div className="min-h-screen bg-gray-100 text-gray-900 relative">
        {isLoading && <LoadingOverlay />}
        <AppRoutes />
        <ToastNotification
          message={toast.message}
          type={toast.type}
          onClose={() => dispatch(hideToast())}
        />
      </div>
    </NotificationProvider>
  );
}

export default App;
