// Updated dashboardSlice.js with pagination support
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../services/api";

export const fetchDashboardStats = createAsyncThunk(
  "dashboard/fetchStats",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/dashboard/stats");
      return response.data;
    } catch (error) {
      console.warn("Failed to load dashboard stats:", error);
      // Return default stats structure to prevent crashes
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
        },
        lowStockItems: [],
      };
    }
  },
  {
    meta: {
      loadingMessage: "Loading dashboard statistics...",
      loadingType: "full-page",
    },
  }
);

export const fetchActivities = createAsyncThunk(
  "dashboard/fetchActivities",
  async (params = { page: 1, limit: 10 }, { rejectWithValue }) => {
    try {
      const response = await api.get("/dashboard/activities", { params });
      return response.data;
    } catch (error) {
      console.warn("Failed to load recent activities:", error);
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
  async (params = { page: 1, limit: 10 }, { rejectWithValue }) => {
    try {
      const response = await api.get("/dashboard/low-stock-alerts", { params });
      return response.data;
    } catch (error) {
      console.warn("Failed to load low stock alerts:", error);
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
  async (timeRange = "monthly", { rejectWithValue }) => {
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
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/products?fields=id,category");
      return response.data;
    } catch (error) {
      console.warn("Failed to load product distribution:", error);
      // Return empty array to prevent reduce errors
      return [];
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
    setSocketUpdates: (state, action) => {
      const { type, data } = action.payload;
      const now = new Date().toISOString();

      switch (type) {
        case "sale-created":
          state.stats.totalSales += 1;
          state.stats.totalRevenue += data.amount;
          // Add to activities if we're on page 1
          if (state.activities.page === 1) {
            state.activities.data.unshift({
              id: Date.now(),
              type: "sale",
              date: now,
              amount: data.amount,
              relatedEntity: data.customer,
            });
            // Remove last item if we exceed limit
            if (state.activities.data.length > state.activities.limit) {
              state.activities.data.pop();
            }
          }
          state.lastUpdated.activities = now;
          break;

        case "purchase-created":
          state.stats.totalProducts += data.quantity;
          // Add to activities if we're on page 1
          if (state.activities.page === 1) {
            state.activities.data.unshift({
              id: Date.now(),
              type: "purchase",
              date: now,
              amount: data.amount,
              relatedEntity: data.supplier,
            });
            // Remove last item if we exceed limit
            if (state.activities.data.length > state.activities.limit) {
              state.activities.data.pop();
            }
          }
          state.lastUpdated.activities = now;
          break;

        case "product-updated":
          if (data.quantity <= data.lowStockThreshold) {
            const existingIndex = state.lowStockAlerts.data.findIndex(
              (p) => p.id === data.id
            );
            if (existingIndex === -1) {
              // Add to low stock alerts if we're on page 1
              if (state.lowStockAlerts.page === 1) {
                state.lowStockAlerts.data.unshift(data);
                // Remove last item if we exceed limit
                if (
                  state.lowStockAlerts.data.length > state.lowStockAlerts.limit
                ) {
                  state.lowStockAlerts.data.pop();
                }
              }
              state.stats.lowStockItems += 1;
            }
          }
          state.lastUpdated.lowStockAlerts = now;
          break;

        case "revenue-update":
          state.revenue = { data: data };
          state.lastUpdated.revenue = now;
          break;

        default:
          break;
      }
    },
    setConnectionStatus: (state, action) => {
      state.isConnected = action.payload;
    },
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
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboardStats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDashboardStats.fulfilled, (state, action) => {
        state.loading = false;
        state.stats = {
          ...state.stats,
          ...action.payload.stats,
          lowStockItems: action.payload.lowStockItems?.length || 0,
        };
        state.lowStockProducts = action.payload.lowStockItems || [];
        state.lastUpdated.stats = new Date().toISOString();
      })
      .addCase(fetchDashboardStats.rejected, (state, action) => {
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
        const products = Array.isArray(action.payload) ? action.payload : [];
        state.distribution = {
          data: products.reduce((acc, product) => {
            const category = product.category?.name || "Uncategorized";
            acc[category] = (acc[category] || 0) + 1;
            return acc;
          }, {}),
        };
        state.lastUpdated.distribution = new Date().toISOString();
      })
      .addCase(fetchProductDistribution.rejected, (state, action) => {
        state.distributionLoading = false;
        state.distribution = { data: {} };
        state.error = action.payload;
      });
  },
});

export const {
  setSocketUpdates,
  setConnectionStatus,
  refreshStats,
  refreshActivities,
  refreshLowStockAlerts,
  resetDashboard,
} = dashboardSlice.actions;

export default dashboardSlice.reducer;
