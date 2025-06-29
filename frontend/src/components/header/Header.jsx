// src/components/header/Header.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, User, Settings, X, Sun, Moon } from "lucide-react";
import { useTheme } from "../ThemeProvider";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchNotifications,
  markAsRead,
  markAllAsRead,
  addNotification,
} from "../../store/slices/notificationSlice";
import io from "socket.io-client";
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
    const socket = io(API_BASE_URL);
    socket.on("new-notification", (notification) => {
      dispatch(addNotification(notification));
    });
    return () => socket.disconnect();
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
    <header className="bg-white border-b border-gray-200 h-16 dark:bg-gray-900 dark:border-gray-800">
      <div className="h-full px-2 sm:px-4 flex items-center justify-between">
        {/* Left side - Logo/Brand area */}
        <div className="flex-shrink-0 max-[770px]:flex-1 max-[770px]:flex max-[770px]:justify-center">
          <h1 className="text-lg font-bold text-gray-900 dark:text-white">
            StockPilot
          </h1>
        </div>

        {/* Right side - Action buttons */}
        <div className="flex items-center gap-1 sm:gap-2 md:gap-3">
          {/* Theme Switcher - Always visible */}
          <button
            onClick={toggleTheme}
            className="p-1.5 sm:p-2 text-[#3f51b5] rounded-full hover:bg-blue-50 dark:hover:bg-gray-800 focus:outline-none transition-all duration-300 hover:scale-110 flex-shrink-0"
            title={
              theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"
            }
          >
            {theme === "dark" ? (
              <Sun size={18} className="sm:w-5 sm:h-5" />
            ) : (
              <Moon size={18} className="sm:w-5 sm:h-5" />
            )}
          </button>

          {/* Notifications */}
          <div className="relative flex-shrink-0">
            <button
              onClick={toggleNotifications}
              className="relative p-1.5 sm:p-2 text-gray-600 dark:text-gray-300 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none transition-all duration-300 hover:scale-110"
            >
              <Bell size={18} className="sm:w-5 sm:h-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 h-4 w-4 sm:h-5 sm:w-5 text-xs flex items-center justify-center bg-red-500 text-white rounded-full">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </button>
            {isNotificationsOpen && (
              <div className="absolute right-0 mt-2 w-72 sm:w-80 bg-white dark:bg-gray-800 rounded-lg shadow-lg py-1 z-50 border border-gray-200 dark:border-gray-700 max-h-[calc(100vh-120px)] overflow-hidden">
                <div className="px-3 sm:px-4 py-2 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-sm">
                    Notifications
                  </h3>
                  {unreadCount > 0 && (
                    <button
                      onClick={() => dispatch(markAllAsRead())}
                      className="text-xs sm:text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300"
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
                        className={`px-3 sm:px-4 py-2 sm:py-3 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-start gap-2 sm:gap-3 ${
                          !notification.read
                            ? "bg-blue-50 dark:bg-blue-900/20"
                            : ""
                        }`}
                      >
                        <span className="text-lg sm:text-xl flex-shrink-0">
                          {getNotificationIcon(notification.type)}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs sm:text-sm text-gray-900 dark:text-gray-100">
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
                            className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 flex-shrink-0"
                          >
                            <X size={14} className="sm:w-4 sm:h-4" />
                          </button>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="px-3 sm:px-4 py-6 text-center text-gray-500 dark:text-gray-400 text-sm">
                      No notifications
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
              className="flex items-center gap-1 sm:gap-2 focus:outline-none transition-all duration-300 hover:scale-105"
            >
              <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center text-indigo-700 dark:text-indigo-300 font-medium overflow-hidden">
                {userAvatar ? (
                  <img
                    src={userAvatar}
                    alt={userName}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <User size={14} className="sm:w-4 sm:h-4" />
                )}
              </div>
              <span className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-200 hidden sm:block">
                {userName}
              </span>
            </button>
            {isProfileOpen && (
              <div className="absolute right-0 mt-2 w-40 sm:w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 z-10 border border-gray-200 dark:border-gray-700">
                <a
                  href="/profile"
                  className="block px-3 sm:px-4 py-2 text-xs sm:text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                >
                  <User size={14} className="sm:w-4 sm:h-4" />
                  Your Profile
                </a>
                <a
                  href="/settings"
                  className="block px-3 sm:px-4 py-2 text-xs sm:text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                >
                  <Settings size={14} className="sm:w-4 sm:h-4" />
                  Settings
                </a>
                <div className="border-t border-gray-200 dark:border-gray-700 my-1"></div>
                <button
                  onClick={handleSignOut}
                  className="block w-full text-left px-3 sm:px-4 py-2 text-xs sm:text-sm text-red-700 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  Sign out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
