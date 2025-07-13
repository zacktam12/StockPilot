// src/App.jsx
import React from "react";
import { useSelector } from "react-redux";
import AppRoutes from "./routes/AppRoutes";
import LoadingOverlay from "./components/shared/LoadingOverlay";
import ToastNotification from "./components/shared/ToastNotification";
import { hideToast } from "./store/slices/uiSlice";

function App() {
  // Use only the global loading state
  const isLoading = useSelector((state) => state.loading.isLoading);
  const toast = useSelector((state) => state.ui.toast);

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900 relative">
      {isLoading && <LoadingOverlay />}
      <AppRoutes />
      <ToastNotification
        message={toast.message}
        type={toast.type}
        onClose={() => hideToast()}
      />
    </div>
  );
}

export default App;
