import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import useAuthCheck from "../hooks/useAuthCheck";
import Sidebar from "./sidebar/Sidebar";
import Header from "./header/Header";

const ProtectedLayout = () => {
  const { isLoading, isAuthenticated } = useAuthCheck();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        Loading...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <Header />
        <main>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default ProtectedLayout;
