// sidebar.jsx

import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
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
} from "lucide-react";
import { useTheme } from "../ThemeProvider";

const SidebarItem = ({ title, icon, path, isActive }) => {
  return (
    <Link
      to={path}
      className={`
        flex items-center gap-x-3 px-4 py-2 rounded-lg transition-colors duration-200
        ${
          isActive
            ? "bg-gray-200 text-gray-800 font-semibold dark:bg-gray-800 dark:text-white"
            : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
        }
      `}
    >
      <span className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-900">
        {React.cloneElement(icon, {
          className: "text-[#3f51b5]",
          size: 20,
        })}
      </span>
      <span className="font-medium">{title}</span>
    </Link>
  );
};

const Sidebar = ({ userRole }) => {
  const location = useLocation();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

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

  const toggleMobileSidebar = () => {
    setIsMobileOpen(!isMobileOpen);
  };

  return (
    <>
      <button
        className="md:hidden fixed top-4 left-4 z-50 p-2 rounded-md bg-gray-200 text-gray-800 shadow-md dark:bg-gray-800 dark:text-white"
        onClick={toggleMobileSidebar}
      >
        {isMobileOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      <aside
        className={`
          fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-gray-200
          dark:bg-gray-900 dark:border-gray-800
          transform transition-transform duration-300 ease-in-out
          md:translate-x-0 md:static md:flex md:flex-col
          ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        <div className="p-6 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-2">
            <Package size={28} className="text-[#3f51b5]" />
            <h1 className="text-2xl font-bold text-gray-800 font-sans dark:text-white">
              {userRole === "admin" ? "Admin Portal" : "Staff Portal"}
            </h1>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {sidebarItems.map((item) => (
            <SidebarItem
              key={item.path}
              title={item.title}
              icon={item.icon}
              path={item.path}
              isActive={location.pathname === item.path}
              role={item.role}
              userRole={userRole}
            />
          ))}
        </nav>

        <div className="p-4 border-t border-gray-200 dark:border-gray-800">
          <Link
            to="/profile"
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-200 dark:text-gray-300 dark:hover:bg-gray-800"
          >
            <UserCircle size={18} className="text-[#3f51b5]" />
            <span>My Profile</span>
          </Link>
          <button className="w-full mt-2 flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-red-600 hover:bg-red-50 transition-colors duration-200 dark:text-red-400 dark:hover:bg-gray-800">
            <LogOut size={18} className="text-red-600 dark:text-red-400" />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
