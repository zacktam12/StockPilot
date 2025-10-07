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
  ChevronDown,
  CheckCircle,
} from "lucide-react";
import { useTheme } from "../ThemeProvider";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchNotifications,
  markAsRead,
  markAllAsRead,
  clearAllNotifications,
} from "../../store/slices/notificationSlice";
import { fetchSettings, updateSettings, resetSettings } from "../../store/slices/settingsSlice";
import { setUser, logout } from "../../store/slices/authSlice";
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
  const settings = useSelector((state) => state.settings.settings);
  const settingsLoading = useSelector((state) => state.settings.loading);
  const profileRef = useRef(null);
  const notificationsRef = useRef(null);

  // Get user role from Redux or localStorage
  const reduxUser = useSelector((state) => state.auth?.user);
  const role = reduxUser?.role?.role_type || 
    reduxUser?.role || 
    localStorage.getItem("userRole") || 
    "staff";

  // Load user data from localStorage on component mount
  useEffect(() => {
    const storedFirstName = localStorage.getItem("firstName");
    const storedLastName = localStorage.getItem("lastName");
    const storedUserName = localStorage.getItem("userName"); // Keep for backward compatibility
    const storedUserAvatar = localStorage.getItem("userAvatar");
    const storedUserEmail = localStorage.getItem("userEmail");
    const storedUserRole = localStorage.getItem("userRole");

    // Use firstName/lastName if available, fallback to userName
    const displayName = storedFirstName && storedLastName 
      ? `${storedFirstName} ${storedLastName}`.trim()
      : storedUserName || "Staff";
    
    setUserName(displayName);
    
    if (storedUserAvatar) {
      setUserAvatar(storedUserAvatar);
    }

    // Update Redux auth state with current user data
    if (displayName || storedUserEmail || storedUserRole) {
      dispatch(setUser({
        firstName: storedFirstName || "",
        lastName: storedLastName || "",
        name: displayName,
        email: storedUserEmail || "admin@example.com",
        avatar: storedUserAvatar || "",
        role: storedUserRole || "admin",
      }));
    }
  }, [dispatch]);

  // Listen for storage changes to update user data in real-time
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === "firstName" || e.key === "lastName" || e.key === "userName") {
        // Recalculate display name when firstName, lastName, or userName changes
        const firstName = localStorage.getItem("firstName");
        const lastName = localStorage.getItem("lastName");
        const userName = localStorage.getItem("userName");
        const displayName = firstName && lastName 
          ? `${firstName} ${lastName}`.trim()
          : userName || "Staff";
        setUserName(displayName);
      }
      if (e.key === "userAvatar") {
        setUserAvatar(e.newValue || "");
      }
      
      // Update Redux auth state when localStorage changes
      const firstName = localStorage.getItem("firstName");
      const lastName = localStorage.getItem("lastName");
      const userName = localStorage.getItem("userName");
      const displayName = firstName && lastName 
        ? `${firstName} ${lastName}`.trim()
        : userName || "Staff";
      
      const currentUserData = {
        firstName: firstName || "",
        lastName: lastName || "",
        name: displayName,
        email: localStorage.getItem("userEmail") || "admin@example.com",
        avatar: localStorage.getItem("userAvatar") || "",
        role: localStorage.getItem("userRole") || "admin",
      };
      dispatch(setUser(currentUserData));
    };

    // Listen for custom events from Profile page
    const handleUserNameChange = (e) => {
      setUserName(e.detail.userName || "");
      // Update Redux state
      const firstName = localStorage.getItem("firstName");
      const lastName = localStorage.getItem("lastName");
      const userName = localStorage.getItem("userName");
      const displayName = firstName && lastName 
        ? `${firstName} ${lastName}`.trim()
        : userName || "Staff";
      
      const currentUserData = {
        firstName: firstName || "",
        lastName: lastName || "",
        name: displayName,
        email: localStorage.getItem("userEmail") || "admin@example.com",
        avatar: localStorage.getItem("userAvatar") || "",
        role: localStorage.getItem("userRole") || "admin",
      };
      dispatch(setUser(currentUserData));
    };

    const handleUserAvatarChange = (e) => {
      setUserAvatar(e.detail.userAvatar || "");
      // Update Redux state
      const firstName = localStorage.getItem("firstName");
      const lastName = localStorage.getItem("lastName");
      const userName = localStorage.getItem("userName");
      const displayName = firstName && lastName 
        ? `${firstName} ${lastName}`.trim()
        : userName || "Staff";
      
      const currentUserData = {
        firstName: firstName || "",
        lastName: lastName || "",
        name: displayName,
        email: localStorage.getItem("userEmail") || "admin@example.com",
        avatar: localStorage.getItem("userAvatar") || "",
        role: localStorage.getItem("userRole") || "admin",
      };
      dispatch(setUser(currentUserData));
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("userNameChanged", handleUserNameChange);
    window.addEventListener("userAvatarChanged", handleUserAvatarChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("userNameChanged", handleUserNameChange);
      window.removeEventListener("userAvatarChanged", handleUserAvatarChange);
    };
  }, [dispatch]);

  useEffect(() => {
    dispatch(fetchNotifications());
    dispatch(fetchSettings());
  }, [dispatch]);

  // Listen for settings changes and update local state
  useEffect(() => {
    if (settings) {
      // Settings have been updated, force re-render
      console.log("Settings updated in header:", settings);
    }
  }, [settings]);


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
    localStorage.removeItem("firstName");
    localStorage.removeItem("lastName");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("userAvatar");
    localStorage.removeItem("phone");
    localStorage.removeItem("userJoinDate");
    localStorage.removeItem("userLastLogin");

    // Reset Redux store
    dispatch(resetSettings());
    dispatch(logout());
    
    // Clear all Redux state by dispatching reset actions for all slices
    // This ensures clean state on next login
    
    // Navigate to login
    navigate("/login");
  };

  // Handle theme changes from settings
  const handleThemeChange = (newTheme) => {
    if (newTheme !== theme) {
      toggleTheme();
      // Update settings to reflect the change
      dispatch(updateSettings({
        endpoint: "/settings",
        data: { theme: newTheme }
      }));
    }
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

  // Always show notifications (no settings to control this anymore)
  const notificationsEnabled = true;

  return (
    <header className="flex-shrink-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 shadow-soft">
      <div className="h-16 px-4 sm:px-6 lg:px-8 flex items-center justify-end">

        {/* Right side - Action buttons */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Theme Switcher */}
          <button
            onClick={() => handleThemeChange(theme === "dark" ? "light" : "dark")}
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

          {/* Enhanced Profile Dropdown */}
          <div className="relative flex-shrink-0" ref={profileRef}>
            <button
              onClick={toggleProfile}
              className="flex items-center gap-3 p-2.5 rounded-2xl hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 dark:hover:from-gray-800 dark:hover:to-gray-700 focus:outline-none transition-all duration-300 hover:scale-105 group border border-transparent hover:border-blue-200 dark:hover:border-gray-600"
            >
              <div className="relative">
                <div className="h-10 w-10 rounded-2xl bg-white border-2 border-gray-200 dark:border-gray-600 flex items-center justify-center text-gray-600 dark:text-gray-400 font-semibold overflow-hidden shadow-lg ring-2 ring-white dark:ring-gray-800 pointer-events-none">
                  {userAvatar ? (
                    <img
                      src={userAvatar}
                      alt={userName || "Staff"}
                      className="h-full w-full object-cover pointer-events-none"
                    />
                  ) : (
                    <User size={18} className="pointer-events-none text-gray-600 dark:text-gray-400" />
                  )}
                </div>
                {/* Online Status Indicator */}
                <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-white dark:border-gray-900 shadow-sm pointer-events-none"></div>
              </div>
              <div className="hidden sm:block text-left">
                <span className="text-sm font-semibold text-gray-800 dark:text-white block">
                  {userName || "Staff"}
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {role === "admin" ? "Administrator" : "Staff"}
                </span>
              </div>
              <ChevronDown
                size={16}
                className={`text-gray-500 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-all duration-300 ${
                  isProfileOpen ? 'rotate-180' : 'rotate-0'
                }`}
              />
            </button>

            {/* Enhanced Profile Dropdown */}
            {isProfileOpen && (
              <div className="absolute right-0 w-44 bg-white dark:bg-gray-800 rounded-xl shadow-2xl shadow-gray-900/20 dark:shadow-gray-900/50 border border-gray-200/50 dark:border-gray-700/50 z-50 overflow-hidden backdrop-blur-xl animate-in slide-in-from-top-2 duration-300" style={{ marginTop: '2px' }}>

                {/* Compact Menu Items */}
                <div className="py-1">
                  <a
                    href="/profile"
                    className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 dark:hover:from-gray-700 dark:hover:to-gray-600 transition-all duration-200 group"
                  >
                    <div className="w-6 h-6 rounded-md bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                      <User size={14} className="text-blue-600 dark:text-blue-400" />
                    </div>
                    <span className="font-medium">Your Profile</span>
                  </a>
                  
                  <a
                    href="/settings"
                    className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gradient-to-r hover:from-gray-50 hover:to-blue-50 dark:hover:from-gray-700 dark:hover:to-gray-600 transition-all duration-200 group"
                  >
                    <div className="w-6 h-6 rounded-md bg-gray-100 dark:bg-gray-700 flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                      <Settings size={14} className="text-gray-600 dark:text-gray-400" />
                    </div>
                    <span className="font-medium">Settings</span>
                  </a>

                  <div className="border-t border-gray-200/50 dark:border-gray-700/50 my-1"></div>
                  
                  <button
                    onClick={handleSignOut}
                    className="flex items-center gap-2 px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gradient-to-r hover:from-red-50 hover:to-pink-50 dark:hover:from-red-900/20 dark:hover:to-pink-900/20 transition-all duration-200 w-full text-left group"
                  >
                    <div className="w-6 h-6 rounded-md bg-red-100 dark:bg-red-900/30 flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                      <LogOut size={14} />
                    </div>
                    <span className="font-medium">Sign Out</span>
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
