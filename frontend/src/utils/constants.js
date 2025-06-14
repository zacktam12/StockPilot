// src/utils/constants.js

// User Roles
export const ROLES = {
  ADMIN: "admin",
  STAFF: "staff",
  MANAGER: "manager",
  CUSTOMER: "customer",
};

// Status Types
export const STATUS = {
  ACTIVE: "active",
  INACTIVE: "inactive",
  PENDING: "pending",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
  DELETED: "deleted",
  DRAFT: "draft",
};

// Stock Management
export const STOCK = {
  THRESHOLD: {
    LOW: 10,
    CRITICAL: 5,
    OUT_OF_STOCK: 0,
  },
  STATUS: {
    IN_STOCK: "in_stock",
    LOW_STOCK: "low_stock",
    OUT_OF_STOCK: "out_of_stock",
  },
};

// API Endpoints
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: "/auth/login",
    REGISTER: "/auth/register",
    PROFILE: "/auth/profile",
    REFRESH: "/auth/refresh",
  },
  USERS: "/users",
  PRODUCTS: {
    BASE: "/products",
    LOW_STOCK: "/products/low-stock",
    CATEGORY: (id) => `/products/category/${id}`,
  },
  CATEGORIES: "/categories",
  CUSTOMERS: "/customers",
  SUPPLIERS: "/suppliers",
  SALES: {
    BASE: "/sales",
    REPORT: "/sales/report",
    RECEIPT: (id) => `/sales/${id}/receipt`,
  },
  PURCHASES: "/purchases",
  REPORTS: {
    SALES: "/reports/sales",
    INVENTORY: "/reports/inventory",
    FINANCIAL: "/reports/financial",
  },
};

// UI Constants
export const UI = {
  PAGE_SIZE: 10,
  MAX_PAGE_SIZE: 100,
  DEFAULT_SORT: "created_at:desc",
};

// Local Storage Keys
export const STORAGE_KEYS = {
  TOKEN: "token",
  USER: "user",
  THEME: "theme",
  LANG: "language",
};

// Date/Time Formats
export const DATE_FORMATS = {
  SHORT: "MM/DD/YYYY",
  LONG: "MMMM D, YYYY",
  DATETIME: "MM/DD/YYYY h:mm A",
  API: "YYYY-MM-DD",
};
