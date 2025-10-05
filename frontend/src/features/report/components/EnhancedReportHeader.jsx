import React, { useState } from "react";
import { 
  BarChart3, 
  Filter, 
  RefreshCw, 
  Eye, 
  EyeOff, 
  Zap,
  Calendar,
  TrendingUp,
  Download,
  Share2,
  Bell
} from "lucide-react";
import { format } from "date-fns";
import Button from "../../../components/shared/Button";
import { Card, CardContent } from "../../../components/shared/Card";
import ReportFilters from "./ReportFilters";

const EnhancedReportHeader = ({ 
  onViewModeChange, 
  viewMode, 
  onAutoRefreshToggle, 
  autoRefresh, 
  currentReport,
  filters,
  onFilterChange
}) => {

  const viewModes = [
    { id: 'table', label: 'Table', icon: BarChart3 },
    { id: 'chart', label: 'Charts', icon: TrendingUp },
    { id: 'insights', label: 'Insights', icon: Eye }
  ];

  return (
    <div className="sticky top-0 z-40 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 shadow-soft relative">
      <div className="p-4 sm:p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          {/* Left Section - Title and Status */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-medium">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Analytics & Reports
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {currentReport ? `Viewing: ${currentReport.title}` : 'Generate comprehensive business insights'}
                </p>
              </div>
            </div>

            {/* Current Report Status */}
            {currentReport && (
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-green-50 dark:bg-green-900/20 rounded-full">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-xs font-medium text-green-700 dark:text-green-400">
                  {currentReport.metadata.totalRecords} records
                </span>
              </div>
            )}
          </div>

          {/* Right Section - Controls */}
          <div className="flex items-center gap-2 sm:gap-3">

            {/* View Mode Toggle - Only show when report is active */}
            {currentReport && (
              <div className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-xl p-1">
                {viewModes.map((mode) => {
                  const Icon = mode.icon;
                  return (
                    <button
                      key={mode.id}
                      onClick={() => onViewModeChange(mode.id)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                        viewMode === mode.id
                          ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm'
                          : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                      }`}
                    >
                      <Icon size={16} />
                      <span className="hidden sm:inline">{mode.label}</span>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Filter Component */}
            <ReportFilters
              filters={filters}
              onFilterChange={onFilterChange}
            />

            {/* Auto Refresh Toggle */}
            <Button
              variant="outline"
              size="sm"
              onClick={onAutoRefreshToggle}
              className={`transition-all duration-200 ${
                autoRefresh 
                  ? 'bg-green-50 border-green-200 text-green-600 dark:bg-green-900/20 dark:border-green-700 dark:text-green-400' 
                  : ''
              }`}
            >
              <RefreshCw size={16} className={autoRefresh ? 'animate-spin' : ''} />
              <span className="hidden sm:inline ml-2">Auto</span>
            </Button>

          </div>
        </div>


        {/* Report Metadata Bar */}
        {currentReport && (
          <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
            <div className="flex items-center gap-2">
              <Calendar size={14} />
              <span>Generated: {format(currentReport.generatedAt, 'MMM dd, yyyy HH:mm')}</span>
            </div>
            <div className="flex items-center gap-2">
              <BarChart3 size={14} />
              <span>Type: {currentReport.type}</span>
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp size={14} />
              <span>Period: {currentReport.filters.dateRange.start} to {currentReport.filters.dateRange.end}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EnhancedReportHeader;
