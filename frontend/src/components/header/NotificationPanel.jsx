// src/components/header/NotificationPanel.jsx
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Bell,
  Package,
  ShoppingCart,
  Users,
  Truck,
  DollarSign,
  X,
} from "lucide-react";
import {
  markAsRead,
  markAllAsRead,
  clearAllNotifications,
} from "../../store/slices/notificationSlice";
import {
  fetchLowStockAlerts,
  fetchActivities,
} from "../../store/slices/dashboardSlice";

const NotificationPanel = ({ isOpen, onClose }) => {
  const dispatch = useDispatch();
  // System notifications from notificationSlice
  const { list: notifications, unreadCount } = useSelector(
    (state) => state.notifications
  );

  // Stock alerts and activities from dashboardSlice
  const { lowStockAlerts, activities, lowStockLoading, activitiesLoading } =
    useSelector((state) => state.dashboard);

  // Fetch stock alerts and activities when panel opens
  useEffect(() => {
    if (isOpen) {
      dispatch(fetchLowStockAlerts({ page: 1, limit: 5 }));
      dispatch(fetchActivities({ page: 1, limit: 5 }));
    }
  }, [isOpen, dispatch]);

  const stockAlertsData = lowStockAlerts?.data || [];
  const activitiesData = activities?.data || [];

  // Calculate total notification count
  const totalStockAlerts = stockAlertsData.length;
  const totalActivities = activitiesData.length;
  const totalNotifications = unreadCount + totalStockAlerts + totalActivities;

  const getNotificationIcon = (type) => {
    switch (type) {
      case "low_stock":
        return "⚠️";
      case "purchase":
        return "📦";
      case "sale":
        return "💰";
      case "customer":
        return "👤";
      case "staff":
        return "👥";
      case "supplier":
        return "🏭";
      case "category":
        return "📁";
      case "system":
        return "🖥️";
      default:
        return "ℹ️";
    }
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHrs = Math.floor(diffMin / 60);
    const diffDays = Math.floor(diffHrs / 24);

    if (diffSec < 60) return "Just now";
    if (diffMin < 60) return `${diffMin}m ago`;
    if (diffHrs < 24) return `${diffHrs}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const getActivityIcon = (type) => {
    const iconProps = { size: 16, className: "transition-colors duration-300" };

    switch (type) {
      case "sale":
        return (
          <ShoppingCart
            {...iconProps}
            className="text-green-600 dark:text-green-400"
          />
        );
      case "purchase":
        return (
          <Package {...iconProps} className="text-blue-600 dark:text-blue-400" />
        );
      case "customer":
        return (
          <Users {...iconProps} className="text-purple-600 dark:text-purple-400" />
        );
      case "supplier":
        return (
          <Truck {...iconProps} className="text-orange-600 dark:text-orange-400" />
        );
      case "low_stock":
        return (
          <AlertTriangle
            {...iconProps}
            className="text-red-600 dark:text-red-400"
          />
        );
      case "payment":
        return (
          <DollarSign
            {...iconProps}
            className="text-green-600 dark:text-green-400"
          />
        );
      default:
        return (
          <Package {...iconProps} className="text-gray-600 dark:text-gray-400" />
        );
    }
  };

  const getStockStatusColor = (status) => {
    switch (status) {
      case "out-of-stock":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 border-red-200 dark:border-red-800";
      case "low-stock":
        return "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300 border-amber-200 dark:border-amber-800";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300 border-gray-200 dark:border-gray-800";
    }
  };

  const handleClearAllNotifications = () => {
    if (
      window.confirm(
        "Are you sure you want to clear all notifications? This action cannot be undone."
      )
    ) {
      dispatch(clearAllNotifications())
        .unwrap()
        .catch((error) => {
          console.error("Failed to clear notifications:", error);
        });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="absolute right-0 mt-3 w-80 bg-white dark:bg-gray-800 rounded-xl shadow-strong border border-gray-200 dark:border-gray-700 z-50 overflow-hidden">
      {/* Header */}
      <div className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
        <div className="px-4 py-2.5 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-gray-900 dark:text-white text-sm">
              All Notifications
            </h3>
            {totalNotifications > 0 && (
              <span className="px-2 py-0.5 text-xs font-medium bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-full">
                {totalNotifications}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
            title="Close"
          >
            <X size={16} className="text-gray-500 dark:text-gray-400" />
          </button>
        </div>
      </div>

      {/* Actions Bar */}
      {(unreadCount > 0 || (notifications && notifications.length > 0)) && (
        <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700 flex justify-end gap-2">
          {unreadCount > 0 && (
            <button
              onClick={() => dispatch(markAllAsRead())}
              className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium transition-colors duration-200"
            >
              Mark all as read
            </button>
          )}
          {notifications && notifications.length > 0 && (
            <button
              onClick={handleClearAllNotifications}
              className="text-xs text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 font-medium transition-colors duration-200"
            >
              Clear all
            </button>
          )}
        </div>
      )}

      {/* Content */}
      <div className="max-h-80 overflow-y-auto">
        <div>
          {/* System Notifications */}
          {notifications && notifications.length > 0 && (
            <div>
              <div className="px-3 py-1.5 bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700">
                <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
                  System Notifications
                </h4>
              </div>
              {notifications.slice(0, 2).map((notification) => (
                <div
                  key={notification.id}
                  className={`px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-start gap-2 transition-all duration-200 cursor-pointer ${
                    !notification.read
                      ? "bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500"
                      : ""
                  }`}
                  onClick={() => dispatch(markAsRead(notification.id))}
                >
                  <div className="flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center bg-gray-100 dark:bg-gray-700">
                    <span className="text-base">
                      {getNotificationIcon(notification.type)}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-900 dark:text-white font-medium">
                      {notification.title}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5 line-clamp-1">
                      {notification.message}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                      {formatTime(notification.createdAt)}
                    </p>
                  </div>
                  {!notification.read && (
                    <div className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full"></div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Stock Alerts */}
          {stockAlertsData && stockAlertsData.length > 0 && (
            <div>
              <div className="px-3 py-1.5 bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700">
                <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
                  Stock Alerts
                </h4>
              </div>
              {stockAlertsData.slice(0, 2).map((product) => (
                <div
                  key={product.id}
                  className="px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 cursor-pointer border-l-4 border-red-500"
                >
                  <div className="flex items-start gap-2">
                    <div className="flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center bg-red-100 dark:bg-red-900/30">
                      <Package size={14} className="text-red-600 dark:text-red-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-gray-900 dark:text-white font-medium truncate">
                          {product.name}
                        </p>
                        <span
                          className={`text-xs px-1.5 py-0.5 rounded-full border ${getStockStatusColor(
                            product.status
                          )}`}
                        >
                          {product.status.replace("-", " ")}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
                        Qty: {product.quantity} • {product.category || "Uncategorized"}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Recent Activities */}
          {activitiesData && activitiesData.length > 0 && (
            <div>
              <div className="px-3 py-1.5 bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700">
                <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
                  Recent Activity
                </h4>
              </div>
              {activitiesData.slice(0, 2).map((activity) => (
                <div
                  key={activity.id}
                  className="px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 cursor-pointer"
                >
                  <div className="flex items-start gap-2">
                    <div className="flex-shrink-0 w-7 h-7 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                      {getActivityIcon(activity.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-900 dark:text-white font-medium truncate">
                        {activity.type === "purchase" ? "Purchase" : "Sale"} - {activity.relatedEntity?.name || "Anonymous"}
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
                        ${activity.amount?.toFixed(2)} • {formatTime(activity.date)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Empty state */}
          {(!notifications || notifications.length === 0) &&
            (!stockAlertsData || stockAlertsData.length === 0) &&
            (!activitiesData || activitiesData.length === 0) && (
              <div className="px-4 py-8 text-center">
                <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Bell size={20} className="text-gray-400 dark:text-gray-500" />
                </div>
                <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">
                  No notifications
                </p>
                <p className="text-gray-400 dark:text-gray-500 text-xs mt-1">
                  You're all caught up!
                </p>
              </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default NotificationPanel;

