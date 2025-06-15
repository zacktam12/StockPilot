// src/layouts/ProtectedLayout.jsx
import React from "react";
import { Outlet } from "react-router-dom";
import { useSelector } from "react-redux";
import Sidebar from "../components/sidebar/Sidebar";
import Header from "../components/header/Header";
import Spinner from "../components/shared/Spinner";
import useAuthCheck from "../hooks/useAuthCheck";

const ProtectedLayout = () => {
  // Auth verification loading (highest priority)
  const { isLoading: isAuthLoading } = useAuthCheck();

  // Global loading state from Redux
  const { isLoading, loadingMessage } = useSelector((state) => state.loading);

  // Full-page spinner for initial auth check
  if (isAuthLoading) {
    return (
      <div className="grid h-screen place-items-center bg-gray-100 dark:bg-gray-900">
        <div className="flex flex-col items-center">
          <Spinner />
          <span className="mt-4 text-gray-600 dark:text-gray-400">
            Verifying authentication...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
      <Sidebar />

      <div className="flex flex-col flex-1 overflow-hidden">
        <Header />

        {/* Global loading indicator in header */}
        {isLoading && (
          <div className="absolute top-4 right-4 z-50">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white dark:bg-gray-800 shadow-md">
              <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-sm text-gray-700 dark:text-gray-300">
                {loadingMessage || "Processing..."}
              </span>
            </div>
          </div>
        )}

        <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-white dark:bg-gray-800 relative">
          <Outlet />
        </main>

        {/* Global spinner overlay - appears above all content */}
        {isLoading && (
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-[9998] flex items-center justify-center">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl flex flex-col items-center min-w-[200px]">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500 mb-4"></div>
              {loadingMessage && (
                <p className="text-gray-700 dark:text-gray-300 text-sm">
                  {loadingMessage}
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProtectedLayout;
