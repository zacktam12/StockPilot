import React from "react";
import { Routes, Route } from "react-router-dom";

import Login from "../features/auth/pages/Login"; // 👈 import Login

import ProtectedLayout from "../layouts/ProtectedLayout";
import Dashboard from "../features/dashboard/pages/Dashboard";
import Products from "../features/products/pages/Products";
import Category from "../features/category/pages/Category";
import Customers from "../features/customers/pages/Customers";
import Suppliers from "../features/suppliers/pages/Suppliers";
import Purchase from "../features/purchase/pages/Purchase";
import Sales from "../features/sales/pages/Sales";
import Users from "../features/users/pages/Users";
import Report from "../features/report/pages/Report";
import { ThemeProvider } from "../components/ThemeProvider";
import ProfilePage from "../features/users/pages/Profile";
import LoadingExamplePage from "../features/dashboard/pages/LoadingExamplePage";
import SettingsPage from "../features/settings/pages/Settings";
// In your AppRoutes.jsx or main router file
import ForgotPassword from "../features/auth/modals/ForgotPasswordModal.jsx";
import AccountRecovery from "../features/auth/modals/AccountRecoveryModal";

const AppRoutes = () => {
  return (
    <ThemeProvider>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/account-recovery" element={<AccountRecovery />} />
        <Route element={<ProtectedLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/products" element={<Products />} />
          <Route path="/categories" element={<Category />} />
          <Route path="/customers" element={<Customers />} />
          <Route path="/suppliers" element={<Suppliers />} />
          <Route path="/purchases" element={<Purchase />} />
          <Route path="/sales" element={<Sales />} />
          <Route path="/users" element={<Users />} />
          <Route path="/reports" element={<Report />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/loading-example" element={<LoadingExamplePage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>
      </Routes>
    </ThemeProvider>
  );
};

export default AppRoutes;
