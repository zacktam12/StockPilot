// src/features/dashboard/pages/Dashboard.jsx
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Package, ShoppingBag, Users, Truck, DollarSign } from "lucide-react";
import { io } from "socket.io-client";
import { API_BASE_URL } from "../../../config";

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
  fetchLowStockAlerts,
  setSocketUpdates,
} from "../../../store/slices/dashboardSlice";

const DashboardPage = () => {
  const dispatch = useDispatch();
  const { stats, loading } = useSelector((state) => state.dashboard);

  // Fetch dashboard stats and activities, and set up WebSocket for live updates
  useEffect(() => {
    dispatch(fetchDashboardStats());
    dispatch(fetchActivities({ page: 1, limit: 10 }));
    dispatch(fetchLowStockAlerts({ page: 1, limit: 10 }));

    const socket = io(API_BASE_URL);
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
  // if (error) return <div>Error: {error}</div>;

  return (
    <div className="h-full font-sans bg-white text-gray-900 dark:bg-background dark:text-text lg:max-h-screen lg:overflow-hidden">
      {/* Page header - responsive */}
      <div className="flex items-center justify-between mb-3 sm:mb-4 px-2 sm:px-0">
        <h1 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white cursor-pointer transition-all duration-300 ease-in-out hover:text-blue-600 dark:hover:text-blue-400 hover:scale-105">
          Dashboard
        </h1>
      </div>

      {/* Main dashboard content - responsive layout with scrolling on mobile/tablet */}
      <div className="flex flex-col lg:h-[calc(100vh-120px)] gap-2 sm:gap-3 px-2 sm:px-0 pb-4 lg:pb-0">
        {/* Stat cards grid - responsive */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3 [&>*:nth-child(n+7)]:hidden lg:[&>*:nth-child(n+7)]:block">
          <StatCard
            title="Products"
            value={stats.totalProducts.toString()}
            icon={<Package size={20} />}
            isLoading={loading}
            compact={true}
          />
          <StatCard
            title="Sales"
            value={stats.totalSales.toString()}
            icon={<ShoppingBag size={20} />}
            isLoading={loading}
            compact={true}
          />
          <StatCard
            title="Customers"
            value={stats.totalCustomers.toString()}
            icon={<Users size={20} />}
            isLoading={loading}
            compact={true}
          />
          <StatCard
            title="Suppliers"
            value={stats.totalSuppliers.toString()}
            icon={<Truck size={20} />}
            isLoading={loading}
            compact={true}
          />
          <StatCard
            title="Revenue"
            value={`$${(stats.totalRevenue / 12).toLocaleString("en-US", {
              minimumFractionDigits: 0,
              maximumFractionDigits: 0,
            })}`}
            icon={<DollarSign size={20} />}
            isLoading={loading}
            compact={true}
          />
          <StatCard
            title="Low Stock"
            value={stats.lowStockItems.toString()}
            icon={<Package size={20} />}
            isLoading={loading}
            compact={true}
          />
        </div>

        {/* Charts and activity section - responsive layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-2 sm:gap-3 lg:flex-1 lg:min-h-0">
          {/* Charts section - responsive */}
          <div className="lg:col-span-2 grid grid-cols-1 xl:grid-cols-2 gap-2 sm:gap-3">
            <div className="bg-white p-3 sm:p-4 rounded-xl shadow-md dark:bg-background-secondary min-h-0 cursor-pointer transition-all duration-300 ease-in-out hover:shadow-lg hover:scale-[1.02] hover:bg-blue-50 dark:hover:bg-gray-800">
              <RevenueChart compact={true} />
            </div>
            <div className="bg-white p-3 sm:p-4 rounded-xl shadow-md dark:bg-background-secondary min-h-0 cursor-pointer transition-all duration-300 ease-in-out hover:shadow-lg hover:scale-[1.02] hover:bg-blue-50 dark:hover:bg-gray-800">
              <ProductDistributionChart compact={true} />
            </div>
          </div>

          {/* Right sidebar - responsive */}
          <div className="flex flex-col gap-2 sm:gap-3 lg:min-h-0">
            {/* Low stock product alerts - responsive */}
            <div className="lg:flex-1 lg:min-h-0">
              <ProductAlertCard compact={true} />
            </div>
            {/* Recent activity feed - responsive */}
            <div className="lg:flex-1 lg:min-h-0">
              <RecentActivityCard compact={true} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
