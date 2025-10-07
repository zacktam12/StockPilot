import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/shared/Card";
import {
  ShoppingCart,
  Package,
  Users,
  Truck,
  DollarSign,
  AlertTriangle,
  CheckCircle,
  Clock,
  RefreshCw,
  Filter,
  Search,
} from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";

const RealTimeActivityFeed = ({
  activities = [],
  loading = false,
  realTime = false,
  compact = false,
  className = "",
  onRefresh = null,
  maxItems = 10,
  showFilters = true,
}) => {
  const [filteredActivities, setFilteredActivities] = useState(activities);
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    let filtered = activities;

    // Apply type filter
    if (filter !== "all") {
      filtered = filtered.filter(activity => activity.type === filter);
    }

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(activity =>
        activity.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        activity.user?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        activity.entity?.name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredActivities(filtered.slice(0, maxItems));
  }, [activities, filter, searchTerm, maxItems]);

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

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) {
      return "Just now";
    } else if (diffMins < 60) {
      return `${diffMins}m ago`;
    } else if (diffMins < 1440) {
      return `${Math.floor(diffMins / 60)}h ago`;
    } else {
      return format(date, "MMM d, h:mm a");
    }
  };

  const handleRefresh = async () => {
    if (onRefresh) {
      setIsRefreshing(true);
      await onRefresh();
      setIsRefreshing(false);
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

  return (
    <Card className={`relative overflow-hidden transition-all duration-300 hover:shadow-lg ${className}`}>
      <CardHeader className={`${compact ? "p-3 sm:p-4" : "p-4 sm:p-6"}`}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center space-x-3 min-w-0">
            <CardTitle className={`font-semibold text-gray-900 dark:text-white truncate ${
              compact ? "text-sm" : "text-base"
            }`}>
              Real-Time Activity
            </CardTitle>
            
            {/* Real-time indicator */}
            {realTime && (
              <div className="flex items-center space-x-1 flex-shrink-0">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-xs text-green-600 dark:text-green-400 font-medium">
                  Live
                </span>
              </div>
            )}
          </div>

          {/* Refresh button */}
          {onRefresh && (
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="p-2 text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200 flex-shrink-0 self-start sm:self-center"
              title="Refresh activities"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`} />
            </button>
          )}
        </div>

        {/* Filters and Search */}
        {showFilters && !compact && (
          <div className="mt-4 space-y-3">
            <div className="flex items-center space-x-2">
              <Search className="w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search activities..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1 px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-gray-400" />
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {activityTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}
      </CardHeader>

      <CardContent className={`${compact ? "p-3 sm:p-4 pt-0" : "p-4 sm:p-6 pt-0"}`}>
        {loading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, index) => (
              <div key={index} className="animate-pulse">
                <div className="flex items-center space-x-3 p-3 bg-gray-100 dark:bg-gray-800 rounded-lg">
                  <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                    <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredActivities.length > 0 ? (
          <div className={`space-y-2 ${compact ? "max-h-64" : "max-h-96"} overflow-y-auto`}>
            {filteredActivities.map((activity, index) => (
              <div
                key={activity.id || index}
                className={`flex items-start space-x-3 p-3 rounded-lg border transition-all duration-300 hover:shadow-md hover:scale-[1.01] cursor-pointer ${getActivityColor(activity.type)}`}
              >
                {/* Activity Icon */}
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-white dark:bg-gray-800 flex items-center justify-center shadow-sm">
                  {getActivityIcon(activity.type)}
                </div>

                {/* Activity Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className={`font-medium text-gray-900 dark:text-white ${
                      compact ? "text-xs" : "text-sm"
                    }`}>
                      {activity.description || `${activity.type} activity`}
                    </p>
                    
                    {/* Status */}
                    {activity.status && (
                      <div className="flex items-center space-x-1">
                        {getStatusIcon(activity.status)}
                        <span className={`text-xs font-medium capitalize ${
                          activity.status === "completed" ? "text-green-600 dark:text-green-400" :
                          activity.status === "pending" ? "text-yellow-600 dark:text-yellow-400" :
                          activity.status === "failed" ? "text-red-600 dark:text-red-400" :
                          "text-gray-600 dark:text-gray-400"
                        }`}>
                          {activity.status}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between mt-1">
                    <div className="flex items-center space-x-2">
                      {activity.user && (
                        <span className={`text-gray-600 dark:text-gray-400 ${
                          compact ? "text-xs" : "text-sm"
                        }`}>
                          by {activity.user}
                        </span>
                      )}
                      
                      {activity.entity?.name && (
                        <span className={`text-gray-500 dark:text-gray-400 ${
                          compact ? "text-xs" : "text-sm"
                        }`}>
                          • {activity.entity.name}
                        </span>
                      )}

                      {activity.amount && (
                        <span className={`font-medium ${
                          activity.type === "sale" ? "text-green-600 dark:text-green-400" :
                          activity.type === "purchase" ? "text-blue-600 dark:text-blue-400" :
                          "text-gray-600 dark:text-gray-400"
                        } ${compact ? "text-xs" : "text-sm"}`}>
                          • ${activity.amount.toLocaleString()}
                        </span>
                      )}
                    </div>

                    <span className={`text-gray-500 dark:text-gray-400 ${
                      compact ? "text-xs" : "text-sm"
                    }`}>
                      {formatTime(activity.timestamp || activity.createdAt)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Package className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              No activities found
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

export default RealTimeActivityFeed;

