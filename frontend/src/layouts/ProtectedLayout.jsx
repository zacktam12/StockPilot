// src/layouts/ProtectedLayout.jsx
import React from "react";
import { Outlet } from "react-router-dom";
import { useSelector } from "react-redux";
import Sidebar from "../components/sidebar/Sidebar";
import Header from "../components/header/Header";
import LoadingOverlay from "../components/shared/LoadingOverlay";
import { BarsSpinner } from "../components/shared/Spinner";
import useAuthCheck from "../hooks/useAuthCheck";

const ProtectedLayout = () => {
  // Auth verification loading (highest priority)
  const { isLoading: isAuthLoading } = useAuthCheck();

  // Global loading state from Redux
  const { isLoading } = useSelector((state) => state.loading);

  // Full-page spinner for initial auth check
  if (isAuthLoading) {
    return (
      <div className="grid h-screen place-items-center bg-gray-100 dark:bg-gray-900">
        <div className="flex flex-col items-center">
          <BarsSpinner />
          <span className="mt-4 text-gray-600 dark:text-gray-400">
            Verifying authentication...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-white text-black dark:bg-gray-900 dark:text-white flex relative lg:overflow-hidden">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header />
        {isLoading && <LoadingOverlay />}
        <main className="flex-1 overflow-y-auto lg:overflow-hidden p-4 md:p-6 bg-white text-black dark:bg-gray-900 dark:text-white relative">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default ProtectedLayout;
