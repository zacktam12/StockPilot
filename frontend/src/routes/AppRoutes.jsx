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

const AppRoutes = () => {
	return (
		<ThemeProvider>
			<Routes>
				<Route path="/login" element={<Login />} />
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
				</Route>
			</Routes>
		</ThemeProvider>
	);
};

export default AppRoutes;
