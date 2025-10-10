import React, { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/shared/Card";
import {
  Activity,
  AlertTriangle,
  RefreshCw,
  Filter,
  Search,
  TrendingUp,
  TrendingDown,
  Package,
  ShoppingCart,
  Users,
  Truck,
  DollarSign,
  CheckCircle,
  Clock,
  Eye,
  EyeOff,
  X,
  SortAsc,
  SortDesc,
} from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";
import { useSystemSettings } from "../../../hooks/useSystemSettings";
import { formatCurrency, formatDateTime } from "../../../utils/formatUtils";

const UnifiedActivityAlertsCard = ({
  activities = [],
  alerts = [],
  loading = false,
  realTime = false,
  compact = false,
  className = "",
  onRefresh = null,
  onViewProduct = null,
  onDismissAlert = null,
  maxItems = 10,
  showFilters = true,
}) => {
  const [activeTab, setActiveTab] = useState("activity"); // "activity" or "alerts"
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("date");
  const [sortOrder, setSortOrder] = useState("desc");
  
  // System settings
  const { currency, language, dateFormat, timeFormat } = useSystemSettings();

  // Filter and sort data based on active tab
  const [filteredData, setFilteredData] = useState([]);

  useEffect(() => {
    let data = activeTab === "activity" ? activities : alerts;
    
    // Apply filters
    if (activeTab === "activity") {
      if (filter !== "all") {
        data = data.filter(item => item.type === filter);
      }
      if (searchTerm) {
        data = data.filter(item =>
          item.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.user?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.entity?.name?.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }
    } else {
      if (filter !== "all") {
        data = data.filter(item => item.severity === filter);
      }
      if (searchTerm) {
        data = data.filter(item =>
          item.productName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.category?.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }
    }

    // Apply sorting
    data.sort((a, b) => {
      let aValue, bValue;
      
      if (activeTab === "activity") {
        switch (sortBy) {
          case "date":
            aValue = new Date(a.timestamp || a.createdAt);
            bValue = new Date(b.timestamp || b.createdAt);
            break;
          case "type":
            aValue = a.type;
            bValue = b.type;
            break;
          case "amount":
            aValue = a.amount || 0;
            bValue = b.amount || 0;
            break;
          default:
            return 0;
        }
      } else {
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
      }

      if (sortOrder === "asc") {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    setFilteredData(data.slice(0, maxItems));
  }, [activities, alerts, activeTab, filter, searchTerm, sortBy, sortOrder, maxItems]);

  const handleRefresh = async () => {
    if (onRefresh) {
      setIsRefreshing(true);
      await onRefresh();
      setIsRefreshing(false);
    }
  };

  const handleDismissAlert = (alertId) => {
    if (onDismissAlert) {
      onDismissAlert(alertId);
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

  // Activity-specific functions
  const getActivityIcon = (type) => {
    const iconProps = {
      size: compact ? 14 : 16,
      className: "transition-colors duration-300",
    };

    switch (type) {
      case "sale":
        return <ShoppingCart {...iconProps} className="text-green-600 dark:text-green-400" />;
      case "purchase":
        return <Package {...iconProps} className="text-blue-600 dark:text-blue-400" />;
      case "customer":
        return <Users {...iconProps} className="text-purple-600 dark:text-purple-400" />;
      case "supplier":
        return <Truck {...iconProps} className="text-orange-600 dark:text-orange-400" />;
      case "low_stock":
        return <AlertTriangle {...iconProps} className="text-red-600 dark:text-red-400" />;
      case "payment":
        return <DollarSign {...iconProps} className="text-green-600 dark:text-green-400" />;
      default:
        return <Package {...iconProps} className="text-gray-600 dark:text-gray-400" />;
    }
  };

  const getActivityColor = (type) => {
    switch (type) {
      case "sale":
        return "bg-green-100 dark:bg-green-900/20 border-green-200 dark:border-green-800";
      case "purchase":
        return "bg-blue-100 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800";
      case "customer":
        return "bg-purple-100 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800";
      case "supplier":
        return "bg-orange-100 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800";
      case "low_stock":
        return "bg-red-100 dark:bg-red-900/20 border-red-200 dark:border-red-800";
      case "payment":
        return "bg-green-100 dark:bg-green-900/20 border-green-200 dark:border-green-800";
      default:
        return "bg-gray-100 dark:bg-gray-900/20 border-gray-200 dark:border-gray-800";
    }
  };

  const getStatusIcon = (status) => {
    const iconProps = { size: 12, className: "transition-colors duration-300" };
    
    switch (status) {
      case "completed":
        return <CheckCircle {...iconProps} className="text-green-600 dark:text-green-400" />;
      case "pending":
        return <Clock {...iconProps} className="text-yellow-600 dark:text-yellow-400" />;
      case "failed":
        return <AlertTriangle {...iconProps} className="text-red-600 dark:text-red-400" />;
      default:
        return <Clock {...iconProps} className="text-gray-600 dark:text-gray-400" />;
    }
  };

  // Alert-specific functions
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

  const formatTime = (timestamp) => {
    try {
      // Handle invalid or missing timestamps
      if (!timestamp) {
        return "Unknown time";
      }

      const date = new Date(timestamp);
      
      // Check if the date is valid
      if (isNaN(date.getTime())) {
        return "Invalid date";
      }

      const now = new Date();
      const diffMs = now - date;
      
      // Handle future dates
      if (diffMs < 0) {
        return "Just now";
      }

      const diffMins = Math.floor(diffMs / 60000);

      if (diffMins < 1) {
        return "Just now";
      } else if (diffMins < 60) {
        return `${diffMins}m ago`;
      } else if (diffMins < 1440) {
        return `${Math.floor(diffMins / 60)}h ago`;
      } else {
        return formatDateTime(date, dateFormat, timeFormat);
      }
    } catch (error) {
            return "Invalid date";
    }
  };

  const activityTypes = [
    { value: "all", label: "All Activities" },
    { value: "sale", label: "Sales" },
    { value: "purchase", label: "Purchases" },
    { value: "customer", label: "Customers" },
    { value: "supplier", label: "Suppliers" },
    { value: "low_stock", label: "Low Stock" },
    { value: "payment", label: "Payments" },
  ];

  const alertSeverities = [
    { value: "all", label: "All Alerts" },
    { value: "critical", label: "Critical" },
    { value: "high", label: "High" },
    { value: "medium", label: "Medium" },
    { value: "low", label: "Low" },
  ];

  const sortOptions = activeTab === "activity" 
    ? [
        { value: "date", label: "Date" },
        { value: "type", label: "Type" },
        { value: "amount", label: "Amount" },
      ]
    : [
        { value: "severity", label: "Severity" },
        { value: "quantity", label: "Stock Level" },
        { value: "date", label: "Date" },
        { value: "name", label: "Product Name" },
      ];

  return (
    <Card className={`relative overflow-hidden transition-all duration-300 hover:shadow-lg ${className}`}>
      <CardHeader className={`${compact ? "p-3 sm:p-4" : "p-4 sm:p-6"} border-b-0`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <CardTitle className={`font-semibold text-gray-900 dark:text-white ${
              compact ? "text-sm" : "text-base"
            }`}>
              {activeTab === "activity" ? "Real-Time Activity" : "Stock Alerts"}
            </CardTitle>
            
            {/* Real-time indicator */}
            {realTime && (
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-xs text-green-600 dark:text-green-400 font-medium">
                  Live
                </span>
              </div>
            )}

            {/* Count badge */}
            {filteredData.length > 0 && (
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                activeTab === "activity" 
                  ? "bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200"
                  : "bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-200"
              }`}>
                {filteredData.length}
              </span>
            )}
          </div>

          <div className="flex items-center space-x-2">
            {/* Tab Toggle Buttons */}
            <div className="flex items-center bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
              <button
                onClick={() => setActiveTab("activity")}
                className={`flex items-center space-x-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200 ${
                  activeTab === "activity"
                    ? "bg-white dark:bg-gray-600 shadow-sm text-blue-600 dark:text-blue-400"
                    : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                }`}
              >
                <Activity className="w-4 h-4" />
                <span>Activity</span>
              </button>
              <button
                onClick={() => setActiveTab("alerts")}
                className={`flex items-center space-x-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200 ${
                  activeTab === "alerts"
                    ? "bg-white dark:bg-gray-600 shadow-sm text-red-600 dark:text-red-400"
                    : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                }`}
              >
                <AlertTriangle className="w-4 h-4" />
                <span>Alerts</span>
              </button>
            </div>

            {/* Refresh button */}
            {onRefresh && (
              <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="p-2 text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200"
                title="Refresh data"
              >
                <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`} />
              </button>
            )}
          </div>
        </div>

        {/* Filters and Controls */}
        {showFilters && !compact && (
          <div className="mt-4 space-y-2">
            <div className="flex items-center space-x-4">
              {/* Search */}
              <div className="flex items-center space-x-2 flex-1">
                <Search className="w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder={`Search ${activeTab === "activity" ? "activities" : "alerts"}...`}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="flex-1 px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Filter */}
              <div className="flex items-center space-x-2">
                <Filter className="w-4 h-4 text-gray-400" />
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {(activeTab === "activity" ? activityTypes : alertSeverities).map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Sort */}
              <div className="flex items-center space-x-2">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {sortOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                
                <button
                  onClick={() => handleSort(sortBy)}
                  className="p-2 text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200"
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
          <div className="space-y-2">
            {[...Array(3)].map((_, index) => (
              <div key={index} className="animate-pulse">
                <div className="flex items-center space-x-3 p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-full"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                    <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredData.length > 0 ? (
          <div className={`space-y-2 ${compact ? "max-h-64" : "max-h-96"} overflow-y-auto`}>
            {filteredData.map((item, index) => (
              <div key={item.id || index}>
                {activeTab === "activity" ? (
                  // Activity Item
                  <div className="flex items-start space-x-3 p-3 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 hover:shadow-sm transition-all duration-300 hover:scale-[1.01] cursor-pointer">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 flex items-center justify-center shadow-sm">
                      {getActivityIcon(item.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className={`font-medium text-gray-900 dark:text-white ${
                          compact ? "text-xs" : "text-sm"
                        }`}>
                          {item.description || `${item.type} activity`}
                        </p>
                        {item.status && (
                          <div className="flex items-center space-x-1">
                            {getStatusIcon(item.status)}
                            <span className={`text-xs font-medium capitalize ${
                              item.status === "completed" ? "text-green-600 dark:text-green-400" :
                              item.status === "pending" ? "text-yellow-600 dark:text-yellow-400" :
                              item.status === "failed" ? "text-red-600 dark:text-red-400" :
                              "text-gray-600 dark:text-gray-400"
                            }`}>
                              {item.status}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center justify-between mt-1">
                        <div className="flex items-center space-x-2">
                          {item.user && (
                            <span className={`text-gray-600 dark:text-gray-400 ${
                              compact ? "text-xs" : "text-sm"
                            }`}>
                              by {item.user}
                            </span>
                          )}
                          {item.entity?.name && (
                            <span className={`text-gray-500 dark:text-gray-400 ${
                              compact ? "text-xs" : "text-sm"
                            }`}>
                              • {item.entity.name}
                            </span>
                          )}
                          {item.amount && (
                            <span className={`font-medium ${
                              item.type === "sale" ? "text-green-600 dark:text-green-400" :
                              item.type === "purchase" ? "text-blue-600 dark:text-blue-400" :
                              "text-gray-600 dark:text-gray-400"
                            } ${compact ? "text-xs" : "text-sm"}`}>
                              • {formatCurrency(item.amount, currency, language)}
                            </span>
                          )}
                        </div>
                        <span className={`text-gray-500 dark:text-gray-400 ${
                          compact ? "text-xs" : "text-sm"
                        }`}>
                          {formatTime(item.timestamp || item.createdAt)}
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  // Alert Item
                  <div className={`p-3 rounded-lg border transition-all duration-300 hover:shadow-md hover:scale-[1.01] cursor-pointer ${
                    getSeverityConfig(item.severity).bg
                  } ${getSeverityConfig(item.severity).border}`}>
                    <div className="flex items-start space-x-3">
                      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                        getSeverityConfig(item.severity).bg
                      }`}>
                        <AlertTriangle className={`w-4 h-4 ${getSeverityConfig(item.severity).color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className={`font-medium text-gray-900 dark:text-white ${
                            compact ? "text-xs" : "text-sm"
                          }`}>
                            {item.productName || "Unknown Product"}
                          </p>
                          <div className="flex items-center space-x-1">
                            <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                              getSeverityConfig(item.severity).bg
                            } ${getSeverityConfig(item.severity).color}`}>
                              {getSeverityConfig(item.severity).label}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between mt-1">
                          <div className="flex items-center space-x-2">
                            <span className={`text-gray-600 dark:text-gray-400 ${
                              compact ? "text-xs" : "text-sm"
                            }`}>
                              Stock: <span className={`font-medium ${
                                getStockStatus(item.currentStock, item.minStock, item.maxStock).color
                              }`}>
                                {item.currentStock}
                              </span>
                            </span>
                            <span className={`text-gray-500 dark:text-gray-400 ${
                              compact ? "text-xs" : "text-sm"
                            }`}>
                              • {item.category || "Uncategorized"}
                            </span>
                            {item.minStock && (
                              <span className={`text-gray-500 dark:text-gray-400 ${
                                compact ? "text-xs" : "text-sm"
                              }`}>
                                • Min: {item.minStock}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className={`text-gray-500 dark:text-gray-400 ${
                              compact ? "text-xs" : "text-sm"
                            }`}>
                              {formatTime(item.updatedAt || item.createdAt)}
                            </span>
                            {onViewProduct && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onViewProduct(item.productId);
                                }}
                                className="p-1 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200"
                                title="View Product"
                              >
                                <Eye className="w-3 h-3" />
                              </button>
                            )}
                            {onDismissAlert && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDismissAlert(item.id);
                                }}
                                className="p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors duration-200"
                                title="Dismiss Alert"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-3">
              {activeTab === "activity" ? (
                <Activity className="w-6 h-6 text-gray-400" />
              ) : (
                <AlertTriangle className="w-6 h-6 text-gray-400" />
              )}
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              {activeTab === "activity" ? "No Activities Found" : "No Alerts Found"}
            </h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              {activeTab === "activity" 
                ? "No recent activities to display" 
                : "No stock alerts at the moment"
              }
            </p>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="mt-2 text-blue-600 dark:text-blue-400 text-sm hover:underline"
              >
                Clear search
              </button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default UnifiedActivityAlertsCard;
