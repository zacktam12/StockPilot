// Updated dashboardSlice.js with activitiesLoading flag
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../services/api";

export const fetchDashboardStats = createAsyncThunk(
  "dashboard/fetchStats",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/dashboard/stats");
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to load dashboard stats"
      );
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
  async (params = { limit: 10 }, { rejectWithValue }) => {
    try {
      const response = await api.get("/dashboard/activities", { params });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to load recent activities"
      );
    }
  },
  {
    meta: {
      loadingMessage: "Loading recent activities...",
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
      return rejectWithValue(
        error.response?.data?.message || "Failed to load revenue data"
      );
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
      return rejectWithValue(
        error.response?.data?.message || "Failed to load product distribution"
      );
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
  activities: [],
  lowStockProducts: [],
  revenueData: [],
  productDistribution: {},
  loading: false,
  activitiesLoading: false,
  revenueLoading: false,
  distributionLoading: false,
  error: null,
  isConnected: false,
  lastUpdated: {
    stats: null,
    activities: [],
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
          state.activities.unshift({
            id: Date.now(),
            type: "sale",
            date: now,
            amount: data.amount,
            relatedEntity: data.customer,
          });
          state.lastUpdated.activities = now;
          break;

        case "purchase-created":
          state.stats.totalProducts += data.quantity;
          state.activities.unshift({
            id: Date.now(),
            type: "purchase",
            date: now,
            amount: data.amount,
            relatedEntity: data.supplier,
          });
          state.lastUpdated.activities = now;
          break;

        case "product-updated":
          if (data.quantity <= data.lowStockThreshold) {
            const existingIndex = state.lowStockProducts.findIndex(
              (p) => p.id === data.id
            );
            if (existingIndex === -1) {
              state.lowStockProducts.push(data);
              state.stats.lowStockItems += 1;
            }
          }
          state.lastUpdated.stats = now;
          break;

        case "revenue-update":
          state.revenueData = data;
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
        state.activities = action.payload;
        state.lastUpdated.activities = new Date().toISOString();
      })
      .addCase(fetchActivities.rejected, (state, action) => {
        state.activitiesLoading = false;
        state.error = action.payload;
      })
      .addCase(fetchRevenueData.pending, (state) => {
        state.revenueLoading = true;
        state.error = null;
      })
      .addCase(fetchRevenueData.fulfilled, (state, action) => {
        state.revenueLoading = false;
        state.revenueData = action.payload;
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
        state.productDistribution = action.payload.reduce((acc, product) => {
          const category = product.category?.name || "Uncategorized";
          acc[category] = (acc[category] || 0) + 1;
          return acc;
        }, {});
        state.lastUpdated.distribution = new Date().toISOString();
      })
      .addCase(fetchProductDistribution.rejected, (state, action) => {
        state.distributionLoading = false;
        state.error = action.payload;
      });
  },
});

export const {
  setSocketUpdates,
  setConnectionStatus,
  refreshStats,
  refreshActivities,
  resetDashboard,
} = dashboardSlice.actions;

export default dashboardSlice.reducer;
