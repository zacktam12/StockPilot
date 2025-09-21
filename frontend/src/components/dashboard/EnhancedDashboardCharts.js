// Enhanced dashboard charts with advanced analytics
import React, { useState, useEffect } from 'react';
import { 
  Line, 
  Bar, 
  Doughnut, 
  Pie,
  ResponsiveContainer,
  LineChart,
  BarChart,
  PieChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Cell,
  Area,
  AreaChart,
  ComposedChart
} from 'recharts';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Users, 
  Package, 
  ShoppingCart,
  BarChart3,
  PieChart as PieChartIcon,
  Activity,
  Target,
  Zap
} from 'lucide-react';
import { 
  formatCurrency, 
  formatNumber, 
  formatPercentage, 
  formatDate,
  formatDateShort,
  generateChartColors,
  calculateChartData,
  getTrendIndicator,
  getDashboardTheme
} from './DashboardAnalytics';

// Enhanced Revenue Chart Component
export const EnhancedRevenueChart = ({ data, period = '30d', theme = 'light' }) => {
  const [chartData, setChartData] = useState([]);
  const [metrics, setMetrics] = useState({});

  useEffect(() => {
    if (data && data.timeSeries) {
      const processedData = data.timeSeries.map(item => ({
        date: formatDateShort(item.createdAt || item.date),
        revenue: item._sum?.totalPrice || item.revenue || 0,
        orders: item._count?.id || item.orders || 0,
        avgOrderValue: item._count?.id > 0 ? (item._sum?.totalPrice || 0) / item._count.id : 0
      }));

      setChartData(processedData);
      
      // Calculate metrics
      const totalRevenue = processedData.reduce((sum, item) => sum + item.revenue, 0);
      const totalOrders = processedData.reduce((sum, item) => sum + item.orders, 0);
      const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
      
      setMetrics({
        totalRevenue,
        totalOrders,
        avgOrderValue,
        period
      });
    }
  }, [data, period]);

  const themeColors = getDashboardTheme(theme);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <DollarSign className="h-5 w-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Revenue Analytics
          </h3>
        </div>
        <div className="flex space-x-4 text-sm">
          <div className="text-center">
            <div className="font-semibold text-gray-900 dark:text-white">
              {formatCurrency(metrics.totalRevenue)}
            </div>
            <div className="text-gray-500">Total Revenue</div>
          </div>
          <div className="text-center">
            <div className="font-semibold text-gray-900 dark:text-white">
              {formatNumber(metrics.totalOrders)}
            </div>
            <div className="text-gray-500">Orders</div>
          </div>
          <div className="text-center">
            <div className="font-semibold text-gray-900 dark:text-white">
              {formatCurrency(metrics.avgOrderValue)}
            </div>
            <div className="text-gray-500">Avg Order</div>
          </div>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <ComposedChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke={themeColors.textSecondary} />
          <XAxis 
            dataKey="date" 
            stroke={themeColors.textSecondary}
            fontSize={12}
          />
          <YAxis 
            stroke={themeColors.textSecondary}
            fontSize={12}
            tickFormatter={(value) => formatCurrency(value, { notation: 'compact' })}
          />
          <Tooltip 
            contentStyle={{
              backgroundColor: themeColors.surface,
              border: `1px solid ${themeColors.textSecondary}`,
              borderRadius: '8px'
            }}
            formatter={(value, name) => [
              name === 'revenue' ? formatCurrency(value) : formatNumber(value),
              name === 'revenue' ? 'Revenue' : name === 'orders' ? 'Orders' : 'Avg Order Value'
            ]}
            labelFormatter={(label) => `Date: ${label}`}
          />
          <Legend />
          <Bar 
            dataKey="revenue" 
            fill={themeColors.primary}
            name="Revenue"
            radius={[4, 4, 0, 0]}
          />
          <Line 
            type="monotone" 
            dataKey="avgOrderValue" 
            stroke={themeColors.warning}
            strokeWidth={2}
            name="Avg Order Value"
            dot={{ fill: themeColors.warning, strokeWidth: 2, r: 4 }}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
};

// Enhanced Sales Analytics Chart
export const EnhancedSalesChart = ({ data, period = '30d', theme = 'light' }) => {
  const [chartData, setChartData] = useState([]);
  const [summary, setSummary] = useState({});

  useEffect(() => {
    if (data) {
      // Process sales by status data
      const statusData = data.salesByStatus?.map(item => ({
        status: item.status,
        count: item._count?.id || 0,
        revenue: item._sum?.totalPrice || 0
      })) || [];

      // Process sales by payment method data
      const paymentData = data.salesByPaymentMethod?.map(item => ({
        method: item.paymentMethod,
        count: item._count?.id || 0,
        revenue: item._sum?.totalPrice || 0
      })) || [];

      setChartData({ statusData, paymentData });

      // Calculate summary
      const totalRevenue = data.metrics?.totalRevenue || 0;
      const totalOrders = data.metrics?.totalOrders || 0;
      const avgOrderValue = data.metrics?.averageOrderValue || 0;

      setSummary({ totalRevenue, totalOrders, avgOrderValue });
    }
  }, [data]);

  const themeColors = getDashboardTheme(theme);
  const chartColors = generateChartColors(10);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Sales by Status */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center space-x-2 mb-4">
          <BarChart3 className="h-5 w-5 text-green-600" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Sales by Status
          </h3>
        </div>
        
        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie
              data={chartData.statusData}
              dataKey="revenue"
              nameKey="status"
              cx="50%"
              cy="50%"
              outerRadius={80}
              label={({ status, percent }) => `${status}: ${(percent * 100).toFixed(1)}%`}
            >
              {chartData.statusData?.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={chartColors[index % chartColors.length]} />
              ))}
            </Pie>
            <Tooltip 
              formatter={(value) => [formatCurrency(value), 'Revenue']}
              contentStyle={{
                backgroundColor: themeColors.surface,
                border: `1px solid ${themeColors.textSecondary}`,
                borderRadius: '8px'
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Sales by Payment Method */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center space-x-2 mb-4">
          <ShoppingCart className="h-5 w-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Payment Methods
          </h3>
        </div>
        
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={chartData.paymentData}>
            <CartesianGrid strokeDasharray="3 3" stroke={themeColors.textSecondary} />
            <XAxis 
              dataKey="method" 
              stroke={themeColors.textSecondary}
              fontSize={12}
            />
            <YAxis 
              stroke={themeColors.textSecondary}
              fontSize={12}
            />
            <Tooltip 
              formatter={(value) => [formatCurrency(value), 'Revenue']}
              contentStyle={{
                backgroundColor: themeColors.surface,
                border: `1px solid ${themeColors.textSecondary}`,
                borderRadius: '8px'
              }}
            />
            <Bar dataKey="revenue" fill={themeColors.primary} radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

// Enhanced Customer Analytics Chart
export const EnhancedCustomerChart = ({ data, theme = 'light' }) => {
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    if (data && data.customerAcquisition) {
      const processedData = data.customerAcquisition.map(item => ({
        date: formatDateShort(item.createdAt),
        customers: item._count?.id || 0
      }));
      setChartData(processedData);
    }
  }, [data]);

  const themeColors = getDashboardTheme(theme);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <Users className="h-5 w-5 text-green-600" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Customer Acquisition
          </h3>
        </div>
        <div className="text-sm text-gray-500">
          Total: {formatNumber(data?.metrics?.totalNewCustomers || 0)} new customers
        </div>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke={themeColors.textSecondary} />
          <XAxis 
            dataKey="date" 
            stroke={themeColors.textSecondary}
            fontSize={12}
          />
          <YAxis 
            stroke={themeColors.textSecondary}
            fontSize={12}
          />
          <Tooltip 
            formatter={(value) => [formatNumber(value), 'New Customers']}
            contentStyle={{
              backgroundColor: themeColors.surface,
              border: `1px solid ${themeColors.textSecondary}`,
              borderRadius: '8px'
            }}
          />
          <Area 
            type="monotone" 
            dataKey="customers" 
            stroke={themeColors.success} 
            fill={themeColors.success}
            fillOpacity={0.3}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

// Enhanced Inventory Analytics Chart
export const EnhancedInventoryChart = ({ data, theme = 'light' }) => {
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    if (data && data.inventoryStats) {
      const processedData = data.inventoryStats.map(item => ({
        category: item.categoryId || 'Uncategorized',
        quantity: item._sum?.quantity || 0,
        value: item._sum?.costPrice || 0,
        count: item._count?.id || 0
      }));
      setChartData(processedData);
    }
  }, [data]);

  const themeColors = getDashboardTheme(theme);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Inventory by Category */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Package className="h-5 w-5 text-purple-600" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Inventory by Category
          </h3>
        </div>
        
        <ResponsiveContainer width="100%" height={250}>
          <Doughnut>
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="category"
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              label={({ category, percent }) => `${category}: ${(percent * 100).toFixed(1)}%`}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={generateChartColors(chartData.length)[index]} />
              ))}
            </Pie>
            <Tooltip 
              formatter={(value) => [formatCurrency(value), 'Value']}
              contentStyle={{
                backgroundColor: themeColors.surface,
                border: `1px solid ${themeColors.textSecondary}`,
                borderRadius: '8px'
              }}
            />
          </Doughnut>
        </ResponsiveContainer>
      </div>

      {/* Stock Levels */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Activity className="h-5 w-5 text-orange-600" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Stock Levels
          </h3>
        </div>
        
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600 dark:text-gray-400">Low Stock</span>
            <span className="text-lg font-semibold text-yellow-600">
              {data?.metrics?.lowStockCount || 0}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600 dark:text-gray-400">Out of Stock</span>
            <span className="text-lg font-semibold text-red-600">
              {data?.metrics?.outOfStockCount || 0}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600 dark:text-gray-400">Total Value</span>
            <span className="text-lg font-semibold text-green-600">
              {formatCurrency(data?.metrics?.totalInventoryValue || 0)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Enhanced Performance Metrics Chart
export const EnhancedPerformanceChart = ({ data, theme = 'light' }) => {
  const themeColors = getDashboardTheme(theme);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-6">
      {/* Sales Performance */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center space-x-2 mb-4">
          <TrendingUp className="h-5 w-5 text-green-600" />
          <h3 className="text-sm font-medium text-gray-900 dark:text-white">Sales</h3>
        </div>
        <div className="space-y-2">
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {formatCurrency(data?.sales?.totalRevenue || 0)}
          </div>
          <div className="text-sm text-gray-500">
            {formatNumber(data?.sales?.totalOrders || 0)} orders
          </div>
          <div className="text-sm text-gray-500">
            Avg: {formatCurrency(data?.sales?.averageOrderValue || 0)}
          </div>
        </div>
      </div>

      {/* Profitability */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Target className="h-5 w-5 text-blue-600" />
          <h3 className="text-sm font-medium text-gray-900 dark:text-white">Profitability</h3>
        </div>
        <div className="space-y-2">
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {formatPercentage(data?.profitability?.profitMargin || 0)}
          </div>
          <div className="text-sm text-gray-500">
            {formatCurrency(data?.profitability?.grossProfit || 0)} gross profit
          </div>
        </div>
      </div>

      {/* Customer Conversion */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Users className="h-5 w-5 text-purple-600" />
          <h3 className="text-sm font-medium text-gray-900 dark:text-white">Conversion</h3>
        </div>
        <div className="space-y-2">
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {formatPercentage(data?.conversion?.customerActivationRate || 0)}
          </div>
          <div className="text-sm text-gray-500">
            {formatNumber(data?.conversion?.activeCustomers || 0)} active customers
          </div>
        </div>
      </div>

      {/* Performance Score */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Zap className="h-5 w-5 text-yellow-600" />
          <h3 className="text-sm font-medium text-gray-900 dark:text-white">Performance</h3>
        </div>
        <div className="space-y-2">
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {Math.round((data?.sales?.totalOrders || 0) / Math.max(data?.conversion?.totalCustomers || 1, 1) * 100)}%
          </div>
          <div className="text-sm text-gray-500">Activity rate</div>
        </div>
      </div>
    </div>
  );
};

// Real-time Activity Feed Component
export const RealTimeActivityFeed = ({ data, theme = 'light' }) => {
  const themeColors = getDashboardTheme(theme);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center space-x-2 mb-4">
        <Activity className="h-5 w-5 text-blue-600" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Recent Activity
        </h3>
      </div>
      
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {data?.map((activity, index) => (
          <div key={index} className="flex items-start space-x-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-700">
            <div className={`w-2 h-2 rounded-full mt-2 ${
              activity.type === 'sale' ? 'bg-green-500' : 
              activity.type === 'purchase' ? 'bg-blue-500' : 
              'bg-gray-500'
            }`} />
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-gray-900 dark:text-white">
                {activity.type === 'sale' ? 'New Sale' : 
                 activity.type === 'purchase' ? 'New Purchase' : 
                 'Activity'}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {activity.relatedEntity?.name || 'Unknown'} • {formatCurrency(activity.amount)}
              </div>
              <div className="text-xs text-gray-400 dark:text-gray-500">
                {formatDate(activity.date)}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Export all enhanced chart components
export default {
  EnhancedRevenueChart,
  EnhancedSalesChart,
  EnhancedCustomerChart,
  EnhancedInventoryChart,
  EnhancedPerformanceChart,
  RealTimeActivityFeed
};
