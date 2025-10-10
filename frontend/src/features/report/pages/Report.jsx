import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { 
  BarChart3, 
  TrendingUp, 
  Calendar, 
  Filter, 
  Download, 
  Share2, 
  RefreshCw,
  Eye,
  EyeOff,
  ChevronDown,
  Settings,
  Zap,
  ArrowLeft
} from "lucide-react";
import { format, subDays, startOfMonth, endOfMonth } from "date-fns";
import { toast } from "react-hot-toast";
import { showSuccess, showError, showWarning } from "../../../services/notificationService";

// Enhanced Components
import EnhancedReportHeader from "../components/EnhancedReportHeader";
import InteractiveReportCards from "../components/InteractiveReportCards";
import AdvancedReportTable from "../components/AdvancedReportTable";
import ReportFilters from "../components/ReportFilters";
import ReportVisualizations from "../components/ReportVisualizations";
import ReportExportPanel from "../components/ReportExportPanel";
import ReportInsights from "../components/ReportInsights";
import LoadingOverlay from "../../../components/shared/LoadingOverlay";
import { API_URL } from "../../../config";

const ReportsPage = () => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [currentReport, setCurrentReport] = useState(null);
  const [reportData, setReportData] = useState(null);
  const [filters, setFilters] = useState({
    dateRange: {
      start: '2024-01-01',
      end: format(new Date(), 'yyyy-MM-dd')
    },
    category: '',
    status: '',
    sortBy: 'date',
    sortOrder: 'desc'
  });
  const [viewMode, setViewMode] = useState('table'); // table, chart, insights
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [refreshInterval, setRefreshInterval] = useState(null);

  // Auto-refresh functionality
  useEffect(() => {
    if (autoRefresh && currentReport) {
      const interval = setInterval(() => {
        generateReport(currentReport.type, true);
      }, 30000); // Refresh every 30 seconds
      setRefreshInterval(interval);
      return () => clearInterval(interval);
    } else if (refreshInterval) {
      clearInterval(refreshInterval);
      setRefreshInterval(null);
    }
  }, [autoRefresh, currentReport]);


  // Enhanced report configurations with more detailed metadata
  const reportConfigs = {
    "daily-sales": {
      endpoint: `${API_URL}/reports/daily-sales`,
      columns: ["Date", "Order ID", "Customer", "Amount", "Status", "Payment Method"],
      title: "Daily Sales Report",
      type: "sales",
      chartType: "line",
      insights: ["totalRevenue", "averageOrderValue", "topCustomers"]
    },
    "inventory": {
      endpoint: `${API_URL}/reports/inventory`,
      columns: ["Product Name", "Category", "Quantity", "Price", "Status", "Total Value", "Last Updated"],
      title: "Inventory Status Report",
      type: "inventory",
      chartType: "bar",
      insights: ["totalValue", "lowStockCount", "categoryDistribution"]
    },
    "purchase-orders": {
      endpoint: `${API_URL}/reports/purchase-orders`,
      columns: ["Date", "Order Number", "Supplier", "Amount", "Status", "Expected Delivery", "Product Count"],
      title: "Purchase Orders Report",
      type: "purchases",
      chartType: "bar",
      insights: ["totalSpent", "averageOrderValue", "topSuppliers"]
    },
    "monthly-revenue": {
      endpoint: `${API_URL}/reports/monthly-revenue`,
      columns: ["Month", "Total Revenue", "Growth %", "Orders Count"],
      title: "Monthly Revenue Report",
      type: "revenue",
      chartType: "line",
      insights: ["revenueGrowth", "bestMonth", "trendAnalysis"]
    },
    "top-products": {
      endpoint: `${API_URL}/reports/top-products`,
      columns: ["Product Name", "Units Sold", "Revenue", "Growth %", "Category"],
      title: "Top Selling Products Report",
      type: "products",
      chartType: "pie",
      insights: ["topPerformer", "categoryBreakdown", "growthTrends"]
    },
    "low-stock": {
      endpoint: `${API_URL}/reports/low-stock`,
      columns: ["Product Name", "Category", "Quantity", "Price", "Urgency", "Total Value", "Last Updated"],
      title: "Low Stock Items Report",
      type: "alerts",
      chartType: "bar",
      insights: ["criticalItems", "reorderSuggestions", "stockTrends"]
    },
    "inventory-value": {
      endpoint: `${API_URL}/reports/inventory-value`,
      columns: ["Product Name", "Category", "Quantity", "Unit Price", "Total Value", "Last Updated"],
      title: "Inventory Valuation Report",
      type: "valuation",
      chartType: "bar",
      insights: ["totalValue", "categoryValue", "valueTrends"]
    },
    "supplier-analysis": {
      endpoint: `${API_URL}/reports/supplier-analysis`,
      columns: ["Supplier", "Total Orders", "Total Spent", "Average Order Value", "Total Products", "Last Order Date", "Supplier Contact"],
      title: "Supplier Analysis Report",
      type: "suppliers",
      chartType: "bar",
      insights: ["topSuppliers", "costAnalysis", "performanceMetrics"]
    },
    "cost-analysis": {
      endpoint: `${API_URL}/reports/cost-analysis`,
      columns: ["Product Name", "Total Purchased", "Total Cost", "Avg Cost", "Category", "Trend"],
      title: "Cost Analysis Report",
      type: "costs",
      chartType: "line",
      insights: ["costTrends", "expensiveItems", "categoryCosts"]
    }
  };

  // Test backend connectivity
  const testBackendConnection = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const testUrl = `${API_URL}/reports/test`;
      const response = await fetch(testUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        return true;
      } else {
                return false;
      }
    } catch (error) {
      return false;
    }
  };

  const generateReport = async (reportType, isRefresh = false) => {
    if (!isRefresh) {
      setLoading(reportType);
      setIsLoading(true);
    }

    // Test backend connection first
    const isBackendConnected = await testBackendConnection();
    if (!isBackendConnected) {
            showError("Backend Not Accessible", "Backend server not accessible. Please check your connection.", 5000);
      setLoading(null);
      setIsLoading(false);
      return;
    }

    try {
      let endpoint, columns, title, type;

      const config = reportConfigs[reportType];
      if (!config) throw new Error("Invalid report type");

      endpoint = config.endpoint;
      columns = config.columns;
      title = config.title;
      type = config.type;

      // Add filters to the request
      const queryParams = new URLSearchParams({
        startDate: filters.dateRange.start,
        endDate: filters.dateRange.end,
        category: filters.category,
        status: filters.status,
        sortBy: filters.sortBy,
        sortOrder: filters.sortOrder
      });

      let data;
      
      try {
        // Get authentication token from localStorage
        const token = localStorage.getItem('authToken');
        const response = await fetch(`${endpoint}?${queryParams}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });
        if (!response.ok) {
          const errorText = await response.text();
                    throw new Error(`HTTP error ${response.status}: ${response.statusText} - ${errorText}`);
        }

        const responseData = await response.json();
        // Handle different response formats from backend
        if (responseData.success && responseData.data) {
          data = responseData.data;
        } else if (Array.isArray(responseData)) {
          data = responseData;
        } else {
          data = responseData;
        }
      } catch (apiError) {
                showError("Data Fetch Failed", `Failed to fetch data: ${apiError.message}`, 5000);
        setLoading(null);
        setIsLoading(false);
        return;
      }
      
      // Enhanced report object with metadata
      const enhancedReport = {
        title,
        type,
        data,
        columns,
        config,
        generatedAt: new Date(),
        filters: { ...filters },
        metadata: {
          totalRecords: data.length,
          dateRange: filters.dateRange,
          hasCharts: true,
          hasInsights: true
        }
      };

      setCurrentReport(enhancedReport);
      setReportData(data);
      
      if (!isRefresh) {
        showSuccess("Report Generated", `${title} has been generated successfully!`, 4000);
      }
    } catch (error) {
            showError("Report Generation Failed", `Failed to generate report: ${error.message}`, 5000);
    } finally {
      setLoading(null);
      setIsLoading(false);
    }
  };

  const handleFilterChange = (newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    if (currentReport) {
      generateReport(currentReport.type, true);
    }
  };

  const handleViewModeChange = (mode) => {
    setViewMode(mode);
  };

  const handleAutoRefreshToggle = () => {
    setAutoRefresh(!autoRefresh);
  };

  const handleBackToReports = () => {
    setCurrentReport(null);
    setReportData(null);
    setViewMode('table'); // Reset to default view mode
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
        <LoadingOverlay 
          title="Generating Report" 
          description="Processing your data and creating visualizations..." 
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Enhanced Header */}
      <EnhancedReportHeader 
        onViewModeChange={handleViewModeChange}
        viewMode={viewMode}
        onAutoRefreshToggle={handleAutoRefreshToggle}
        autoRefresh={autoRefresh}
        currentReport={currentReport}
        filters={filters}
        onFilterChange={handleFilterChange}
      />

      {/* Main Content */}
      <div className="pt-16 p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Interactive Report Cards - Only show when no report is active */}
        {!currentReport && (
          <InteractiveReportCards 
            onGenerateReport={generateReport} 
            loading={loading}
            currentReport={currentReport}
          />
        )}


        {/* View Mode Info - Only show when report is active */}
        {currentReport && (
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
            <div className="flex items-start sm:items-center gap-3">
              <button
                onClick={handleBackToReports}
                className="h-10 w-10 sm:h-12 sm:w-12 p-0 bg-blue-50 hover:bg-blue-100 rounded-lg flex items-center justify-center border-2 flex-shrink-0"
                style={{
                  borderColor: '#3b82f6',
                  color: '#3b82f6',
                  borderWidth: '2px',
                  borderStyle: 'solid',
                  borderRadius: '8px',
                  backgroundColor: '#f0f9ff',
                }}
              >
                <ArrowLeft size={20} className="sm:w-6 sm:h-6" />
              </button>
              <div className="min-w-0 flex-1">
                <h3 className="font-semibold text-blue-900 dark:text-blue-100 truncate">
                  {viewMode === 'table' && 'Table View'}
                  {viewMode === 'chart' && 'Chart View'}
                  {viewMode === 'insights' && 'Insights View'}
                </h3>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  {viewMode === 'table' && 'View detailed data in a sortable table format'}
                  {viewMode === 'chart' && 'Visualize data with interactive charts and graphs'}
                  {viewMode === 'insights' && 'Get key insights and analytics from your data'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Report Content */}
        {currentReport && (
          <div className="space-y-6">
            {/* Report Insights - Only show in insights view mode */}
            {viewMode === 'insights' && (
              <ReportInsights 
                report={currentReport}
                data={reportData}
              />
            )}

            {/* Report Visualizations - Only show in chart view mode */}
            {viewMode === 'chart' && (
              <ReportVisualizations 
                report={currentReport}
                data={reportData}
              />
            )}

            {/* Report Table - Only show in table view mode */}
            {viewMode === 'table' && (
              <AdvancedReportTable 
                report={currentReport}
                data={reportData}
                onSort={(field, order) => handleFilterChange({ sortBy: field, sortOrder: order })}
              />
            )}

            {/* Export Panel - Always show when report is available */}
            <ReportExportPanel 
              report={currentReport}
              data={reportData}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default ReportsPage;
