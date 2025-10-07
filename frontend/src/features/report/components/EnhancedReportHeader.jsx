import React from "react";
import { 
  BarChart3, 
  RefreshCw, 
  Eye,
  Calendar,
  TrendingUp
} from "lucide-react";
import { format, parseISO } from "date-fns";
import Button from "../../../components/shared/Button";
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
    <div className="sticky top-0 z-20 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 shadow-soft relative">
      <div className="p-4 sm:p-6">
        <div className="flex flex-col gap-4">
          {/* Top Section - Title and Status */}
          <div className="flex items-start gap-3 min-w-0">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-medium flex-shrink-0">
              <BarChart3 className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white truncate">
                Analytics & Reports
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {currentReport ? `Viewing: ${currentReport.title}` : 'Generate comprehensive business insights'}
              </p>
            </div>

            {/* Current Report Status */}
            {currentReport && (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 dark:bg-green-900/20 rounded-full flex-shrink-0">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-xs font-medium text-green-700 dark:text-green-400">
                  {currentReport.metadata?.totalRecords || 0} Records
                </span>
              </div>
            )}
          </div>

          {/* Bottom Section - Controls */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">

            {/* View Mode Toggle - Only show when report is active */}
            {currentReport && (
              <div className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-xl p-1">
                {viewModes.map((mode) => {
                  const Icon = mode.icon;
                  return (
                    <button
                      key={mode.id}
                      onClick={() => onViewModeChange(mode.id)}
                      aria-label={`View ${mode.label}`}
                      aria-pressed={viewMode === mode.id}
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
              aria-label={`Toggle auto-refresh ${autoRefresh ? 'off' : 'on'}`}
              aria-pressed={autoRefresh}
              title={autoRefresh ? 'Auto-refresh is ON (30s interval)' : 'Click to enable auto-refresh'}
              className={`transition-all duration-200 ${
                autoRefresh 
                  ? 'bg-green-50 border-green-200 text-green-600 dark:bg-green-900/20 dark:border-green-700 dark:text-green-400' 
                  : ''
              }`}
            >
              <RefreshCw size={16} className={autoRefresh ? 'animate-spin' : ''} />
              <span className="hidden sm:inline ml-2">
                Auto {autoRefresh ? 'ON' : 'OFF'}
              </span>
            </Button>

          </div>
        </div>


        {/* Report Metadata Bar */}
        {currentReport && (
          <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
            <div className="flex items-center gap-2">
              <Calendar size={14} />
              <span>Generated: {format(new Date(currentReport.generatedAt), 'MMM dd, yyyy HH:mm')}</span>
            </div>
            <div className="flex items-center gap-2">
              <BarChart3 size={14} />
              <span>Type: {currentReport.type || 'N/A'}</span>
            </div>
            {currentReport.filters?.dateRange && (
              <div className="flex items-center gap-2">
                <TrendingUp size={14} />
                <span>
                  Period: {format(parseISO(currentReport.filters.dateRange.start), 'MMM dd, yyyy')} to {format(parseISO(currentReport.filters.dateRange.end), 'MMM dd, yyyy')}
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default EnhancedReportHeader;
