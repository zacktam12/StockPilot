// src/components/header/Header.jsx
import React, { useState, useEffect, useRef } from "react";
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
  clearAllNotifications,
} from "../../store/slices/notificationSlice";
import { API_BASE_URL } from "../../config";
import { useOutsideClick } from "../../hooks/useOutsideClick";

const Header = () => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [userName, setUserName] = useState("");
  const [userAvatar, setUserAvatar] = useState("");
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const dispatch = useDispatch();
  const { list: notifications, unreadCount } = useSelector(
    (state) => state.notifications
  );
  const appName =
    useSelector((state) => state.settings.settings?.appName) || "StockPilot";
  const notificationSettings = useSelector(
    (state) => state.settings.settings?.notificationSettings
  );

  const profileRef = useRef(null);
  const notificationsRef = useRef(null);

  // Load user data from localStorage on component mount
  useEffect(() => {
    const storedUserName = localStorage.getItem("userName");
    const storedUserAvatar = localStorage.getItem("userAvatar");

    if (storedUserName) {
      setUserName(storedUserName);
    }
    if (storedUserAvatar) {
      setUserAvatar(storedUserAvatar);
    }
  }, []);

  // Listen for storage changes to update user data in real-time
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === "userName") {
        setUserName(e.newValue || "");
      }
      if (e.key === "userAvatar") {
        setUserAvatar(e.newValue || "");
      }
    };

    // Listen for custom events from Profile page
    const handleUserNameChange = (e) => {
      setUserName(e.detail.userName || "");
    };

    const handleUserAvatarChange = (e) => {
      setUserAvatar(e.detail.userAvatar || "");
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("userNameChanged", handleUserNameChange);
    window.addEventListener("userAvatarChanged", handleUserAvatarChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("userNameChanged", handleUserNameChange);
      window.removeEventListener("userAvatarChanged", handleUserAvatarChange);
    };
  }, []);

  useEffect(() => {
    dispatch(fetchNotifications());
  }, [dispatch]);

  useOutsideClick(profileRef, () => {
    if (isProfileOpen) setIsProfileOpen(false);
  });

  useOutsideClick(notificationsRef, () => {
    if (isNotificationsOpen) setIsNotificationsOpen(false);
  });

  const toggleProfile = () => {
    setIsProfileOpen(!isProfileOpen);
    setIsNotificationsOpen(false);
  };

  const toggleNotifications = () => {
    setIsNotificationsOpen(!isNotificationsOpen);
    setIsProfileOpen(false);
  };

  const handleSignOut = async () => {
    // Clear localStorage
    localStorage.removeItem("authToken");
    localStorage.removeItem("userRole");
    localStorage.removeItem("userName");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("userAvatar");

    // Navigate to login
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

  const handleClearAllNotifications = () => {
    if (
      window.confirm(
        "Are you sure you want to clear all notifications? This action cannot be undone."
      )
    ) {
      dispatch(clearAllNotifications())
        .unwrap()
        .then(() => {
          console.log("🔔 Header: All notifications cleared");
        })
        .catch((error) => {
          console.error("🔔 Header: Failed to clear notifications:", error);
        });
    }
  };

  const handleDebugNotifications = () => {
    console.log("🔍 Debugging notification system...");
    console.log("Current state:", {
      notifications: notifications,
      unreadCount,
    });

    // Test API directly
    const token = localStorage.getItem("authToken");
    console.log("Auth token exists:", !!token);

    if (token) {
      fetch(`${API_BASE_URL}/notifications`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })
        .then((res) => res.json())
        .then((data) => {
          console.log("🔍 Direct API response:", data);
        })
        .catch((err) => {
          console.error("🔍 Direct API error:", err);
        });
    }
  };

  // Only show notifications if enabled in settings
  const notificationsEnabled = notificationSettings?.systemUpdates !== false;

  return (
    <header className="flex-shrink-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 shadow-soft">
      <div className="h-16 px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Left side - Logo/Brand area */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-medium">
            <Building2 size={20} className="text-white" />
          </div>
          <div className="hidden sm:block">
            <h1 className="text-xl font-bold font-heading text-gray-900 dark:text-white">
              {appName}
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
          {notificationsEnabled && (
            <div className="relative flex-shrink-0" ref={notificationsRef}>
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
                    <div className="flex items-center gap-2">
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
                      <button
                        onClick={handleDebugNotifications}
                        className="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 font-medium transition-colors duration-200"
                        title="Debug notifications"
                      >
                        🔍
                      </button>
                    </div>
                  </div>

                  <div className="max-h-80 overflow-y-auto">
                    {notifications && notifications.length > 0 ? (
                      <>
                        {notifications.map((notification) => (
                          <div
                            key={notification.id}
                            className={`px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-start gap-3 transition-all duration-200 cursor-pointer ${
                              !notification.read
                                ? "bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500"
                                : ""
                            }`}
                            onClick={() =>
                              dispatch(markAsRead(notification.id))
                            }
                          >
                            <div className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center bg-gray-100 dark:bg-gray-700">
                              <span className="text-lg">
                                {getNotificationIcon(notification.type)}
                              </span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm text-gray-900 dark:text-white font-medium">
                                {notification.title}
                              </p>
                              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                                {notification.message}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                {formatTime(notification.createdAt)}
                              </p>
                            </div>
                            {!notification.read && (
                              <div className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full"></div>
                            )}
                          </div>
                        ))}
                      </>
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
          )}

          {/* Profile */}
          <div className="relative flex-shrink-0" ref={profileRef}>
            <button
              onClick={toggleProfile}
              className="flex items-center gap-2 p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none transition-all duration-300 hover:scale-105 group"
            >
              <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-semibold overflow-hidden shadow-medium">
                {userAvatar ? (
                  <img
                    src={userAvatar}
                    alt={userName || "Staff"}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <User size={16} />
                )}
              </div>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-200 hidden sm:block">
                {userName || "Staff"}
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
                    {userName || "Staff"}
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
