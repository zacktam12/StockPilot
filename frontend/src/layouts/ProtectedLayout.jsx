// src/layouts/ProtectedLayout.jsx
import React, { useEffect } from "react";
import { Outlet, Navigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import Sidebar from "../components/sidebar/Sidebar";
import Header from "../components/header/Header";
import LoadingOverlay from "../components/shared/LoadingOverlay";
import { BarsSpinner } from "../components/shared/Spinner";
import useAuthCheck from "../hooks/useAuthCheck";
import { fetchSettings } from "../store/slices/settingsSlice";

const ProtectedLayout = () => {
  const dispatch = useDispatch();
  
  // Auth verification loading (highest priority)
  const { isLoading: isAuthLoading, isAuthenticated } = useAuthCheck();

  // Global loading state from Redux
  const { isLoading } = useSelector((state) => state.loading);
  
  // Get settings for dynamic app name
  const settings = useSelector((state) => state.settings?.settings);
  const settingsLoading = useSelector((state) => state.settings?.loading);
  const appName = settings?.appName || "StockPilot";

  // Fetch settings when component mounts and user is authenticated
  useEffect(() => {
    if (isAuthenticated && !settings && !settingsLoading) {
      dispatch(fetchSettings());
    }
  }, [dispatch, isAuthenticated]);

  // Full-page spinner for initial auth check
  if (isAuthLoading) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-medium">
            <BarsSpinner />
          </div>
          <div className="text-center">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
              {appName}
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Verifying authentication...
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="h-screen bg-gray-100 dark:bg-gray-900 flex overflow-hidden">
      {/* Fixed Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex flex-col flex-1 min-w-0">
        {/* Fixed Header */}
        <Header />

        {/* Loading Overlay */}
        {isLoading && <LoadingOverlay />}

        {/* Scrollable Main Content */}
        <main className="flex-1 overflow-y-auto bg-gray-100 dark:bg-gray-900 relative">
          <div className="p-4 sm:p-6 lg:p-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default ProtectedLayout;
