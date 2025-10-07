// Enhanced dashboard analytics utilities and components
import React from 'react';

// Analytics utility functions
export const formatCurrency = (amount, currency = 'USD') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount || 0);
};

export const formatNumber = (number, decimals = 0) => {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(number || 0);
};

export const formatPercentage = (value, decimals = 1) => {
  return new Intl.NumberFormat('en-US', {
    style: 'percent',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format((value || 0) / 100);
};

export const formatDate = (date, options = {}) => {
  if (!date) {
    return "No date available";
  }
  
  try {
    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) {
      return "Invalid date";
    }
    
    const defaultOptions = {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    
    return new Intl.DateTimeFormat('en-US', { ...defaultOptions, ...options }).format(dateObj);
  } catch (error) {
    return "Invalid date";
  }
};

export const formatDateShort = (date) => {
  if (!date) {
    return "No date available";
  }
  
  try {
    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) {
      return "Invalid date";
    }
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric'
    }).format(dateObj);
  } catch (error) {
    return "Invalid date";
  }
};

// Calculate percentage change
export const calculatePercentageChange = (current, previous) => {
  if (!previous || previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
};

// Get trend indicator
export const getTrendIndicator = (change) => {
  if (change > 0) return { direction: 'up', color: 'text-green-600', icon: '↗' };
  if (change < 0) return { direction: 'down', color: 'text-red-600', icon: '↘' };
  return { direction: 'neutral', color: 'text-gray-600', icon: '→' };
};

// Get status color
export const getStatusColor = (status) => {
  const statusColors = {
    'completed': 'text-green-600 bg-green-50',
    'pending': 'text-yellow-600 bg-yellow-50',
    'cancelled': 'text-red-600 bg-red-50',
    'refunded': 'text-orange-600 bg-orange-50',
    'partially_refunded': 'text-orange-600 bg-orange-50',
    'received': 'text-green-600 bg-green-50',
    'partially_received': 'text-blue-600 bg-blue-50',
    'on_hold': 'text-purple-600 bg-purple-50',
    'active': 'text-green-600 bg-green-50',
    'inactive': 'text-gray-600 bg-gray-50',
    'low-stock': 'text-yellow-600 bg-yellow-50',
    'out-of-stock': 'text-red-600 bg-red-50'
  };
  
  return statusColors[status] || 'text-gray-600 bg-gray-50';
};

// Get priority color
export const getPriorityColor = (priority) => {
  const priorityColors = {
    'urgent': 'text-red-600 bg-red-50',
    'high': 'text-orange-600 bg-orange-50',
    'medium': 'text-yellow-600 bg-yellow-50',
    'low': 'text-green-600 bg-green-50'
  };
  
  return priorityColors[priority] || 'text-gray-600 bg-gray-50';
};

// Calculate time ago
export const getTimeAgo = (date) => {
  const now = new Date();
  const past = new Date(date);
  const diffInSeconds = Math.floor((now - past) / 1000);
  
  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d ago`;
  if (diffInSeconds < 31536000) return `${Math.floor(diffInSeconds / 2592000)}mo ago`;
  return `${Math.floor(diffInSeconds / 31536000)}y ago`;
};

// Generate chart colors
export const generateChartColors = (count) => {
  const colors = [
    '#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6',
    '#EC4899', '#06B6D4', '#84CC16', '#F97316', '#6366F1'
  ];
  
  return Array.from({ length: count }, (_, i) => colors[i % colors.length]);
};

// Calculate chart data
export const calculateChartData = (data, groupBy = 'day') => {
  if (!data || data.length === 0) return [];
  
  const grouped = data.reduce((acc, item) => {
    let key;
    const date = new Date(item.createdAt || item.date);
    
    switch (groupBy) {
      case 'hour':
        key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}-${String(date.getHours()).padStart(2, '0')}`;
        break;
      case 'day':
        key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
        break;
      case 'week':
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay());
        key = `${weekStart.getFullYear()}-${String(weekStart.getMonth() + 1).padStart(2, '0')}-${String(weekStart.getDate()).padStart(2, '0')}`;
        break;
      case 'month':
        key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        break;
      default:
        key = date.toISOString().split('T')[0];
    }
    
    if (!acc[key]) {
      acc[key] = { date: key, value: 0, count: 0 };
    }
    
    acc[key].value += item.totalPrice || item.totalCost || item.amount || 0;
    acc[key].count += 1;
    
    return acc;
  }, {});
  
  return Object.values(grouped).sort((a, b) => new Date(a.date) - new Date(b.date));
};

// Calculate KPI metrics
export const calculateKPIs = (data) => {
  if (!data || data.length === 0) {
    return {
      totalRevenue: 0,
      totalOrders: 0,
      averageOrderValue: 0,
      totalCustomers: 0,
      conversionRate: 0
    };
  }
  
  const totalRevenue = data.reduce((sum, item) => sum + (item.totalPrice || item.amount || 0), 0);
  const totalOrders = data.length;
  const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
  const uniqueCustomers = new Set(data.map(item => item.customerId).filter(Boolean)).size;
  const totalCustomers = data.reduce((sum, item) => sum + (item.customerCount || 0), 0);
  const conversionRate = totalCustomers > 0 ? (uniqueCustomers / totalCustomers) * 100 : 0;
  
  return {
    totalRevenue,
    totalOrders,
    averageOrderValue,
    totalCustomers: uniqueCustomers,
    conversionRate
  };
};

// Get metric trend
export const getMetricTrend = (current, previous) => {
  const change = calculatePercentageChange(current, previous);
  const indicator = getTrendIndicator(change);
  
  return {
    value: current,
    change,
    changeAbs: Math.abs(change),
    indicator,
    isPositive: change > 0,
    isNegative: change < 0,
    isNeutral: change === 0
  };
};

// Format metric for display
export const formatMetric = (value, type = 'number', options = {}) => {
  switch (type) {
    case 'currency':
      return formatCurrency(value, options.currency);
    case 'percentage':
      return formatPercentage(value, options.decimals);
    case 'number':
      return formatNumber(value, options.decimals);
    case 'compact':
      return new Intl.NumberFormat('en-US', {
        notation: 'compact',
        maximumFractionDigits: 1
      }).format(value);
    default:
      return value;
  }
};

// Get dashboard theme colors
export const getDashboardTheme = (theme = 'light') => {
  const themes = {
    light: {
      primary: '#3B82F6',
      secondary: '#6B7280',
      success: '#10B981',
      warning: '#F59E0B',
      error: '#EF4444',
      info: '#06B6D4',
      background: '#FFFFFF',
      surface: '#F9FAFB',
      text: '#111827',
      textSecondary: '#6B7280'
    },
    dark: {
      primary: '#60A5FA',
      secondary: '#9CA3AF',
      success: '#34D399',
      warning: '#FBBF24',
      error: '#F87171',
      info: '#22D3EE',
      background: '#111827',
      surface: '#1F2937',
      text: '#F9FAFB',
      textSecondary: '#D1D5DB'
    }
  };
  
  return themes[theme] || themes.light;
};

// Dashboard layout utilities
export const getDashboardLayout = (screenSize) => {
  const layouts = {
    mobile: {
      columns: 1,
      cardWidth: 'full',
      chartHeight: 200,
      spacing: 'sm'
    },
    tablet: {
      columns: 2,
      cardWidth: 'half',
      chartHeight: 250,
      spacing: 'md'
    },
    desktop: {
      columns: 3,
      cardWidth: 'third',
      chartHeight: 300,
      spacing: 'lg'
    },
    large: {
      columns: 4,
      cardWidth: 'quarter',
      chartHeight: 350,
      spacing: 'xl'
    }
  };
  
  return layouts[screenSize] || layouts.desktop;
};

// Real-time update utilities
export const createRealTimeUpdater = (callback, interval = 30000) => {
  let intervalId;
  
  const start = () => {
    intervalId = setInterval(callback, interval);
  };
  
  const stop = () => {
    if (intervalId) {
      clearInterval(intervalId);
      intervalId = null;
    }
  };
  
  const update = () => {
    callback();
  };
  
  return { start, stop, update };
};

// Data validation utilities
export const validateDashboardData = (data) => {
  const required = ['stats', 'activities', 'alerts'];
  const missing = required.filter(field => !data[field]);
  
  if (missing.length > 0) {
    console.warn('Dashboard data missing required fields:', missing);
    return false;
  }
  
  return true;
};

// Performance monitoring
export const measurePerformance = (name, fn) => {
  const start = performance.now();
  const result = fn();
  const end = performance.now();
  return result;
};

// Error handling utilities
export const handleDashboardError = (error, context = 'Dashboard') => {
  console.error(`${context} Error:`, error);
  
  const errorTypes = {
    'NETWORK_ERROR': 'Network connection failed',
    'TIMEOUT': 'Request timed out',
    'VALIDATION_ERROR': 'Data validation failed',
    'PERMISSION_ERROR': 'Insufficient permissions',
    'SERVER_ERROR': 'Server error occurred'
  };
  
  const errorMessage = errorTypes[error.type] || 'An unexpected error occurred';
  
  return {
    type: error.type || 'UNKNOWN_ERROR',
    message: errorMessage,
    details: error.message,
    timestamp: new Date().toISOString()
  };
};

// Export all utilities as default
export default {
  formatCurrency,
  formatNumber,
  formatPercentage,
  formatDate,
  formatDateShort,
  calculatePercentageChange,
  getTrendIndicator,
  getStatusColor,
  getPriorityColor,
  getTimeAgo,
  generateChartColors,
  calculateChartData,
  calculateKPIs,
  getMetricTrend,
  formatMetric,
  getDashboardTheme,
  getDashboardLayout,
  createRealTimeUpdater,
  validateDashboardData,
  measurePerformance,
  handleDashboardError
};
