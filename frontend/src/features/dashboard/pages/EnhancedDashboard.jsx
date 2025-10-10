import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  Package,
  ShoppingBag,
  Users,
  Truck,
  DollarSign,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Activity,
  BarChart3,
  PieChart,
  RefreshCw,
  Settings,
  Maximize2,
  Grid3X3,
  List,
  Filter,
} from "lucide-react";

// Enhanced Components
import AdvancedStatCard from "../components/AdvancedStatCard";
import RealTimeChart from "../components/RealTimeChart";
import UnifiedActivityAlertsCard from "../components/UnifiedActivityAlertsCard";
import DashboardWidget from "../components/DashboardWidget";

// Hooks
import useRealTimeData from "../hooks/useRealTimeData";
import { useSystemSettings } from "../../../hooks/useSystemSettings";

// Redux actions
import { fetchDashboardStats, fetchRevenueData } from "../../../store/slices/dashboardSlice";

const EnhancedDashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  // Local state
  const [viewMode, setViewMode] = useState("grid"); // grid, list, compact
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [selectedTimeRange, setSelectedTimeRange] = useState("30d"); // 7d, 30d, 90d, 1y, all
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Use real-time data hook
  const {
    stats,
    activities,
    lowStockAlerts,
    revenue,
    distribution,
    connectionStatus,
    lastUpdateTimes,
    refreshAllData,
    isConnected,
    hasRealTimeData,
  } = useRealTimeData();

  // Dashboard loading state
  const { loading } = useSelector((state) => state.dashboard);
  
  // System settings
  const { currency, language, lowStockThreshold } = useSystemSettings();

  // Fetch real data only when time range changes (not on mount since useRealTimeData handles initial fetch)
  useEffect(() => {
    if (selectedTimeRange) {
      dispatch(fetchDashboardStats(selectedTimeRange));
      dispatch(fetchRevenueData(selectedTimeRange));
    }
  }, [dispatch, selectedTimeRange]);

  // Transform real data for charts with better error handling
  const revenueData = React.useMemo(() => {
    if (!revenue?.data || !Array.isArray(revenue.data) || revenue.data.length === 0) {
      return [{ name: "No Sales Data", value: 0, sales: 0 }];
    }
    
    return revenue.data.map((item, index) => ({
      name: item.month || `Period ${index + 1}`,
      value: item.revenue || 0,
      sales: item.sales || 0
    }));
  }, [revenue?.data]);
  
  // Check if we have any actual revenue data (not just zeros)
  const hasRevenueData = React.useMemo(() => {
    return revenue?.data?.some(item => item.revenue > 0) || false;
  }, [revenue?.data]);

  // Transform product distribution data with better error handling
  const productDistributionData = useMemo(() => {
    if (!distribution?.data || typeof distribution.data !== 'object' || Object.keys(distribution.data).length === 0) {
      return [{ name: "No Data", value: 100, color: "#6b7280" }];
    }
    
    return Object.entries(distribution.data).map(([name, value], index) => ({
      name,
      value,
      color: [
        "#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", 
        "#06b6d4", "#84cc16", "#f97316", "#ec4899", "#6366f1"
      ][index % 10]
    }));
  }, [distribution?.data]);

  // Debug logging for data flow (only when needed)
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      // Data flow tracking removed
    }
  }, [stats, activities, lowStockAlerts, revenue, distribution, hasRevenueData, isConnected, hasRealTimeData]);

  // Check if we have any real data
  const hasAnyData = stats && (
    stats.totalProducts > 0 || 
    stats.totalSales > 0 || 
    stats.totalRevenue > 0 || 
    stats.totalCustomers > 0 || 
    stats.totalSuppliers > 0
  );

  // Use real activities data or fallback to empty array
  const realActivities = activities?.data?.length > 0 ? activities.data.map(activity => ({
    id: activity.id,
    type: activity.type,
    description: activity.type === 'sale' ? 'Sale completed' : 'Purchase received',
    user: activity.user || 'System',
    entity: activity.relatedEntity ? { name: activity.relatedEntity.name } : { name: 'Unknown' },
    amount: activity.amount || 0,
    timestamp: activity.date,
    createdAt: activity.date,
    status: activity.type === 'sale' ? 'completed' : 'pending',
  })) : [];

  // Use real stock alerts data or fallback to empty array
  const realStockAlerts = lowStockAlerts?.data?.length > 0 ? lowStockAlerts.data.map(alert => {
     // Debug each alert
    return {
      id: alert.id,
      productId: alert.id, // Use the same ID for now
      productName: alert.name,
      currentStock: alert.quantity,
      minStock: alert.minStock || 10,
      maxStock: 100, // Default max stock
      previousStock: alert.quantity + 5, // Estimate previous stock
      severity: alert.quantity === 0 ? 'critical' : alert.quantity <= 5 ? 'high' : 'medium',
      category: alert.category || 'Uncategorized',
      updatedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };
  }) : [];

  // Debug the final transformed alerts
  useEffect(() => {
    if (realStockAlerts.length > 0) {
          } else {
          }
  }, [realStockAlerts, lowStockAlerts]);

  // Enhanced stats with trends - using only real calculated data
  const enhancedStats = [
    {
      title: "Total Products",
      value: stats.totalProducts || 0,
      icon: <Package size={24} />,
      change: stats.productChange || 0,
      changeType: "percentage",
      trend: (stats.productChange || 0) > 0 ? "up" : (stats.productChange || 0) < 0 ? "down" : "neutral",
      color: "blue",
      subtitle: stats.productChange > 0 
        ? `+${stats.productChange}% this month` 
        : stats.productChange < 0 
        ? `${stats.productChange}% this month`
        : "No change this month",
      isLoading: loading,
    },
    {
      title: "Total Sales",
      value: stats.totalSales || 0,
      icon: <ShoppingBag size={24} />,
      change: stats.salesChange || 0,
      changeType: "percentage",
      trend: (stats.salesChange || 0) > 0 ? "up" : (stats.salesChange || 0) < 0 ? "down" : "neutral",
      color: "green",
      subtitle: stats.salesChange > 0 
        ? `+${stats.salesChange}% this month` 
        : stats.salesChange < 0 
        ? `${stats.salesChange}% this month`
        : "No change this month",
      isLoading: loading,
    },
    {
      title: "Total Revenue",
      value: stats.totalRevenue || 0,
      icon: <DollarSign size={24} />,
      change: stats.revenueChange || 0,
      changeType: "currency",
      trend: (stats.revenueChange || 0) > 0 ? "up" : (stats.revenueChange || 0) < 0 ? "down" : "neutral",
      color: "green",
      subtitle: stats.revenueChange > 0 
        ? `+${stats.revenueChange}% this month` 
        : stats.revenueChange < 0 
        ? `${stats.revenueChange}% this month`
        : "No change this month",
      isLoading: loading,
    },
    {
      title: "Customers",
      value: stats.totalCustomers || 0,
      icon: <Users size={24} />,
      change: null, // No customer change data from backend yet
      changeType: "count",
      trend: "neutral",
      color: "purple",
      subtitle: "Registered customers",
      isLoading: loading,
    },
    {
      title: "Suppliers",
      value: stats.totalSuppliers || 0,
      icon: <Truck size={24} />,
      change: null, // No supplier change data from backend yet
      changeType: "count",
      trend: "neutral",
      color: "orange",
      subtitle: "Active suppliers",
      isLoading: loading,
    },
    {
      title: "Low Stock Alerts",
      value: stats.lowStockItems || 0,
      icon: <AlertTriangle size={24} />,
      change: null, // No low stock change data from backend yet
      changeType: "count",
      trend: "neutral",
      color: stats.lowStockItems > 0 ? "red" : "green",
      subtitle: stats.lowStockItems > 0 ? "Requires attention" : "All stock levels good",
      isLoading: loading,
    },
  ];

  // Handle refresh
  const handleRefresh = useCallback(async () => {
    await refreshAllData();
  }, [refreshAllData]);

  // Handle product view
  const handleViewProduct = useCallback((productId) => {
    navigate(`/products/${productId}`);
  }, [navigate]);

  // Handle alert dismissal
  const handleDismissAlert = useCallback((alertId) => {
        // Implement alert dismissal logic
  }, []);

  // Chart data formatters
  const revenueTooltipFormatter = (value, name) => {
    if (name === "value") {
      return [`$${value.toLocaleString()}`, "Revenue"];
    }
    return [value, name];
  };

  const distributionTooltipFormatter = (value, name, props) => {
    return [`${value}%`, props.payload.name];
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      {/* Dashboard Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-center space-x-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Dashboard
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Real-time inventory and sales analytics
                </p>
              </div>
            </div>

            {/* Dashboard Controls */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 min-w-0">
              {/* Time Range Selector */}
              <select
                value={selectedTimeRange}
                onChange={(e) => setSelectedTimeRange(e.target.value)}
                className="px-3 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-0 flex-shrink-0"
              >
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
                <option value="1y">Last year</option>
                <option value="all">All time</option>
              </select>

              {/* View Mode Toggle */}
              <div className="flex items-center bg-gray-100 dark:bg-gray-700 rounded-lg p-1 flex-shrink-0">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 rounded-md transition-colors duration-200 ${
                    viewMode === "grid"
                      ? "bg-white dark:bg-gray-600 shadow-sm"
                      : "hover:bg-white/50 dark:hover:bg-gray-600/50"
                  }`}
                  title="Grid View"
                >
                  <Grid3X3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode("compact")}
                  className={`p-2 rounded-md transition-colors duration-200 ${
                    viewMode === "compact"
                      ? "bg-white dark:bg-gray-600 shadow-sm"
                      : "hover:bg-white/50 dark:hover:bg-gray-600/50"
                  }`}
                  title="Compact View"
                >
                  <List className="w-4 h-4" />
                </button>
              </div>

              {/* Refresh Button */}
              <button
                onClick={handleRefresh}
                disabled={loading}
                className="flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200 disabled:opacity-50 flex-shrink-0 min-w-0"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
                <span className="text-sm font-medium">Refresh</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Dashboard Content */}
      <div className="px-4 sm:px-6 lg:px-8 py-6">
        {/* Stats Grid */}
        <div className={`grid gap-4 sm:gap-6 mb-6 ${
          viewMode === "compact" 
            ? "grid-cols-2 sm:grid-cols-3 lg:grid-cols-6" 
            : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6"
        }`}>
          {enhancedStats.map((stat, index) => (
            <AdvancedStatCard
              key={index}
              title={stat.title}
              value={stat.value}
              icon={stat.icon}
              change={stat.change}
              changeType={stat.changeType}
              trend={stat.trend}
              color={stat.color}
              subtitle={stat.subtitle}
              realTimeUpdate={isConnected}
              lastUpdated={stat.lastUpdated}
              isLoading={loading}
              compact={viewMode === "compact"}
              onClick={() => {
                // Navigate to relevant page based on stat type
                const routes = {
                  "Total Products": "/products",
                  "Total Sales": "/sales",
                  "Total Revenue": "/reports",
                  "Customers": "/customers",
                  "Suppliers": "/suppliers",
                  "Low Stock Alerts": "/products?filter=low_stock",
                };
                if (routes[stat.title]) {
                  navigate(routes[stat.title]);
                }
              }}
            />
          ))}
        </div>

        {/* No Data Message */}
        {!loading && !hasAnyData && (
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6 mb-6">
            <div className="flex items-center space-x-3">
              <AlertTriangle className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
              <div>
                <h3 className="text-lg font-semibold text-yellow-800 dark:text-yellow-200">
                  No Data Available
                </h3>
                <p className="text-yellow-700 dark:text-yellow-300 mt-1">
                  The dashboard is showing empty because there's no data in your system yet. 
                  Add some products, customers, or make a sale to see real statistics.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Charts and Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 mb-6">
          {/* Revenue Chart */}
          <div className="lg:col-span-2">
            {!hasRevenueData ? (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 transition-colors duration-300">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Revenue Analytics
                  </h3>
                  <button
                    onClick={handleRefresh}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                    title="Refresh data"
                  >
                    <RefreshCw size={16} />
                  </button>
                </div>
                <div className="text-center py-8">
                  <TrendingUp size={48} className="mx-auto text-gray-300 dark:text-gray-600 mb-4" />
                  <p className="text-gray-500 dark:text-gray-400 text-lg mb-2">No Revenue Data Available</p>
                  <p className="text-gray-400 dark:text-gray-500 text-sm">
                    Create some sales to see revenue analytics
                  </p>
                </div>
              </div>
            ) : (
              <RealTimeChart
                title="Revenue Analytics"
                data={revenueData}
                type="line"
                height={300}
                realTime={isConnected}
                dataKey="value"
                xAxisKey="name"
                yAxisLabel="Revenue ($)"
                tooltipFormatter={revenueTooltipFormatter}
                onRefresh={handleRefresh}
                compact={viewMode === "compact"}
              />
            )}
          </div>

          {/* Product Distribution */}
          <div>
            <RealTimeChart
              title="Product Distribution"
              data={productDistributionData}
              type="pie"
              height={300}
              realTime={isConnected}
              dataKey="value"
              tooltipFormatter={distributionTooltipFormatter}
              onRefresh={handleRefresh}
              compact={viewMode === "compact"}
            />
          </div>
        </div>

        {/* Unified Activity and Alerts */}
        <div className="grid grid-cols-1 gap-4 sm:gap-6">
          <UnifiedActivityAlertsCard
            activities={realActivities}
            alerts={realStockAlerts}
            realTime={isConnected}
            onRefresh={handleRefresh}
            onViewProduct={handleViewProduct}
            onDismissAlert={handleDismissAlert}
            compact={viewMode === "compact"}
            showFilters={!viewMode === "compact"}
            maxItems={viewMode === "compact" ? 5 : 10}
          />
        </div>

      </div>

      {/* Fullscreen Overlay */}
      {isFullscreen && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 rounded-xl p-6 w-full max-w-7xl max-h-[90vh] overflow-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Full Dashboard View
              </h2>
              <button
                onClick={() => setIsFullscreen(false)}
                className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              >
                <Maximize2 className="w-6 h-6" />
              </button>
            </div>
            {/* Fullscreen content would go here */}
          </div>
        </div>
      )}
    </div>
  );
};

export default EnhancedDashboard;

