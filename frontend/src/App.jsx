// src/App.jsx
import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import AppRoutes from "./routes/AppRoutes";
import LoadingOverlay from "./components/shared/LoadingOverlay";
import ToastNotification from "./components/shared/ToastNotification";
import { hideToast } from "./store/slices/uiSlice";
import { fetchSettings } from "./store/slices/settingsSlice";

function App() {
  const dispatch = useDispatch();
  const settings = useSelector((state) => state.settings.settings);
  useEffect(() => {
    dispatch(fetchSettings());
  }, [dispatch]);
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
        onClose={() => dispatch(hideToast())}
      />
    </div>
  );
}

export default App;
