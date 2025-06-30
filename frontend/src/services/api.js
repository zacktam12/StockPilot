import axios from "axios";
import { API_URL } from "../config";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("authToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("authToken");
      localStorage.removeItem("userRole");
      localStorage.removeItem("userName");
      localStorage.removeItem("userEmail");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (credentials) => api.post("/auth/login", credentials),
  register: (userData) => api.post("/auth/register", userData),
  forgotPassword: (email) => api.post("/auth/forgot-password", { email }),
  resetPassword: (token, password) =>
    api.post("/auth/reset-password", { token, password }),
  verifyEmployeeId: (employeeId) =>
    api.get(`/auth/verify-employee-id/${employeeId}`),
  contactAdmin: (data) => api.post("/auth/contact-admin", data),
  verifyResetCode: (email, code) =>
    api.post("/auth/reset-code-login", { email, code }),
  resetPasswordWithCode: (email, code, newPassword) =>
    api.post("/auth/reset-password-with-code", { email, code, newPassword }),
};

export const usersAPI = {
  getAll: (params) => api.get("/users", { params }),
  getById: (id) => api.get(`/users/${id}`),
  create: (data) => api.post("/users", data),
  update: (id, data) => api.put(`/users/${id}`, data),
  delete: (id) => api.delete(`/users/${id}`),
  getProfile: () => api.get("/users/profile"),
  updateProfile: (data) => api.put("/users/profile", data),
  import: (data) => api.post("/users/import", data),
  invite: (data) => api.post("/users/invite", data),
};

export const productsAPI = {
  getAll: (params) => api.get("/products", { params }),
  getById: (id) => api.get(`/products/${id}`),
  create: (data) => api.post("/products", data),
  update: (id, data) => api.put(`/products/${id}`, data),
  delete: (id) => api.delete(`/products/${id}`),
  uploadImage: (formData) => {
    // Create a new axios instance for file uploads with proper headers
    const uploadApi = axios.create({
      baseURL: API_URL,
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    // Add auth token to upload requests
    const token = localStorage.getItem("authToken");
    if (token) {
      uploadApi.defaults.headers.Authorization = `Bearer ${token}`;
    }

    return uploadApi.post("/upload", formData);
  },

  // Stock management
  updateStock: (id, quantity) =>
    api.patch(`/products/${id}/stock`, { quantity }),
  incrementStock: (id, quantity) =>
    api.patch(`/products/${id}/stock/increment`, { quantity }),
  decrementStock: (id, quantity) =>
    api.patch(`/products/${id}/stock/decrement`, { quantity }),

  // Low stock products
  getLowStock: (threshold) =>
    api.get("/products/low-stock", { params: { threshold } }),
};

export const categoriesAPI = {
  getAll: (params) => api.get("/categories", { params }),
  getById: (id) => api.get(`/categories/${id}`),
  create: (data) => api.post("/categories", data),
  update: (id, data) => api.put(`/categories/${id}`, data),
  delete: (id) => api.delete(`/categories/${id}`),
};

export const salesAPI = {
  getAll: (params) => api.get("/sales", { params }),
  getById: (id) => api.get(`/sales/${id}`),
  create: (data) => api.post("/sales", data),
  updateStatus: (id, status) => api.put(`/sales/${id}/status`, { status }),
  delete: (id) => api.delete(`/sales/${id}`),
};

export const purchasesAPI = {
  getAll: (params) => api.get("/purchases", { params }),
  getById: (id) => api.get(`/purchases/${id}`),
  create: (data) => api.post("/purchases", data),
  updateStatus: (id, status) => api.put(`/purchases/${id}/status`, { status }),
  delete: (id) => api.delete(`/purchases/${id}`),
};

export const customersAPI = {
  getAll: (params) => api.get("/customers", { params }),
  getById: (id) => api.get(`/customers/${id}`),
  create: (data) => api.post("/customers", data),
  update: (id, data) => api.put(`/customers/${id}`, data),
  delete: (id) => api.delete(`/customers/${id}`),
};

export const suppliersAPI = {
  getAll: (params) => api.get("/suppliers", { params }),
  getById: (id) => api.get(`/suppliers/${id}`),
  create: (data) => api.post("/suppliers", data),
  update: (id, data) => api.put(`/suppliers/${id}`, data),
  delete: (id) => api.delete(`/suppliers/${id}`),

  // Additional useful operations
  search: (searchTerm) =>
    api.get("/suppliers", { params: { search: searchTerm } }),
  getActiveSuppliers: () => api.get("/suppliers", { params: { active: true } }),

  // Bulk operations (if backend supports them)
  bulkDelete: (ids) => api.post("/suppliers/bulk-delete", { ids }),
  bulkUpdate: (data) => api.post("/suppliers/bulk-update", data),

  // Export functionality
  exportToCSV: (params) =>
    api.get("/suppliers/export", {
      params,
      responseType: "blob",
    }),

  // Import functionality
  importFromCSV: (formData) => {
    const uploadApi = axios.create({
      baseURL: API_URL,
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    const token = localStorage.getItem("authToken");
    if (token) {
      uploadApi.defaults.headers.Authorization = `Bearer ${token}`;
    }

    return uploadApi.post("/suppliers/import", formData);
  },
};

export const reportsAPI = {
  getSales: (params) => api.get("/reports/sales", { params }),
  getPurchases: (params) => api.get("/reports/purchases", { params }),
  getInventory: () => api.get("/reports/inventory"),
  getTopProducts: (params) => api.get("/reports/top-products", { params }),
  getDashboard: () => api.get("/reports/dashboard"),
};

export const settingsAPI = {
  getSettings: () => api.get("/settings"),
  updateSettings: (data) => api.put("/settings", data),
  uploadLogo: (formData) => {
    const uploadApi = axios.create({
      baseURL: API_URL,
      headers: { "Content-Type": "multipart/form-data" },
    });
    const token = localStorage.getItem("authToken");
    if (token) {
      uploadApi.defaults.headers.Authorization = `Bearer ${token}`;
    }
    return uploadApi.post("/settings/logo", formData);
  },
};

export const integrationsAPI = {
  getIntegrations: () => api.get("/integrations"),
  updateIntegration: (id, data) => api.put(`/integrations/${id}", data`),
};

export default api;
