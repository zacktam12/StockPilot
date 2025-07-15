// sidebar.jsx

import React, { Children, useState } from "react";
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
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { logout as logoutAction } from "../../store/slices/authSlice";

const SidebarItem = ({ title, icon, path, isActive }) => {
  return (
    <Link
      to={path}
      className={`
        group flex items-center gap-x-3 px-4 py-3 rounded-xl transition-all duration-300 relative overflow-hidden
        ${
          isActive
            ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-medium transform scale-[1.02]"
            : "text-gray-700 hover:bg-blue-50 dark:text-gray-300 dark:hover:bg-gray-800 hover:text-blue-600 dark:hover:text-blue-400"
        }
      `}
    >
      {/* Active indicator */}
      {isActive && (
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-white rounded-r-full"></div>
      )}

      {/* Icon container */}
      <div
        className={`
        flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-300 group-hover:scale-110
        ${
          isActive
            ? "bg-white/20 text-white"
            : "bg-gray-100 dark:bg-gray-800 text-blue-600 dark:text-blue-400 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30"
        }
      `}
      >
        {React.cloneElement(icon, {
          size: 20,
        })}
      </div>

      {/* Title */}
      <span
        className={`font-medium transition-all duration-300 ${
          isActive ? "text-white" : "text-gray-700 dark:text-gray-300"
        }`}
      >
        {title}
      </span>

      {/* Hover effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white/10 dark:to-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
    </Link>
  );
};

const Sidebar = () => {
  const location = useLocation();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
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

  // Only show items matching the user's role
  const sidebarItems = [
    {
      title: "Dashboard",
      icon: <LayoutDashboard size={18} />,
      path: "/",
      role: "both",
    },
    {
      title: "Products",
      icon: <Package size={18} />,
      path: "/products",
      role: "both",
    },
    {
      title: "Categories",
      icon: <Tag size={18} />,
      path: "/categories",
      role: "admin",
    },
    {
      title: "Customers",
      icon: <Users size={18} />,
      path: "/customers",
      role: "both",
    },
    {
      title: "Suppliers",
      icon: <Truck size={18} />,
      path: "/suppliers",
      role: "admin",
    },
    {
      title: "Purchases",
      icon: <ShoppingCart size={18} />,
      path: "/purchases",
      role: "admin",
    },
    {
      title: "Sales",
      icon: <Receipt size={18} />,
      path: "/sales",
      role: "both",
    },
    {
      title: "Users",
      icon: <UserCircle size={18} />,
      path: "/users",
      role: "admin",
    },
    {
      title: "Reports",
      icon: <BarChart3 size={18} />,
      path: "/reports",
      role: "admin",
    },
    {
      title: "Settings",
      icon: <Settings size={18} />,
      path: "/settings",
      role: "admin",
    },
  ];

  // Filter sidebar items based on role
  const filteredSidebarItems = sidebarItems.filter(
    (item) =>
      item.role === "both" || (role === "admin" && item.role === "admin")
  );

  const toggleMobileSidebar = () => {
    setIsMobileOpen(!isMobileOpen);
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

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        className="md:hidden fixed top-4 left-4 z-50 p-3 rounded-xl bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 shadow-medium border border-gray-200 dark:border-gray-700 transition-all duration-300 hover:shadow-strong hover:scale-105"
        onClick={toggleMobileSidebar}
      >
        {isMobileOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/50 z-30 transition-opacity duration-300"
          onClick={toggleMobileSidebar}
        />
      )}

      {/* Fixed Sidebar */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-40 w-72 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700
          transform transition-all duration-300 ease-in-out shadow-strong flex flex-col
          md:translate-x-0 md:static md:z-auto md:shadow-none
          ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        {/* Fixed Header */}
        <div className="flex-shrink-0 p-6 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-2">
            <Package size={28} className="text-[#3f51b5]" />
            <h1 className="text-2xl font-bold text-gray-800 font-sans dark:text-white">
              {role === "admin" ? "Admin Portal" : "Staff Portal"}
            </h1>
          </div>
        </div>

        {/* Scrollable Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {filteredSidebarItems.map((item) => (
            <SidebarItem
              key={item.path}
              title={item.title}
              icon={item.icon}
              path={item.path}
              isActive={location.pathname === item.path}
              role={item.role}
              userRole={role}
            />
          ))}
        </nav>

        {/* Fixed Footer */}
        <div className="flex-shrink-0 p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
          <Link
            to="/profile"
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-700 transition-all duration-300 group"
          >
            <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <UserCircle
                size={16}
                className="text-blue-600 dark:text-blue-400"
              />
            </div>
            <span className="font-medium">My Profile</span>
          </Link>

          {/* <button
            className="w-full mt-2 flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-300 group"
            onClick={handleLogout}
          >
            <div className="w-8 h-8 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <LogOut size={16} className="text-red-600 dark:text-red-400" />
            </div>
            <span className="font-medium">Logout</span>
          </button> */}
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
