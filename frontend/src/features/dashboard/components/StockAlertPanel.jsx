import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/shared/Card";
import {
  AlertTriangle,
  Package,
  TrendingDown,
  TrendingUp,
  RefreshCw,
  Settings,
  Eye,
  EyeOff,
  Filter,
  SortAsc,
  SortDesc,
} from "lucide-react";

const StockAlertPanel = ({
  alerts = [],
  loading = false,
  realTime = false,
  compact = false,
  className = "",
  onRefresh = null,
  onDismissAlert = null,
  onViewProduct = null,
}) => {
  const [filteredAlerts, setFilteredAlerts] = useState(alerts);
  const [severityFilter, setSeverityFilter] = useState("all");
  const [sortBy, setSortBy] = useState("severity"); // severity, quantity, date, name
  const [sortOrder, setSortOrder] = useState("asc");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [dismissedAlerts, setDismissedAlerts] = useState(new Set());

  useEffect(() => {
    let filtered = alerts.filter(alert => !dismissedAlerts.has(alert.id));

    // Apply severity filter
    if (severityFilter !== "all") {
      filtered = filtered.filter(alert => alert.severity === severityFilter);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case "severity":
          const severityOrder = { critical: 3, high: 2, medium: 1, low: 0 };
          aValue = severityOrder[a.severity] || 0;
          bValue = severityOrder[b.severity] || 0;
          break;
        case "quantity":
          aValue = a.currentStock || 0;
          bValue = b.currentStock || 0;
          break;
        case "date":
          aValue = new Date(a.updatedAt || a.createdAt);
          bValue = new Date(b.updatedAt || b.createdAt);
          break;
        case "name":
          aValue = a.productName?.toLowerCase() || "";
          bValue = b.productName?.toLowerCase() || "";
          break;
        default:
          return 0;
      }

      if (sortOrder === "asc") {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    setFilteredAlerts(filtered);
  }, [alerts, severityFilter, sortBy, sortOrder, dismissedAlerts]);

  const getSeverityConfig = (severity) => {
    switch (severity) {
      case "critical":
        return {
          color: "text-red-600 dark:text-red-400",
          bg: "bg-red-100 dark:bg-red-900/20",
          border: "border-red-200 dark:border-red-800",
          icon: AlertTriangle,
          label: "Critical",
        };
      case "high":
        return {
          color: "text-orange-600 dark:text-orange-400",
          bg: "bg-orange-100 dark:bg-orange-900/20",
          border: "border-orange-200 dark:border-orange-800",
          icon: AlertTriangle,
          label: "High",
        };
      case "medium":
        return {
          color: "text-yellow-600 dark:text-yellow-400",
          bg: "bg-yellow-100 dark:bg-yellow-900/20",
          border: "border-yellow-200 dark:border-yellow-800",
          icon: TrendingDown,
          label: "Medium",
        };
      case "low":
        return {
          color: "text-blue-600 dark:text-blue-400",
          bg: "bg-blue-100 dark:bg-blue-900/20",
          border: "border-blue-200 dark:border-blue-800",
          icon: TrendingDown,
          label: "Low",
        };
      default:
        return {
          color: "text-gray-600 dark:text-gray-400",
          bg: "bg-gray-100 dark:bg-gray-900/20",
          border: "border-gray-200 dark:border-gray-800",
          icon: AlertTriangle,
          label: "Unknown",
        };
    }
  };

  const getStockStatus = (currentStock, minStock, maxStock) => {
    if (currentStock === 0) {
      return { status: "out", label: "Out of Stock", color: "text-red-600 dark:text-red-400" };
    } else if (currentStock <= minStock) {
      return { status: "low", label: "Low Stock", color: "text-orange-600 dark:text-orange-400" };
    } else if (currentStock >= maxStock) {
      return { status: "high", label: "High Stock", color: "text-blue-600 dark:text-blue-400" };
    } else {
      return { status: "normal", label: "Normal", color: "text-green-600 dark:text-green-400" };
    }
  };

  const calculateStockTrend = (currentStock, previousStock) => {
    if (!previousStock) return null;
    
    const change = currentStock - previousStock;
    const percentage = ((change / previousStock) * 100).toFixed(1);
    
    return {
      value: Math.abs(percentage),
      direction: change >= 0 ? "up" : "down",
      isPositive: change >= 0,
    };
  };

  const handleDismissAlert = (alertId) => {
    setDismissedAlerts(prev => new Set([...prev, alertId]));
    if (onDismissAlert) {
      onDismissAlert(alertId);
    }
  };

  const handleRefresh = async () => {
    if (onRefresh) {
      setIsRefreshing(true);
      await onRefresh();
      setIsRefreshing(false);
    }
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
  };

  const severityOptions = [
    { value: "all", label: "All Alerts" },
    { value: "critical", label: "Critical" },
    { value: "high", label: "High" },
    { value: "medium", label: "Medium" },
    { value: "low", label: "Low" },
  ];

  const sortOptions = [
    { value: "severity", label: "Severity" },
    { value: "quantity", label: "Stock Level" },
    { value: "date", label: "Date" },
    { value: "name", label: "Product Name" },
  ];

  return (
    <Card className={`relative overflow-hidden transition-all duration-300 hover:shadow-lg ${className}`}>
      <CardHeader className={`${compact ? "p-3 sm:p-4" : "p-4 sm:p-6"}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <CardTitle className={`font-semibold text-gray-900 dark:text-white ${
              compact ? "text-sm" : "text-base"
            }`}>
              Stock Alerts
            </CardTitle>
            
            {/* Alert count badge */}
            {filteredAlerts.length > 0 && (
              <span className="px-2 py-1 text-xs font-medium bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-200 rounded-full">
                {filteredAlerts.length}
              </span>
            )}

            {/* Real-time indicator */}
            {realTime && (
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                <span className="text-xs text-red-600 dark:text-red-400 font-medium">
                  Live
                </span>
              </div>
            )}
          </div>

          <div className="flex items-center space-x-2">
            {/* Refresh button */}
            {onRefresh && (
              <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="p-2 text-gray-500 hover:text-red-600 dark:hover:text-red-400 transition-colors duration-200"
                title="Refresh alerts"
              >
                <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`} />
              </button>
            )}

            {/* Settings button */}
            <button
              className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors duration-200"
              title="Alert settings"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Filters and Controls */}
        {!compact && (
          <div className="mt-4 space-y-3">
            <div className="flex items-center space-x-4">
              {/* Severity Filter */}
              <div className="flex items-center space-x-2">
                <Filter className="w-4 h-4 text-gray-400" />
                <select
                  value={severityFilter}
                  onChange={(e) => setSeverityFilter(e.target.value)}
                  className="px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                >
                  {severityOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Sort Options */}
              <div className="flex items-center space-x-2">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                >
                  {sortOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                
                <button
                  onClick={() => handleSort(sortBy)}
                  className="p-2 text-gray-500 hover:text-red-600 dark:hover:text-red-400 transition-colors duration-200"
                  title={`Sort ${sortOrder === "asc" ? "Descending" : "Ascending"}`}
                >
                  {sortOrder === "asc" ? (
                    <SortAsc className="w-4 h-4" />
                  ) : (
                    <SortDesc className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </CardHeader>

      <CardContent className={`${compact ? "p-3 sm:p-4 pt-0" : "p-4 sm:p-6 pt-0"}`}>
        {loading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, index) => (
              <div key={index} className="animate-pulse">
                <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredAlerts.length > 0 ? (
          <div className={`space-y-3 ${compact ? "max-h-64" : "max-h-96"} overflow-y-auto`}>
            {filteredAlerts.map((alert) => {
              const severityConfig = getSeverityConfig(alert.severity);
              const stockStatus = getStockStatus(alert.currentStock, alert.minStock, alert.maxStock);
              const trend = calculateStockTrend(alert.currentStock, alert.previousStock);
              const SeverityIcon = severityConfig.icon;

              return (
                <div
                  key={alert.id}
                  className={`p-4 rounded-lg border transition-all duration-300 hover:shadow-md hover:scale-[1.01] cursor-pointer ${severityConfig.bg} ${severityConfig.border}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3 flex-1">
                      {/* Alert Icon */}
                      <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${severityConfig.bg}`}>
                        <SeverityIcon className={`w-5 h-5 ${severityConfig.color}`} />
                      </div>

                      {/* Alert Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className={`font-semibold text-gray-900 dark:text-white ${
                            compact ? "text-sm" : "text-base"
                          }`}>
                            {alert.productName || "Unknown Product"}
                          </h4>
                          
                          <div className="flex items-center space-x-2">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${severityConfig.bg} ${severityConfig.color}`}>
                              {severityConfig.label}
                            </span>
                          </div>
                        </div>

                        <div className="space-y-2">
                          {/* Stock Level */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                              <div className="flex items-center space-x-2">
                                <Package className="w-4 h-4 text-gray-400" />
                                <span className="text-sm text-gray-600 dark:text-gray-400">
                                  Current: <span className={`font-medium ${stockStatus.color}`}>
                                    {alert.currentStock}
                                  </span>
                                </span>
                              </div>
                              
                              <div className="text-sm text-gray-500 dark:text-gray-400">
                                Min: {alert.minStock || "N/A"}
                              </div>
                            </div>

                            <span className={`text-sm font-medium ${stockStatus.color}`}>
                              {stockStatus.label}
                            </span>
                          </div>

                          {/* Trend */}
                          {trend && (
                            <div className="flex items-center space-x-2">
                              {trend.isPositive ? (
                                <TrendingUp className="w-4 h-4 text-green-600 dark:text-green-400" />
                              ) : (
                                <TrendingDown className="w-4 h-4 text-red-600 dark:text-red-400" />
                              )}
                              <span className={`text-sm font-medium ${
                                trend.isPositive ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
                              }`}>
                                {trend.value}% {trend.direction}
                              </span>
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                from last check
                              </span>
                            </div>
                          )}

                          {/* Category and Date */}
                          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                            <span>{alert.category || "Uncategorized"}</span>
                            <span>
                              {new Date(alert.updatedAt || alert.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center space-x-2 ml-4">
                      {onViewProduct && (
                        <button
                          onClick={() => onViewProduct(alert.productId)}
                          className="p-2 text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200"
                          title="View Product"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      )}
                      
                      <button
                        onClick={() => handleDismissAlert(alert.id)}
                        className="p-2 text-gray-500 hover:text-red-600 dark:hover:text-red-400 transition-colors duration-200"
                        title="Dismiss Alert"
                      >
                        <EyeOff className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8">
            <Package className="w-12 h-12 text-green-400 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              All Stock Levels Good
            </h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              No stock alerts at the moment
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default StockAlertPanel;

