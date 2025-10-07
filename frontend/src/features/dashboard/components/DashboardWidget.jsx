import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/shared/Card';
import {
  RefreshCw,
  Settings,
  Maximize2,
  Minimize2,
  MoreHorizontal,
  Wifi,
  WifiOff,
  Clock,
} from 'lucide-react';
import { useSystemSettings } from '../../../hooks/useSystemSettings';
import { formatDateTime } from '../../../utils/formatUtils';

const DashboardWidget = ({
  title,
  children,
  loading = false,
  error = null,
  onRefresh = null,
  onSettings = null,
  realTime = false,
  lastUpdated = null,
  className = '',
  compact = false,
  collapsible = false,
  defaultCollapsed = false,
  headerActions = null,
}) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);
  const [showSettings, setShowSettings] = useState(false);
  
  // System settings
  const { dateFormat, timeFormat } = useSystemSettings();

  const handleRefresh = async () => {
    if (onRefresh) {
      setIsRefreshing(true);
      try {
        await onRefresh();
      } finally {
        setIsRefreshing(false);
      }
    }
  };

  const formatLastUpdated = (timestamp) => {
    if (!timestamp) return null;
    
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) {
      return 'Just now';
    } else if (diffMins < 60) {
      return `${diffMins}m ago`;
    } else if (diffMins < 1440) {
      return `${Math.floor(diffMins / 60)}h ago`;
    } else {
      return formatDateTime(date, dateFormat, timeFormat);
    }
  };

  return (
    <Card className={`relative overflow-hidden transition-all duration-300 hover:shadow-lg group ${className}`}>
      {/* Header */}
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

            {/* Connection status */}
            {realTime && (
              <div className="flex items-center space-x-1">
                <Wifi className="w-4 h-4 text-green-600 dark:text-green-400" />
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  Connected
                </span>
              </div>
            )}

            {/* Last updated */}
            {lastUpdated && (
              <div className="flex items-center space-x-1">
                <Clock className="w-3 h-3 text-gray-400" />
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {formatLastUpdated(lastUpdated)}
                </span>
              </div>
            )}
          </div>

          {/* Header Actions */}
          <div className="flex items-center space-x-2">
            {headerActions}

            {/* Collapse button */}
            {collapsible && (
              <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="p-1.5 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors duration-200"
                title={isCollapsed ? "Expand" : "Collapse"}
              >
                {isCollapsed ? (
                  <Maximize2 className="w-4 h-4" />
                ) : (
                  <Minimize2 className="w-4 h-4" />
                )}
              </button>
            )}

            {/* Refresh button */}
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

            {/* Settings button */}
            {onSettings && (
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="p-1.5 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors duration-200"
                title="Widget settings"
              >
                <Settings className="w-4 h-4" />
              </button>
            )}

            {/* More options */}
            <button className="p-1.5 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors duration-200 opacity-0 group-hover:opacity-100">
              <MoreHorizontal className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="mt-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-sm text-red-800 dark:text-red-200">
              {error}
            </p>
          </div>
        )}
      </CardHeader>

      {/* Content */}
      {!isCollapsed && (
        <CardContent className={`${compact ? "p-3 sm:p-4 pt-0" : "p-4 sm:p-6 pt-0"}`}>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <RefreshCw className="w-8 h-8 animate-spin text-blue-500 mx-auto mb-2" />
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                  Loading {title.toLowerCase()}...
                </p>
              </div>
            </div>
          ) : (
            children
          )}
        </CardContent>
      )}

      {/* Settings Panel */}
      {showSettings && onSettings && (
        <div className="border-t border-gray-200 dark:border-gray-700 p-4 bg-gray-50 dark:bg-gray-800/50">
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-gray-900 dark:text-white">
              Widget Settings
            </h4>
            {onSettings()}
          </div>
        </div>
      )}

      {/* Loading overlay */}
      {isRefreshing && (
        <div className="absolute inset-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm flex items-center justify-center">
          <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
            <RefreshCw className="w-4 h-4 animate-spin" />
            <span className="text-sm font-medium">Refreshing...</span>
          </div>
        </div>
      )}
    </Card>
  );
};

export default DashboardWidget;

