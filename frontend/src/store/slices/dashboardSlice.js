// Updated dashboardSlice.js with pagination support and debugging
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../services/api";

// Add action to refresh product distribution
export const refreshProductDistribution = createAsyncThunk(
  "dashboard/refreshProductDistribution",
  async () => {
    try {
      console.log("🔄 Refreshing product distribution...");
      const response = await api.get("/dashboard/product-distribution");
      console.log("📊 Product distribution refreshed:", response.data);
      return response.data;
    } catch (error) {
      console.warn("Failed to refresh product distribution:", error);
      return {};
    }
  }
);

export const fetchDashboardStats = createAsyncThunk(
  "dashboard/fetchDashboardStats",
  async () => {
    try {
      console.log("🔍 Fetching dashboard stats...");
      const response = await api.get("/dashboard/stats");
      console.log("📊 Dashboard stats response:", response.data);
      return response.data;
    } catch (error) {
      console.error("❌ Failed to load dashboard stats:", error);
      console.error("Error details:", {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
      });
      // Return default stats structure
      return {
        stats: {
          totalProducts: 0,
          totalSales: 0,
          totalRevenue: 0,
          totalCustomers: 0,
          totalSuppliers: 0,
          lowStockItems: 0,
          productChange: 0,
          salesChange: 0,
          revenueChange: 0,
          currentMonthSales: 0,
          currentMonthRevenue: 0,
        },
        lowStockItems: [],
      };
    }
  },
  {
    meta: {
      loadingMessage: "Loading dashboard statistics...",
      loadingType: "page",
    },
  }
);

export const fetchActivities = createAsyncThunk(
  "dashboard/fetchActivities",
  async (params = { page: 1, limit: 10 }) => {
    try {
      console.log("🔍 Fetching activities with params:", params);
      const response = await api.get("/dashboard/activities", { params });
      console.log("📊 Activities response:", response.data);
      return response.data;
    } catch (error) {
      console.error("❌ Failed to load recent activities:", error);
      // Return default paginated structure
      return {
        data: [],
        currentPage: params.page,
        totalPages: 1,
        totalItems: 0,
        limit: params.limit,
      };
    }
  },
  {
    meta: {
      loadingMessage: "Loading recent activities...",
      loadingType: "section",
    },
  }
);

export const fetchLowStockAlerts = createAsyncThunk(
  "dashboard/fetchLowStockAlerts",
  async (params = { page: 1, limit: 10 }) => {
    try {
      console.log("🔍 Fetching low stock alerts with params:", params);
      const response = await api.get("/dashboard/low-stock-alerts", { params });
      console.log("📊 Low stock alerts response:", response.data);
      return response.data;
    } catch (error) {
      console.error("❌ Failed to load low stock alerts:", error);
      // Return default paginated structure
      return {
        data: [],
        currentPage: params.page,
        totalPages: 1,
        totalItems: 0,
        limit: params.limit,
      };
    }
  },
  {
    meta: {
      loadingMessage: "Loading low stock alerts...",
      loadingType: "section",
    },
  }
);

export const fetchRevenueData = createAsyncThunk(
  "dashboard/fetchRevenueData",
  async (timeRange = "monthly") => {
    try {
      const response = await api.get("/dashboard/revenue-data", {
        params: { range: timeRange },
      });
      return response.data;
    } catch (error) {
      console.warn("Failed to load revenue data:", error);
      // Return default revenue data structure
      return [];
    }
  },
  {
    meta: {
      loadingMessage: "Loading revenue analytics...",
      loadingType: "chart",
    },
  }
);

export const fetchProductDistribution = createAsyncThunk(
  "dashboard/fetchProductDistribution",
  async () => {
    try {
      const response = await api.get("/dashboard/product-distribution");
      return response.data;
    } catch (error) {
      console.warn("Failed to load product distribution:", error);
      // Return empty object to prevent reduce errors
      return {};
    }
  },
  {
    meta: {
      loadingMessage: "Loading product categories...",
      loadingType: "chart",
    },
  }
);

const initialState = {
  stats: {
    totalProducts: 0,
    totalSales: 0,
    totalRevenue: 0,
    totalCustomers: 0,
    totalSuppliers: 0,
    lowStockItems: 0,
    productChange: 0,
    salesChange: 0,
    revenueChange: 0,
    currentMonthSales: 0,
    currentMonthRevenue: 0,
  },
  activities: {
    data: [],
    page: 1,
    totalPages: 1,
    totalItems: 0,
    limit: 10,
  },
  lowStockAlerts: {
    data: [],
    page: 1,
    totalPages: 1,
    totalItems: 0,
    limit: 10,
  },
  lowStockProducts: [],
  loading: false,
  activitiesLoading: false,
  lowStockLoading: false,
  error: null,
  revenue: { data: [] },
  distribution: { data: {} },
  lastUpdated: {
    stats: null,
    activities: null,
    lowStockAlerts: null,
    revenue: null,
    distribution: null,
  },
};

const dashboardSlice = createSlice({
  name: "dashboard",
  initialState,
  reducers: {
    refreshStats: (state) => {
      state.loading = true;
    },
    refreshActivities: (state) => {
      state.activitiesLoading = true;
    },
    refreshLowStockAlerts: (state) => {
      state.lowStockLoading = true;
    },
    resetDashboard: () => initialState,
    // Add pagination actions for activities
    setActivitiesCurrentPage: (state, action) => {
      state.activities.page = action.payload;
    },
    // Add pagination actions for low stock alerts
    setLowStockAlertsCurrentPage: (state, action) => {
      state.lowStockAlerts.page = action.payload;
    },
    // Socket updates for real-time dashboard updates
    setSocketUpdates: (state, action) => {
      const { stats, activities, lowStockAlerts } = action.payload;
      if (stats) {
        state.stats = { ...state.stats, ...stats };
      }
      if (activities) {
        state.activities.data = activities;
      }
      if (lowStockAlerts) {
        state.lowStockAlerts.data = lowStockAlerts;
      }
      state.lastUpdated.stats = new Date().toISOString();
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboardStats.pending, (state) => {
        console.log("🔄 Dashboard stats loading...");
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDashboardStats.fulfilled, (state, action) => {
        console.log("✅ Dashboard stats loaded:", action.payload);
        state.loading = false;
        state.stats = {
          ...state.stats,
          ...action.payload.stats,
          lowStockItems: action.payload.lowStockItems?.length || 0,
        };
        state.lowStockProducts = action.payload.lowStockItems || [];
        state.lastUpdated.stats = new Date().toISOString();
        console.log("📊 Updated stats state:", state.stats);
      })
      .addCase(fetchDashboardStats.rejected, (state, action) => {
        console.error("❌ Dashboard stats failed:", action.payload);
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchActivities.pending, (state) => {
        state.activitiesLoading = true;
        state.error = null;
      })
      .addCase(fetchActivities.fulfilled, (state, action) => {
        state.activitiesLoading = false;
        state.activities = {
          data: action.payload.data || [],
          page: action.payload.currentPage || 1,
          totalPages: action.payload.totalPages || 1,
          totalItems: action.payload.totalItems || 0,
          limit: action.payload.limit || 10,
        };
        state.lastUpdated.activities = new Date().toISOString();
      })
      .addCase(fetchActivities.rejected, (state, action) => {
        state.activitiesLoading = false;
        state.error = action.payload;
      })
      .addCase(fetchLowStockAlerts.pending, (state) => {
        state.lowStockLoading = true;
        state.error = null;
      })
      .addCase(fetchLowStockAlerts.fulfilled, (state, action) => {
        state.lowStockLoading = false;
        state.lowStockAlerts = {
          data: action.payload.data || [],
          page: action.payload.currentPage || 1,
          totalPages: action.payload.totalPages || 1,
          totalItems: action.payload.totalItems || 0,
          limit: action.payload.limit || 10,
        };
        state.lastUpdated.lowStockAlerts = new Date().toISOString();
      })
      .addCase(fetchLowStockAlerts.rejected, (state, action) => {
        state.lowStockLoading = false;
        state.error = action.payload;
      })
      .addCase(fetchRevenueData.pending, (state) => {
        state.revenueLoading = true;
        state.error = null;
      })
      .addCase(fetchRevenueData.fulfilled, (state, action) => {
        state.revenueLoading = false;
        state.revenue = { data: action.payload };
        state.lastUpdated.revenue = new Date().toISOString();
      })
      .addCase(fetchRevenueData.rejected, (state, action) => {
        state.revenueLoading = false;
        state.error = action.payload;
      })
      .addCase(fetchProductDistribution.pending, (state) => {
        state.distributionLoading = true;
        state.error = null;
      })
      .addCase(fetchProductDistribution.fulfilled, (state, action) => {
        state.distributionLoading = false;
        state.distribution = {
          data: action.payload || {},
        };
        state.lastUpdated.distribution = new Date().toISOString();
      })
      .addCase(fetchProductDistribution.rejected, (state, action) => {
        state.distributionLoading = false;
        state.distribution = { data: {} };
        state.error = action.payload;
      })
      .addCase(refreshProductDistribution.pending, (state) => {
        state.distributionLoading = true;
        state.error = null;
      })
      .addCase(refreshProductDistribution.fulfilled, (state, action) => {
        state.distributionLoading = false;
        state.distribution = {
          data: action.payload || {},
        };
        state.lastUpdated.distribution = new Date().toISOString();
        console.log("✅ Product distribution refreshed successfully");
      })
      .addCase(refreshProductDistribution.rejected, (state, action) => {
        state.distributionLoading = false;
        state.error = action.payload;
        console.error(
          "❌ Failed to refresh product distribution:",
          action.payload
        );
      });
  },
});

export const {
  refreshStats,
  refreshActivities,
  refreshLowStockAlerts,
  resetDashboard,
  setActivitiesCurrentPage,
  setLowStockAlertsCurrentPage,
  setSocketUpdates,
} = dashboardSlice.actions;

// Add middleware to listen for category changes and refresh product distribution
export const dashboardMiddleware = (store) => (next) => (action) => {
  console.log("🔍 Dashboard middleware received action:", action.type);

  const result = next(action);

  // Listen for category changes that might affect product distribution
  if (
    action.type === "category/deleteCategory/fulfilled" ||
    action.type === "category/createCategory/fulfilled" ||
    action.type === "category/updateCategory/fulfilled"
  ) {
    console.log("🔄 Category changed, refreshing product distribution...");
    console.log("Action details:", action);

    // Dispatch refresh action after a short delay to ensure backend is updated
    setTimeout(() => {
      console.log("⏰ Dispatching refreshProductDistribution...");
      store.dispatch(refreshProductDistribution());
    }, 1000); // Increased delay to 1 second
  }

  return result;
};

export default dashboardSlice.reducer;
