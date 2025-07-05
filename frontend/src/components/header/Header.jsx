// src/components/header/Header.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Bell,
  Search,
  Settings,
  LogOut,
  User,
  Menu,
  X,
  Sun,
  Moon,
  Building2,
  ChevronDown,
} from "lucide-react";
import { useTheme } from "../ThemeProvider";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchNotifications,
  markAsRead,
  markAllAsRead,
  addNotification,
} from "../../store/slices/notificationSlice";
import { API_BASE_URL } from "../../config";

const Header = ({ userName, userAvatar }) => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const dispatch = useDispatch();
  const { list: notifications, unreadCount } = useSelector(
    (state) => state.notifications
  );

  useEffect(() => {
    dispatch(fetchNotifications());
  }, [dispatch]);

  const toggleProfile = () => {
    setIsProfileOpen(!isProfileOpen);
    setIsNotificationsOpen(false);
  };

  const toggleNotifications = () => {
    setIsNotificationsOpen(!isNotificationsOpen);
    setIsProfileOpen(false);
  };

  const handleSignOut = async () => {
    navigate("/login");
  };

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
      case "user":
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

  return (
    <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 shadow-soft">
      <div className="h-16 px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Left side - Logo/Brand area */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-medium">
            <Building2 size={20} className="text-white" />
          </div>
          <div className="hidden sm:block">
            <h1 className="text-xl font-bold font-heading text-gray-900 dark:text-white">
              StockPilot
            </h1>
            <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">
              Inventory Management
            </p>
          </div>
        </div>

        {/* Right side - Action buttons */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Theme Switcher */}
          <button
            onClick={toggleTheme}
            className="p-2.5 text-gray-600 dark:text-gray-300 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none transition-all duration-300 hover:scale-110 flex-shrink-0 group"
            title={
              theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"
            }
          >
            <div className="w-5 h-5 flex items-center justify-center">
              {theme === "dark" ? (
                <Sun
                  size={18}
                  className="text-amber-500 group-hover:text-amber-600"
                />
              ) : (
                <Moon
                  size={18}
                  className="text-blue-600 group-hover:text-blue-700"
                />
              )}
            </div>
          </button>

          {/* Notifications */}
          <div className="relative flex-shrink-0">
            <button
              onClick={toggleNotifications}
              className="relative p-2.5 text-gray-600 dark:text-gray-300 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none transition-all duration-300 hover:scale-110 group"
            >
              <Bell
                size={18}
                className="group-hover:text-blue-600 dark:group-hover:text-blue-400"
              />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 h-5 w-5 text-xs flex items-center justify-center bg-red-500 text-white rounded-full font-semibold animate-pulse">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </button>

            {/* Notifications Dropdown */}
            {isNotificationsOpen && (
              <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-white dark:bg-gray-800 rounded-2xl shadow-strong border border-gray-200 dark:border-gray-700 z-50 overflow-hidden">
                <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-900/50">
                  <h3 className="font-semibold text-gray-900 dark:text-white text-sm">
                    Notifications
                  </h3>
                  {unreadCount > 0 && (
                    <button
                      onClick={() => dispatch(markAllAsRead())}
                      className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium transition-colors duration-200"
                    >
                      Mark all as read
                    </button>
                  )}
                </div>

                <div className="max-h-80 overflow-y-auto">
                  {notifications.length > 0 ? (
                    notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={`px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-start gap-3 transition-all duration-200 ${
                          !notification.read
                            ? "bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500"
                            : ""
                        }`}
                      >
                        <div className="flex-shrink-0 w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                          <span className="text-sm">
                            {getNotificationIcon(notification.type)}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-gray-900 dark:text-white font-medium">
                            {notification.message}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {formatTime(notification.created_at)}
                          </p>
                        </div>
                        {!notification.read && (
                          <button
                            onClick={() =>
                              dispatch(markAsRead(notification.id))
                            }
                            className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 flex-shrink-0 p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200"
                          >
                            <X size={14} />
                          </button>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="px-4 py-8 text-center">
                      <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Bell
                          size={20}
                          className="text-gray-400 dark:text-gray-500"
                        />
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
            )}
          </div>

          {/* Profile */}
          <div className="relative flex-shrink-0">
            <button
              onClick={toggleProfile}
              className="flex items-center gap-2 p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none transition-all duration-300 hover:scale-105 group"
            >
              <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-semibold overflow-hidden shadow-medium">
                {userAvatar ? (
                  <img
                    src={userAvatar}
                    alt={userName}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <User size={16} />
                )}
              </div>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-200 hidden sm:block">
                {userName}
              </span>
              <ChevronDown
                size={16}
                className="text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-200 transition-colors duration-200"
              />
            </button>

            {/* Profile Dropdown */}
            {isProfileOpen && (
              <div className="absolute right-0 mt-3 w-48 bg-white dark:bg-gray-800 rounded-2xl shadow-strong border border-gray-200 dark:border-gray-700 z-50 overflow-hidden">
                <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                    {userName}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    Signed in
                  </p>
                </div>

                <div className="py-2">
                  <a
                    href="/profile"
                    className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
                  >
                    <User
                      size={16}
                      className="text-gray-500 dark:text-gray-400"
                    />
                    Your Profile
                  </a>
                  <a
                    href="/settings"
                    className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
                  >
                    <Settings
                      size={16}
                      className="text-gray-500 dark:text-gray-400"
                    />
                    Settings
                  </a>
                  <div className="border-t border-gray-200 dark:border-gray-700 my-1"></div>
                  <button
                    onClick={handleSignOut}
                    className="flex items-center gap-3 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors duration-200 w-full text-left"
                  >
                    <LogOut size={16} />
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
