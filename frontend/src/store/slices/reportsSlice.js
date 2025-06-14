// src/store/slices/reportsSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../services/api";
import { format } from "date-fns";

export const generateReport = createAsyncThunk(
  "reports/generate",
  async ({ reportType, params = {} }, { rejectWithValue }) => {
    try {
      let endpoint;
      const baseUrl = "/reports";

      switch (reportType) {
        case "daily-sales":
          endpoint = `${baseUrl}/daily-sales`;
          break;
        case "inventory":
          endpoint = `${baseUrl}/inventory`;
          break;
        case "purchase-orders":
          endpoint = `${baseUrl}/purchases`;
          break;
        case "monthly-revenue":
          endpoint = `${baseUrl}/monthly-revenue`;
          break;
        case "top-products":
          endpoint = `${baseUrl}/top-products`;
          break;
        case "low-stock":
          endpoint = `${baseUrl}/low-stock`;
          break;
        case "inventory-value":
          endpoint = `${baseUrl}/inventory-value`;
          break;
        case "supplier-analysis":
          endpoint = `${baseUrl}/supplier-analysis`;
          break;
        case "cost-analysis":
          endpoint = `${baseUrl}/cost-analysis`;
          break;
        default:
          throw new Error("Invalid report type");
      }

      const response = await api.get(endpoint, { params });
      return {
        reportType,
        data: response.data,
        generatedAt: new Date().toISOString(),
      };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

const initialState = {
  currentReport: null,
  loading: false,
  error: null,
  reportTemplates: [
    {
      title: "Sales Reports",
      description: "View detailed sales analytics and trends",
      icon: "trending-up",
      options: [
        { name: "Daily Sales", id: "daily-sales" },
        { name: "Monthly Revenue", id: "monthly-revenue" },
        { name: "Top Selling Products", id: "top-products" },
      ],
    },
    {
      title: "Inventory Reports",
      description: "Monitor stock levels and product movement",
      icon: "package",
      options: [
        { name: "Stock Status", id: "inventory" },
        { name: "Low Stock Items", id: "low-stock" },
        { name: "Inventory Valuation", id: "inventory-value" },
      ],
    },
    {
      title: "Purchase Reports",
      description: "Track purchase orders and supplier performance",
      icon: "shopping-cart",
      options: [
        { name: "Purchase Orders", id: "purchase-orders" },
        { name: "Supplier Analysis", id: "supplier-analysis" },
        { name: "Cost Analysis", id: "cost-analysis" },
      ],
    },
  ],
};

const reportsSlice = createSlice({
  name: "reports",
  initialState,
  reducers: {
    clearCurrentReport: (state) => {
      state.currentReport = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(generateReport.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(generateReport.fulfilled, (state, action) => {
        state.loading = false;
        state.currentReport = {
          ...action.payload,
          columns: getReportColumns(action.payload.reportType),
          title: getReportTitle(action.payload.reportType),
        };
      })
      .addCase(generateReport.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

// Helper functions
const getReportTitle = (reportType) => {
  const titles = {
    "daily-sales": "Daily Sales Report",
    inventory: "Inventory Status Report",
    "purchase-orders": "Purchase Orders Report",
    "monthly-revenue": "Monthly Revenue Report",
    "top-products": "Top Selling Products Report",
    "low-stock": "Low Stock Items Report",
    "inventory-value": "Inventory Valuation Report",
    "supplier-analysis": "Supplier Analysis Report",
    "cost-analysis": "Cost Analysis Report",
  };
  return titles[reportType] || "Report";
};

const getReportColumns = (reportType) => {
  const columns = {
    "daily-sales": ["Date", "Order ID", "Customer", "Amount", "Status"],
    inventory: ["Product Name", "Category", "Quantity", "Price", "Status"],
    "purchase-orders": ["Date", "Order ID", "Supplier", "Amount", "Status"],
    "monthly-revenue": ["Month", "Total Revenue"],
    "top-products": ["Product Name", "Units Sold"],
    "low-stock": ["Product Name", "Category", "Quantity", "Status"],
    "inventory-value": [
      "Product Name",
      "Category",
      "Quantity",
      "Price",
      "Total Value",
    ],
    "supplier-analysis": ["Supplier", "Total Orders", "Total Spent"],
    "cost-analysis": ["Product Name", "Total Purchased", "Total Cost"],
  };
  return columns[reportType] || [];
};

export const { clearCurrentReport } = reportsSlice.actions;
export default reportsSlice.reducer;

// Selectors
export const selectCurrentReport = (state) => state.reports.currentReport;
export const selectReportTemplates = (state) => state.reports.reportTemplates;
export const selectReportsLoading = (state) => state.reports.loading;
export const selectReportsError = (state) => state.reports.error;
