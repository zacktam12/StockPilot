// Enhanced Sidebar with Professional Design
import React, { Children, useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  Users,
  Tag,
  Truck,
  ShoppingCart,
  Receipt,
  UserCircle,
  BarChart3,
  Menu,
  X,
  LogOut,
  Settings,
  Home,
  Building2,
  ChevronRight,
  Sparkles,
  Zap,
  Shield,
  Crown,
  Activity,
  TrendingUp,
  Bell,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import Logo from "../shared/Logo";
import { logout as logoutAction } from "../../store/slices/authSlice";

// Enhanced Sidebar Item with Professional Animations
const SidebarItem = ({ title, icon, path, isActive, badge, description }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Link
      to={path}
      className={`
        sidebar-item group relative flex items-center gap-x-3 px-3 py-2.5 rounded-xl transition-all duration-500 ease-out
        ${isActive 
          ? "sidebar-item-active bg-gradient-to-r from-blue-500 via-blue-600 to-indigo-600 text-white shadow-xl shadow-blue-500/25 transform scale-[1.02] border border-blue-400/20" 
          : "text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 dark:text-gray-300 dark:hover:from-gray-800 dark:hover:to-gray-700 hover:text-blue-600 dark:hover:text-blue-400 hover:shadow-lg hover:shadow-blue-500/10"
        }
      `}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Animated Background Glow */}
      {isActive && (
        <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-indigo-400/20 rounded-2xl animate-pulse"></div>
      )}
      
      {/* Active Indicator with Animation */}
      {isActive && (
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-white rounded-r-full shadow-lg animate-pulse"></div>
      )}

      {/* Icon Container with Enhanced Styling */}
      <div
        className={`
          relative flex items-center justify-center w-9 h-9 rounded-lg transition-all duration-500 group-hover:scale-110 group-hover:rotate-3
          ${isActive
            ? "bg-white/20 text-white shadow-lg backdrop-blur-sm"
            : "bg-gray-100 dark:bg-gray-800 text-blue-600 dark:text-blue-400 group-hover:bg-gradient-to-br group-hover:from-blue-100 group-hover:to-indigo-100 dark:group-hover:from-blue-900/30 dark:group-hover:to-indigo-900/30 group-hover:shadow-md"
          }
        `}
      >
        {React.cloneElement(icon, {
          size: 20,
          className: `sidebar-icon transition-all duration-300 ${isHovered ? 'scale-110' : ''}`
        })}
        
        {/* Icon Glow Effect */}
        {isActive && (
          <div className="absolute inset-0 bg-white/30 rounded-xl blur-sm"></div>
        )}
      </div>

      {/* Content Container */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <span
            className={`font-semibold text-sm transition-all duration-300 ${
              isActive ? "text-white" : "text-gray-700 dark:text-gray-300"
            }`}
          >
            {title}
          </span>
          
          {/* Badge */}
          {badge && (
            <span className="sidebar-badge px-2 py-0.5 text-xs font-bold bg-red-500 text-white rounded-full">
              {badge}
            </span>
          )}
        </div>
        
        {/* Description */}
        {description && (
          <p className={`text-xs mt-0.5 transition-all duration-300 ${
            isActive ? "text-blue-100" : "text-gray-500 dark:text-gray-400"
          }`}>
            {description}
          </p>
        )}
      </div>

      {/* Chevron Arrow */}
      <ChevronRight 
        size={16} 
        className={`transition-all duration-300 ${
          isActive 
            ? "text-white/70 group-hover:text-white group-hover:translate-x-1" 
            : "text-gray-400 group-hover:text-blue-500 group-hover:translate-x-1"
        }`} 
      />

      {/* Hover Ripple Effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl"></div>
    </Link>
  );
};

const Sidebar = () => {
  const location = useLocation();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Get user role from Redux or localStorage (for SSR/refresh safety)
  const reduxUser = useSelector((state) => state.auth?.user);
  let role =
    reduxUser?.role?.role_type ||
    reduxUser?.role || // fallback if role is string
    (typeof window !== "undefined"
      ? JSON.parse(localStorage.getItem("user"))?.role?.role_type ||
        localStorage.getItem("userRole")
      : undefined);

  // Get settings for dynamic app name
  const settings = useSelector((state) => state.settings?.settings);
  const appName = settings?.appName || "StockPilot";

  // Enhanced sidebar items with descriptions and badges
  const sidebarItems = [
    {
      title: "Dashboard",
      icon: <LayoutDashboard size={18} />,
      path: "/",
      role: "both",
      description: "Overview & Analytics",
      badge: null,
    },
    {
      title: "Products",
      icon: <Package size={18} />,
      path: "/products",
      role: "both",
      description: "Product Management",
      badge: null,
    },
    {
      title: "Categories",
      icon: <Tag size={18} />,
      path: "/categories",
      role: "admin",
      description: "Product Categories",
      badge: null,
    },
    {
      title: "Customers",
      icon: <Users size={18} />,
      path: "/customers",
      role: "both",
      description: "Customer Database",
      badge: null,
    },
    {
      title: "Suppliers",
      icon: <Truck size={18} />,
      path: "/suppliers",
      role: "admin",
      description: "Vendor Management",
      badge: null,
    },
    {
      title: "Purchases",
      icon: <ShoppingCart size={18} />,
      path: "/purchases",
      role: "admin",
      description: "Purchase Orders",
      badge: null,
    },
    {
      title: "Sales",
      icon: <Receipt size={18} />,
      path: "/sales",
      role: "both",
      description: "Sales Transactions",
      badge: null,
    },
    {
      title: "Users",
      icon: <UserCircle size={18} />,
      path: "/users",
      role: "admin",
      description: "User Management",
      badge: null,
    },
    {
      title: "Reports",
      icon: <BarChart3 size={18} />,
      path: "/reports",
      role: "admin",
      description: "Analytics & Insights",
      badge: null,
    },
    {
      title: "Settings",
      icon: <Settings size={18} />,
      path: "/settings",
      role: "admin",
      description: "System Configuration",
      badge: null,
    },
  ];

  // Filter sidebar items based on role only
  const filteredSidebarItems = sidebarItems.filter(
    (item) => item.role === "both" || (role === "admin" && item.role === "admin")
  );

  const toggleMobileSidebar = () => {
    setIsMobileOpen(!isMobileOpen);
  };

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  const handleLogout = () => {
    // Only remove auth-related keys
    localStorage.removeItem("authToken");
    localStorage.removeItem("userRole");
    localStorage.removeItem("userName");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("user");
    // Dispatch Redux logout action
    dispatch(logoutAction());
    // Redirect to login
    navigate("/login", { replace: true });
  };

  // Get user info for profile section
  const userName = localStorage.getItem("firstName") && localStorage.getItem("lastName") 
    ? `${localStorage.getItem("firstName")} ${localStorage.getItem("lastName")}`.trim()
    : localStorage.getItem("userName") || "Staff";
  
  const userAvatar = localStorage.getItem("userAvatar") || "";
  const userRole = role === "admin" ? "Administrator" : "Staff";

  return (
    <>
      {/* Enhanced Mobile Menu Button */}
      <button
        className="md:hidden fixed top-4 left-4 z-50 p-3 rounded-2xl bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-xl shadow-blue-500/25 border border-blue-400/20 transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/40 hover:scale-105"
        onClick={toggleMobileSidebar}
      >
        {isMobileOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Enhanced Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-30 transition-all duration-300"
          onClick={toggleMobileSidebar}
        />
      )}

      {/* Enhanced Fixed Sidebar */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-40 w-72 bg-gradient-to-b from-white via-gray-50 to-white dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 border-r border-gray-200/50 dark:border-gray-700/50
          transform transition-all duration-500 ease-out shadow-2xl shadow-gray-900/10 dark:shadow-gray-900/50 flex flex-col backdrop-blur-xl
          md:translate-x-0 md:static md:z-auto md:shadow-none
          ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        {/* Enhanced Header with Gradient */}
        <div className="flex-shrink-0 p-4 border-b border-gray-200/50 dark:border-gray-700/50 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Logo size="default" showText={false} showStatus={true} />
              <div>
                <h1 className="text-xl font-bold text-gray-800 dark:text-white font-heading">
                  {appName}
                </h1>
                <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">
                  {role === "admin" ? "Admin Portal" : "Staff Portal"}
                </p>
              </div>
            </div>
            
            {/* Collapse Toggle Button */}
            <button
              onClick={toggleCollapse}
              className="p-2 rounded-xl bg-white/50 dark:bg-gray-700/50 hover:bg-white dark:hover:bg-gray-600 transition-all duration-300 hover:scale-110"
            >
              <ChevronRight size={16} className="text-gray-600 dark:text-gray-300" />
            </button>
          </div>
        </div>


        {/* Fixed Navigation - No Scroll */}
        <nav className="flex-1 p-3 space-y-1">
          {filteredSidebarItems.map((item) => (
            <SidebarItem
              key={item.path}
              title={item.title}
              icon={item.icon}
              path={item.path}
              isActive={location.pathname === item.path}
              badge={item.badge}
              description={item.description}
            />
          ))}
        </nav>

        {/* Enhanced User Profile Section */}
        <div className="flex-shrink-0 p-3 border-t border-gray-200/50 dark:border-gray-700/50 bg-gradient-to-r from-gray-50 to-blue-50 dark:from-gray-800 dark:to-gray-700">
          <div className="sidebar-profile flex items-center gap-3 p-3 rounded-2xl bg-white/50 dark:bg-gray-700/50 hover:bg-white dark:hover:bg-gray-600 transition-all duration-300 group cursor-pointer">
            <div className="relative">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-white font-semibold shadow-lg shadow-blue-500/25">
                {userAvatar ? (
                  <img
                    src={userAvatar}
                    alt={userName}
                    className="w-full h-full object-cover rounded-xl"
                  />
                ) : (
                  <UserCircle size={20} />
                )}
              </div>
              <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm text-gray-800 dark:text-white truncate">
                {userName}
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                {userRole}
              </p>
            </div>
            <ChevronRight size={14} className="text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors duration-300" />
          </div>

          {/* Quick Actions */}
          <div className="mt-3 grid grid-cols-2 gap-2">
            <Link
              to="/profile"
              className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-600 transition-all duration-300 group"
            >
              <UserCircle size={14} className="text-blue-500" />
              <span>Profile</span>
            </Link>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-300 group"
            >
              <LogOut size={14} />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
