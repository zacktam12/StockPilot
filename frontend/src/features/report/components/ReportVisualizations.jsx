import React, { useState, useMemo } from "react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Area,
  AreaChart,
  Scatter,
  ScatterChart,
  ZAxis
} from "recharts";
import { 
  BarChart3, 
  TrendingUp, 
  PieChart as PieChartIcon, 
  Activity,
  Download,
  Maximize2,
  RotateCcw
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/shared/Card";
import Button from "../../../components/shared/Button";
// Using CSS animations instead of framer-motion

const ReportVisualizations = ({ report, data }) => {
  const [chartType, setChartType] = useState(report?.config?.chartType || 'bar');
  const [isFullscreen, setIsFullscreen] = useState(false);

  const chartTypes = [
    { id: 'bar', label: 'Bar Chart', icon: BarChart3 },
    { id: 'line', label: 'Line Chart', icon: TrendingUp },
    { id: 'pie', label: 'Pie Chart', icon: PieChartIcon },
    { id: 'area', label: 'Area Chart', icon: Activity }
  ];

  const colors = [
    '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', 
    '#06B6D4', '#84CC16', '#F97316', '#EC4899', '#6366F1'
  ];

  const processedData = useMemo(() => {
    if (!data || !report) return [];

    switch (report.type) {
      case 'sales':
        return data.map((item, index) => ({
          name: item.customer_name || `Order ${index + 1}`,
          value: item.total_amount || 0,
          date: new Date(item.created_at).toLocaleDateString(),
          status: item.status,
          order_id: item.order_id || item.id
        }));

      case 'inventory':
        return data.map((item, index) => ({
          name: item.name,
          value: item.quantity || 0,
          price: item.price || 0,
          category: item.category_name || 'Uncategorized',
          status: item.status || (item.quantity < 10 ? 'Low Stock' : 'In Stock'),
          total_value: item.total_value || 0
        }));

      case 'purchases':
        return data.map((item, index) => ({
          name: item.supplier_name || `Order ${index + 1}`,
          value: item.total_amount || 0,
          date: new Date(item.created_at).toLocaleDateString(),
          status: item.status,
          order_number: item.order_number || item.id,
          product_count: item.product_count || 0
        }));

      case 'revenue':
        return data.map((item, index) => ({
          name: item.month,
          value: item.total || 0,
          growth: item.growth || 0,
          orders_count: item.orders_count || 0
        }));

      case 'products':
        return data.map((item, index) => ({
          name: item.product_name,
          value: item.total_sold || 0,
          revenue: item.total_revenue || 0,
          category: item.category || 'Uncategorized'
        }));

      case 'alerts':
        return data.map((item, index) => ({
          name: item.name,
          value: item.quantity || 0,
          minStock: item.min_stock || 0,
          category: item.category_name || 'Uncategorized'
        }));

      case 'valuation':
        return data.map((item, index) => ({
          name: item.name,
          value: item.total_value || 0,
          quantity: item.quantity || 0,
          price: item.price || 0,
          category: item.category_name || 'Uncategorized'
        }));

      case 'suppliers':
        return data.map((item, index) => ({
          name: item.supplier_name,
          orders: item.total_orders || 0,
          spent: item.total_spent || 0,
          rating: item.rating || 0
        }));

      case 'costs':
        return data.map((item, index) => ({
          name: item.product_name,
          value: item.total_cost || 0,
          cost: item.total_cost || 0,
          purchased: item.total_purchased || 0,
          avg_cost: item.avg_cost || 0,
          category: item.category || 'Uncategorized',
          trend: item.trend || 'Stable'
        }));

      default:
        return data.map((item, index) => ({
          name: `Item ${index + 1}`,
          value: item.value || 0
        }));
    }
  }, [data, report]);

  const renderChart = () => {
    const commonProps = {
      data: processedData,
      margin: { top: 20, right: 30, left: 20, bottom: 5 }
    };

    switch (chartType) {
      case 'bar':
        return (
          <BarChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="value" fill="#3B82F6" />
          </BarChart>
        );

      case 'line':
        return (
          <LineChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="value" stroke="#3B82F6" strokeWidth={2} />
          </LineChart>
        );

      case 'pie':
        return (
          <PieChart {...commonProps}>
            <Pie
              data={processedData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {processedData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        );

      case 'area':
        return (
          <AreaChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Area type="monotone" dataKey="value" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.3} />
          </AreaChart>
        );

      default:
        return (
          <BarChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="value" fill="#3B82F6" />
          </BarChart>
        );
    }
  };

  const exportChart = () => {
    // Chart export functionality would go here
  };

  const resetChart = () => {
    setChartType(report?.config?.chartType || 'bar');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Chart Controls */}
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4">
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-blue-600" />
              <span className="truncate">Data Visualizations</span>
            </CardTitle>
            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={resetChart}
                className="flex-1 sm:flex-initial text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white flex items-center justify-center gap-2"
              >
                <RotateCcw size={14} />
                <span className="hidden sm:inline">Reset</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={exportChart}
                className="flex-1 sm:flex-initial text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 flex items-center justify-center gap-2"
              >
                <Download size={14} />
                <span className="hidden sm:inline">Export</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsFullscreen(!isFullscreen)}
                className="flex-1 sm:flex-initial text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300 flex items-center justify-center gap-2"
              >
                <Maximize2 size={14} />
                <span className="hidden sm:inline">{isFullscreen ? 'Exit' : 'Fullscreen'}</span>
                <span className="sm:hidden">{isFullscreen ? 'Exit' : 'Full'}</span>
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {/* Chart Type Selector */}
          <div className="flex flex-wrap gap-2 mb-6">
            {chartTypes.map((type) => {
              const Icon = type.icon;
              return (
                <Button
                  key={type.id}
                  variant={chartType === type.id ? "primary" : "outline"}
                  size="sm"
                  onClick={() => setChartType(type.id)}
                  className={`flex items-center gap-2 ${
                    chartType === type.id 
                      ? 'bg-blue-600 text-white' 
                      : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  <Icon size={16} />
                  {type.label}
                </Button>
              );
            })}
          </div>

          {/* Chart Container */}
          <div className={`bg-gray-50 dark:bg-gray-800 rounded-xl p-2 sm:p-4 ${
            isFullscreen ? 'fixed inset-4 z-50 bg-white dark:bg-gray-900' : ''
          }`}>
            <div className={`${isFullscreen ? 'h-[calc(100vh-8rem)]' : 'h-64 sm:h-80 md:h-96'}`}>
              <ResponsiveContainer width="100%" height="100%">
                {renderChart()}
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart Info */}
          <div className="mt-4 flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
            <div className="flex items-center gap-4">
              <span>Data Points: {processedData.length}</span>
              <span>Chart Type: {chartTypes.find(t => t.id === chartType)?.label}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span>Primary Data</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Additional Charts for Different Data Types */}
      {report?.type === 'revenue' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-600" />
              Revenue Growth Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={processedData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="value" stroke="#10B981" strokeWidth={3} />
                  <Line type="monotone" dataKey="growth" stroke="#F59E0B" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {report?.type === 'products' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChartIcon className="w-5 h-5 text-purple-600" />
              Category Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={processedData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ category, percent }) => `${category} ${(percent * 100).toFixed(0)}%`}
                  >
                    {processedData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ReportVisualizations;
