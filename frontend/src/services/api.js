import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(error.response?.data || error.message);
  }
);

export const authAPI = {
  login: (credentials) => api.post("/auth/login", credentials),
  register: (userData) => api.post("/auth/register", userData),
  getProfile: () => api.get("/auth/profile"),
};

export const productsAPI = {
  getAll: (params) => api.get("/products", { params }),
  getById: (id) => api.get(`/products/${id}`),
  create: (data) => api.post("/products", data),
  update: (id, data) => api.put(`/products/${id}`, data),
  delete: (id) => api.delete(`/products/${id}`),
  getLowStock: () => api.get("/products/low-stock"),
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
};

export const reportsAPI = {
  getSales: (params) => api.get("/reports/sales", { params }),
  return: typeof error === "string",
  getPurchases: (params) => api.get("/reports/purchases", { params }),
  getInventory: () => api.get("/reports/inventory"),
  getTopProducts: (params) => api.get("/reports/top-products", { params }),
  getDashboard: () => api.get("/reports/dashboard"),
};

// MOCK API LAYER FOR FRONTEND-ONLY DEVELOPMENT
if (import.meta.env.MODE === "development" || !import.meta.env.VITE_API_URL) {
  console.log("✅ Mock API is active");

  const delay = (ms) => new Promise((res) => setTimeout(res, ms));
  const mockUsers = [
    {
      id: 1,
      email: "admin@example.com",
      role: "admin",
      lastSignInAt: "2025-06-01T12:00:00Z",
    },
    { id: 2, email: "user@example.com", role: "user", lastSignInAt: null },
  ];
  const mockProducts = [
    {
      id: 1,
      name: "Product A",
      quantity: 20,
      price: 10.5,
      category: "Category 1",
    },
    {
      id: 2,
      name: "Product B",
      quantity: 5,
      price: 20,
      category: "Category 2",
    },
  ];
  const mockSales = [
    {
      id: 1,
      created_at: "2025-06-01T10:00:00Z",
      customer: { name: "John Doe" },
      customer_id: 1,
      total_amount: 100,
      status: "completed",
      items: mockProducts,
    },
    {
      id: 2,
      created_at: "2025-06-02T11:00:00Z",
      customer: { name: "Jane Smith" },
      customer_id: 2,
      total_amount: 50,
      status: "pending",
      items: mockProducts,
    },
  ];
  const mockPurchases = [
    {
      id: 1,
      created_at: "2025-06-01T09:00:00Z",
      supplier: { name: "Supplier A" },
      supplier_id: 1,
      total_amount: 200,
      status: "completed",
      items: mockProducts,
    },
  ];
  const mockDashboard = {
    stats: {
      totalProducts: 2,
      totalSales: 2,
      totalRevenue: 150,
      totalCustomers: 2,
      totalSuppliers: 1,
      lowStockItems: 1,
      productChange: 0,
      salesChange: 0,
      revenueChange: 0,
    },
    activities: [],
    lowStockProducts: [mockProducts[1]],
    revenueData: [],
    productDistribution: {},
  };
  const mockCategories = [
    { id: 1, name: "Category 1" },
    { id: 2, name: "Category 2" },
  ];
  const mockSuppliers = [{ id: 1, name: "Supplier A" }];
  const mockCustomers = [
    { id: 1, name: "John Doe" },
    { id: 2, name: "Jane Smith" },
  ];
  const mockCompany = {
    name: "Demo Company",
    address: "123 Main St",
    info: { name: "Demo Company", address: "123 Main St" },
  };
  const mockSettings = {
    appName: "Inventory Management System",
    currency: "USD",
    lowStockThreshold: 5,
    taxRate: 0,
  };

  api.get = async (url) => {
    console.log(`[Mock API] GET: ${url}`);
    await delay(300);
    if (url.startsWith("/users")) return { data: mockUsers };
    if (url.startsWith("/products")) return { data: mockProducts };
    if (url.startsWith("/sales")) return { data: mockSales };
    if (url.startsWith("/purchases")) return { data: mockPurchases };
    if (url.startsWith("/dashboard/stats"))
      return { data: mockDashboard.stats };
    if (url.startsWith("/dashboard/activities"))
      return { data: mockDashboard.activities };
    if (url.startsWith("/dashboard")) return { data: mockDashboard };
    if (url.startsWith("/categories")) return { data: mockCategories };
    if (url.startsWith("/suppliers")) return { data: mockSuppliers };
    if (url.startsWith("/customers")) return { data: mockCustomers };
    if (url.startsWith("/company")) return { data: mockCompany };
    if (url.startsWith("/reports")) return { data: [] };
    if (url.startsWith("/settings")) {
      console.log("[Mock API] Returning mock settings:", mockSettings);
      return { data: mockSettings };
    }
    return { data: [] };
  };
  api.post = async (url, data) => {
    await delay(200);
    return { data: { success: true, ...data } };
  };
  api.put = async (_url, data) => {
    console.log(`[Mock API] PUT: ${_url}`);
    await delay(200);
    if (_url.startsWith("/settings")) {
      console.log("[Mock API] Updating mock settings:", data);
      return { data: { ...mockSettings, ...data } };
    }
    return { data: { success: true, ...data } };
  };
  api.patch = async (url, data) => {
    await delay(200);
    return { data: { success: true, ...data } };
  };
  api.delete = async (url) => {
    await delay(200);
    return { data: { success: true } };
  };
}

export default api;
