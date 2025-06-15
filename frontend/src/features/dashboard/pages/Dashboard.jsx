// src/features/dashboard/pages/Dashboard.jsx
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Users,
  Truck,
  DollarSign,
} from "lucide-react";
import { io } from "socket.io-client";

// Components
import StatCard from "../components/StatCard";
import RecentActivityCard from "../components/RecentActivityCard";
import ProductAlertCard from "../components/ProductAlertCard";
import {
  RevenueChart,
  ProductDistributionChart,
} from "../components/DashboardCharts";

// Redux actions
import {
  fetchDashboardStats,
  fetchActivities,
  setSocketUpdates,
} from "../../../store/slices/dashboardSlice";

const DashboardPage = () => {
  const dispatch = useDispatch();
  const { stats, activities, lowStockProducts, loading, error } = useSelector(
    (state) => state.dashboard
  );

  useEffect(() => {
    // Initial data fetch
    dispatch(fetchDashboardStats());
    dispatch(fetchActivities());

    // Set up WebSocket
    const socket = io("http://localhost:5000");
    socket.on("dashboard-update", (data) => {
      dispatch(setSocketUpdates(data));
    });

    return () => {
      socket.disconnect();
    };
  }, [dispatch]);

  if (loading) return <div>Loading dashboard...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard
          title="Total Products"
          value={stats.totalProducts.toString()}
          icon={<Package size={24} />}
        />
        <StatCard
          title="Total Sales"
          value={stats.totalSales.toString()}
          icon={<ShoppingBag size={24} />}
        />
        <StatCard
          title="Customers"
          value={stats.totalCustomers.toString()}
          icon={<Users size={24} />}
        />
        <StatCard
          title="Suppliers"
          value={stats.totalSuppliers.toString()}
          icon={<Truck size={24} />}
        />
        <StatCard
          title="Revenue (Monthly)"
          value={`$${(stats.totalRevenue / 12).toLocaleString("en-US", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}`}
          icon={<DollarSign size={24} />}
        />
        <StatCard
          title="Low Stock Items"
          value={stats.lowStockItems.toString()}
          icon={<Package size={24} />}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <RevenueChart />
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <ProductDistributionChart />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ProductAlertCard products={lowStockProducts} />
        <RecentActivityCard />
      </div>
    </div>
  );
};

export default DashboardPage;
