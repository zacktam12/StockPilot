// src/store/slices/reportsSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../services/api";

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
          endpoint = `${baseUrl}/purchase-orders`;
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
        case "customer-sales":
          endpoint = `${baseUrl}/customer-sales`;
          break;
        case "sales-performance":
          endpoint = `${baseUrl}/sales-performance`;
          break;
        case "category-analysis":
          endpoint = `${baseUrl}/category-analysis`;
          break;
        case "stock-movement":
          endpoint = `${baseUrl}/stock-movement`;
          break;
        case "purchase-trends":
          endpoint = `${baseUrl}/purchase-trends`;
          break;
        case "user-activity":
          endpoint = `${baseUrl}/user-activity`;
          break;
        case "role-distribution":
          endpoint = `${baseUrl}/role-distribution`;
          break;
        case "notifications":
          endpoint = `${baseUrl}/notifications`;
          break;
        default:
          throw new Error("Invalid report type");
      }

      const response = await api.get(endpoint, { params });
      return {
        reportType,
        data: response.data,
        params,
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
        { name: "Sales by Customer", id: "customer-sales" },
        { name: "Sales Performance", id: "sales-performance" },
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
        { name: "Category Analysis", id: "category-analysis" },
        { name: "Stock Movement", id: "stock-movement" },
      ],
    },
    {
      title: "Purchase Reports",
      description: "Track purchase orders and supplier performance",
      icon: "shopping-cart",
      options: [
        { name: "Purchase Orders", id: "purchase-orders" },
        { name: "Supplier Analysis", id: "supplier-analysis" },
        { name: "Purchase Trends", id: "purchase-trends" },
      ],
    },
    {
      title: "User & System Reports",
      description: "User activity and system analytics",
      icon: "user",
      options: [
        { name: "User Activity", id: "user-activity" },
        { name: "Role Distribution", id: "role-distribution" },
        { name: "System Notifications", id: "notifications" },
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
    "customer-sales": "Customer Sales Report",
    "sales-performance": "Sales Performance Report",
    "category-analysis": "Category Analysis Report",
    "stock-movement": "Stock Movement Report",
    "purchase-trends": "Purchase Trends Report",
    "user-activity": "User Activity Report",
    "role-distribution": "Role Distribution Report",
    notifications: "System Notifications Report",
  };
  return titles[reportType] || "Report";
};

const getReportColumns = (reportType) => {
  const columns = {
    "daily-sales": ["Date", "Order ID", "Customer", "Amount", "Status"],
    inventory: ["Product Name", "Category", "Quantity", "Price", "Status"],
    "purchase-orders": ["Date", "Order ID", "Supplier", "Amount", "Status"],
    "monthly-revenue": ["Month", "Total Revenue"],
    "top-products": ["Product Name", "Units Sold", "Total Revenue"],
    "low-stock": ["Product Name", "Category", "Quantity", "Status"],
    "inventory-value": [
      "Product Name",
      "Category",
      "Quantity",
      "Price",
      "Total Value",
    ],
    "supplier-analysis": ["Supplier", "Total Orders", "Total Spent"],
    "customer-sales": ["Customer", "Total Orders", "Total Spent", "Last Order"],
    "sales-performance": [
      "Sales Person",
      "Total Sales",
      "Total Revenue",
      "Orders Count",
    ],
    "category-analysis": [
      "Category",
      "Product Count",
      "Total Quantity",
      "Total Value",
    ],
    "stock-movement": ["Product Name", "Sold", "Purchased", "Net Movement"],
    "purchase-trends": [
      "Month",
      "Total Orders",
      "Total Cost",
      "Suppliers Count",
    ],
    "user-activity": ["User Name", "Email", "Role", "Status", "Created At"],
    "role-distribution": ["Role Type", "User Count"],
    notifications: ["Type", "Title", "Message", "Read", "Created At"],
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
