// src/features/dashboard/pages/Dashboard.jsx
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Package, ShoppingBag, Users, Truck, DollarSign } from "lucide-react";
import { io } from "socket.io-client";

// Components
import StatCard from "../components/StatCard";
import RecentActivityCard from "../components/RecentActivityCard";
import ProductAlertCard from "../components/ProductAlertCard";
import {
  RevenueChart,
  ProductDistributionChart,
} from "../components/DashboardCharts";
import LoadingOverlay from "../../../components/shared/LoadingOverlay";

// Redux actions
import {
  fetchDashboardStats,
  fetchActivities,
  setSocketUpdates,
} from "../../../store/slices/dashboardSlice";

const DashboardPage = () => {
  const dispatch = useDispatch();
  const { stats, /* activities, */ lowStockProducts, loading, error } =
    useSelector((state) => state.dashboard);

  // Fetch dashboard stats and activities, and set up WebSocket for live updates
  useEffect(() => {
    dispatch(fetchDashboardStats());
    dispatch(fetchActivities());
    const socket = io("http://localhost:5000");
    socket.on("dashboard-update", (data) => {
      dispatch(setSocketUpdates(data));
    });
    return () => {
      socket.disconnect();
    };
  }, [dispatch]);

  // Show loader while fetching dashboard data
  if (loading) {
    return (
      <LoadingOverlay
        title="Dashboard"
        description="Loading dashboard data..."
      />
    );
  }

  // Show error message if data fetch fails
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="space-y-6 min-h-screen font-sans bg-white text-gray-900 dark:bg-background dark:text-text">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Dashboard
        </h1>
      </div>

      {/* Stat cards grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard
          title="Total Products"
          value={stats.totalProducts.toString()}
          icon={<Package size={24} />}
          isLoading={loading}
        />
        <StatCard
          title="Total Sales"
          value={stats.totalSales.toString()}
          icon={<ShoppingBag size={24} />}
          isLoading={loading}
        />
        <StatCard
          title="Customers"
          value={stats.totalCustomers.toString()}
          icon={<Users size={24} />}
          isLoading={loading}
        />
        <StatCard
          title="Suppliers"
          value={stats.totalSuppliers.toString()}
          icon={<Truck size={24} />}
          isLoading={loading}
        />
        <StatCard
          title="Revenue (Monthly)"
          value={`$${(stats.totalRevenue / 12).toLocaleString("en-US", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}`}
          icon={<DollarSign size={24} />}
          isLoading={loading}
        />
        <StatCard
          title="Low Stock Items"
          value={stats.lowStockItems.toString()}
          icon={<Package size={24} />}
          isLoading={loading}
        />
      </div>

      {/* Charts grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-md dark:bg-background-secondary">
          {/* Revenue chart */}
          <RevenueChart />
        </div>
        <div className="bg-white p-6 rounded-xl shadow-md dark:bg-background-secondary">
          {/* Product distribution chart */}
          <ProductDistributionChart />
        </div>
      </div>

      {/* Alerts and recent activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Low stock product alerts */}
        <ProductAlertCard products={lowStockProducts} />
        {/* Recent activity feed */}
        <RecentActivityCard />
      </div>
    </div>
  );
};

export default DashboardPage;
