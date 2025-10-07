import React, { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/shared/Card";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  BarChart3,
  PieChart as PieChartIcon,
  Activity,
  RefreshCw,
  Maximize2,
  Download,
} from "lucide-react";

const RealTimeChart = ({
  title,
  data = [],
  type = "line", // line, area, bar, pie
  height = 300,
  loading = false,
  realTime = false,
  color = "#3b82f6",
  showTrend = true,
  trendData = null,
  className = "",
  onRefresh = null,
  onExport = null,
  compact = false,
  dataKey = "value",
  xAxisKey = "name",
  yAxisLabel = "Value",
  tooltipFormatter = null,
  lastUpdated = null,
}) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [chartType, setChartType] = useState(type);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const chartRef = useRef(null);

  const chartTypes = [
    { id: "line", icon: Activity, label: "Line" },
    { id: "area", icon: TrendingUp, label: "Area" },
    { id: "bar", icon: BarChart3, label: "Bar" },
    { id: "pie", icon: PieChartIcon, label: "Pie" },
  ];

  const colors = [
    "#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6",
    "#06b6d4", "#84cc16", "#f97316", "#ec4899", "#6366f1"
  ];

  useEffect(() => {
    if (realTime) {
      const interval = setInterval(() => {
        // Simulate real-time data updates
        if (onRefresh) {
          onRefresh();
        }
      }, 30000); // Update every 30 seconds

      return () => clearInterval(interval);
    }
  }, [realTime, onRefresh]);

  const handleRefresh = async () => {
    if (onRefresh) {
      setIsRefreshing(true);
      await onRefresh();
      setIsRefreshing(false);
    }
  };

  const calculateTrend = () => {
    if (!trendData || trendData.length < 2) return null;
    
    const latest = trendData[trendData.length - 1];
    const previous = trendData[trendData.length - 2];
    
    if (!latest || !previous) return null;
    
    const change = latest - previous;
    const percentage = ((change / previous) * 100).toFixed(1);
    
    return {
      value: Math.abs(percentage),
      direction: change >= 0 ? "up" : "down",
      isPositive: change >= 0,
    };
  };

  const renderChart = () => {
    if (loading) {
      return (
        <div className={`flex items-center justify-center ${
          compact ? "h-48" : `h-${height}`
        }`}>
          <div className="text-center">
            <RefreshCw className="w-8 h-8 animate-spin text-blue-500 mx-auto mb-2" />
            <p className="text-gray-500 dark:text-gray-400 text-sm">Loading chart data...</p>
          </div>
        </div>
      );
    }

    if (!data || data.length === 0) {
      return (
        <div className={`flex items-center justify-center ${
          compact ? "h-48" : `h-${height}`
        }`}>
          <div className="text-center">
            <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-500 dark:text-gray-400">No data available</p>
          </div>
        </div>
      );
    }

    const commonProps = {
      width: "100%",
      height: compact ? 200 : height,
      data,
    };

    switch (chartType) {
      case "line":
        return (
          <ResponsiveContainer {...commonProps}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
              <XAxis 
                dataKey={xAxisKey} 
                className="dark:stroke-gray-400"
                stroke="currentColor"
                fontSize={12}
              />
              <YAxis 
                className="dark:stroke-gray-400"
                stroke="currentColor"
                fontSize={12}
                label={{ value: yAxisLabel, angle: -90, position: 'insideLeft' }}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'var(--tooltip-bg, white)',
                  border: '1px solid var(--tooltip-border, #e5e7eb)',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                  color: 'var(--tooltip-text, #111827)',
                }}
                wrapperStyle={{
                  zIndex: 1000,
                }}
                formatter={tooltipFormatter}
              />
              <Line 
                type="monotone" 
                dataKey={dataKey} 
                stroke={color}
                strokeWidth={3}
                dot={{ fill: color, strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: color, strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        );

      case "area":
        return (
          <ResponsiveContainer {...commonProps}>
            <AreaChart data={data}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
              <XAxis dataKey={xAxisKey} className="dark:stroke-gray-400" stroke="currentColor" fontSize={12} />
              <YAxis className="dark:stroke-gray-400" stroke="currentColor" fontSize={12} />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'var(--tooltip-bg, white)',
                  border: '1px solid var(--tooltip-border, #e5e7eb)',
                  borderRadius: '8px',
                  color: 'var(--tooltip-text, #111827)',
                }}
                wrapperStyle={{
                  zIndex: 1000,
                }}
                formatter={tooltipFormatter}
              />
              <Area 
                type="monotone" 
                dataKey={dataKey} 
                stroke={color}
                fill={color}
                fillOpacity={0.3}
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        );

      case "bar":
        return (
          <ResponsiveContainer {...commonProps}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
              <XAxis dataKey={xAxisKey} className="dark:stroke-gray-400" stroke="currentColor" fontSize={12} />
              <YAxis className="dark:stroke-gray-400" stroke="currentColor" fontSize={12} />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'var(--tooltip-bg, white)',
                  border: '1px solid var(--tooltip-border, #e5e7eb)',
                  borderRadius: '8px',
                  color: 'var(--tooltip-text, #111827)',
                }}
                wrapperStyle={{
                  zIndex: 1000,
                }}
                formatter={tooltipFormatter}
              />
              <Bar dataKey={dataKey} fill={color} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        );

      case "pie":
        return (
          <ResponsiveContainer {...commonProps}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={compact ? 60 : 80}
                fill="#8884d8"
                dataKey={dataKey}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'var(--tooltip-bg, white)',
                  border: '1px solid var(--tooltip-border, #e5e7eb)',
                  borderRadius: '8px',
                  color: 'var(--tooltip-text, #111827)',
                }}
                wrapperStyle={{
                  zIndex: 1000,
                }}
                formatter={tooltipFormatter}
              />
            </PieChart>
          </ResponsiveContainer>
        );

      default:
        return null;
    }
  };

  const trend = calculateTrend();

  return (
    <Card className={`relative overflow-hidden transition-all duration-300 hover:shadow-lg ${className}`}>
      <CardHeader className={`${compact ? "p-3 sm:p-4" : "p-4 sm:p-6"}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <CardTitle className={`font-semibold text-gray-900 dark:text-white ${
              compact ? "text-sm" : "text-base"
            }`}>
              {title}
            </CardTitle>
            
            {/* Real-time indicator */}
            {realTime && (
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-xs text-green-600 dark:text-green-400 font-medium">
                  Live
                </span>
              </div>
            )}
          </div>

          <div className="flex items-center space-x-2">
            {/* Chart type selector */}
            <div className="flex items-center space-x-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
              {chartTypes.map((type) => {
                const Icon = type.icon;
                return (
                  <button
                    key={type.id}
                    onClick={() => setChartType(type.id)}
                    className={`p-1.5 rounded-md transition-all duration-200 ${
                      chartType === type.id
                        ? "bg-white dark:bg-gray-700 shadow-sm"
                        : "hover:bg-white/50 dark:hover:bg-gray-700/50"
                    }`}
                    title={type.label}
                  >
                    <Icon className={`w-4 h-4 ${
                      chartType === type.id 
                        ? "text-blue-600 dark:text-blue-400" 
                        : "text-gray-500 dark:text-gray-400"
                    }`} />
                  </button>
                );
              })}
            </div>

            {/* Action buttons */}
            <div className="flex items-center space-x-1">
              {onRefresh && (
                <button
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                  className="p-1.5 text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200"
                  title="Refresh data"
                >
                  <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`} />
                </button>
              )}
              
              {onExport && (
                <button
                  onClick={onExport}
                  className="p-1.5 text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200"
                  title="Export chart"
                >
                  <Download className="w-4 h-4" />
                </button>
              )}
              
              <button
                onClick={() => setIsFullscreen(!isFullscreen)}
                className="p-1.5 text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200"
                title="Toggle fullscreen"
              >
                <Maximize2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Trend indicator */}
        {showTrend && trend && (
          <div className="flex items-center space-x-2 mt-2">
            <div className={`flex items-center space-x-1 ${
              trend.isPositive ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
            }`}>
              {trend.isPositive ? (
                <TrendingUp className="w-4 h-4" />
              ) : (
                <TrendingDown className="w-4 h-4" />
              )}
              <span className="text-sm font-medium">
                {trend.value}%
              </span>
            </div>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              vs previous period
            </span>
          </div>
        )}

        {/* Last updated */}
        {lastUpdated && (
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
            Last updated: {new Date(lastUpdated).toLocaleTimeString()}
          </p>
        )}
      </CardHeader>

      <CardContent className={`${compact ? "p-3 sm:p-4 pt-0" : "p-4 sm:p-6 pt-0"}`}>
        {renderChart()}
      </CardContent>

      {/* Fullscreen overlay */}
      {isFullscreen && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 rounded-xl p-6 w-full max-w-6xl max-h-[90vh] overflow-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                {title} - Full View
              </h3>
              <button
                onClick={() => setIsFullscreen(false)}
                className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              >
                <Maximize2 className="w-5 h-5" />
              </button>
            </div>
            <div className="h-[60vh]">
              <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
                <div className="text-center">
                  <BarChart3 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium">Full View</p>
                  <p className="text-sm">Chart expanded to full screen</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
};

export default RealTimeChart;

