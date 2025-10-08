import { Routes, Route } from "react-router-dom";
import Login from "../features/auth/pages/Login";
// import ProtectedRoute from "../components/ProtectedRoute"; // ✅ import this
import ProtectedLayout from "../layouts/ProtectedLayout";
import Dashboard from "../features/dashboard/pages/Dashboard";
import EnhancedDashboard from "../features/dashboard/pages/EnhancedDashboard";
import Products from "../features/products/pages/Products";
import ProductDetail from "../features/products/pages/ProductDetail";
import Category from "../features/category/pages/Category";
import Customers from "../features/customers/pages/Customers";
import CustomerDetail from "../features/customers/pages/CustomerDetail";
import Suppliers from "../features/suppliers/pages/Suppliers";
import SupplierDetail from "../features/suppliers/pages/SupplierDetail";
import Purchase from "../features/purchase/pages/Purchase";
import PurchaseDetail from "../features/purchase/pages/PurchaseDetail";
import Sales from "../features/sales/pages/Sales";
import SaleDetail from "../features/sales/pages/SaleDetail";
import Users from "../features/users/pages/Users";
import Report from "../features/report/pages/Report";
import ProfilePage from "../features/users/pages/Profile";
import LoadingExamplePage from "../features/dashboard/pages/LoadingExamplePage";
import SettingsPage from "../features/settings/pages/Settings";
import ForgotPassword from "../features/auth/modals/ForgotPasswordModal.jsx";
import AccountRecovery from "../features/auth/modals/AccountRecoveryModal";
import { ThemeProvider } from "../components/ThemeProvider";

const AppRoutes = () => {
  return (
    <ThemeProvider>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/account-recovery" element={<AccountRecovery />} />

        {/* Protected Routes */}
        <Route element={<ProtectedLayout />}>
          <Route index element={<EnhancedDashboard />} />
          <Route path="/dashboard" element={<EnhancedDashboard />} />
          <Route path="/dashboard/legacy" element={<Dashboard />} />
          <Route path="/products" element={<Products />} />
          <Route path="/products/:id" element={<ProductDetail />} />
          <Route path="/categories" element={<Category />} />
          <Route path="/customers" element={<Customers />} />
          <Route path="/customers/:id" element={<CustomerDetail />} />
          <Route path="/suppliers" element={<Suppliers />} />
          <Route path="/suppliers/:id" element={<SupplierDetail />} />
          <Route path="/purchases" element={<Purchase />} />
          <Route path="/purchases/:id" element={<PurchaseDetail />} />
          <Route path="/sales" element={<Sales />} />
          <Route path="/sales/:id" element={<SaleDetail />} />
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
