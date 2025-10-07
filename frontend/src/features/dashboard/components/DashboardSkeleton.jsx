import React from 'react';
import { Card, CardContent, CardHeader } from '../../../components/shared/Card';

const DashboardSkeleton = ({ compact = false }) => {
  const StatCardSkeleton = () => (
    <Card className="relative overflow-hidden">
      <CardContent className={compact ? "p-3 sm:p-4" : "p-4 sm:p-6"}>
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24 mb-2 animate-pulse"></div>
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-20 mb-2 animate-pulse"></div>
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-16 animate-pulse"></div>
          </div>
          <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse"></div>
        </div>
      </CardContent>
    </Card>
  );

  const ChartSkeleton = ({ height = 300 }) => (
    <Card>
      <CardHeader className={compact ? "p-3 sm:p-4" : "p-4 sm:p-6"}>
        <div className="flex items-center justify-between">
          <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-32 animate-pulse"></div>
          <div className="flex space-x-2">
            <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
            <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
          </div>
        </div>
      </CardHeader>
      <CardContent className={compact ? "p-3 sm:p-4 pt-0" : "p-4 sm:p-6 pt-0"}>
        <div 
          className="bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse"
          style={{ height: height }}
        ></div>
      </CardContent>
    </Card>
  );

  const ActivitySkeleton = () => (
    <Card>
      <CardHeader className={compact ? "p-3 sm:p-4" : "p-4 sm:p-6"}>
        <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-24 animate-pulse"></div>
      </CardHeader>
      <CardContent className={compact ? "p-3 sm:p-4 pt-0" : "p-4 sm:p-6 pt-0"}>
        <div className="space-y-3">
          {[...Array(3)].map((_, index) => (
            <div key={index} className="flex items-center space-x-3 p-3 bg-gray-100 dark:bg-gray-800 rounded-lg">
              <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse"></div>
              <div className="flex-1 space-y-2">
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-3/4 animate-pulse"></div>
                <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded w-1/2 animate-pulse"></div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );

  const AlertSkeleton = () => (
    <Card>
      <CardHeader className={compact ? "p-3 sm:p-4" : "p-4 sm:p-6"}>
        <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-20 animate-pulse"></div>
      </CardHeader>
      <CardContent className={compact ? "p-3 sm:p-4 pt-0" : "p-4 sm:p-6 pt-0"}>
        <div className="space-y-3">
          {[...Array(2)].map((_, index) => (
            <div key={index} className="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
              <div className="flex items-start space-x-3">
                <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 animate-pulse"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2 animate-pulse"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/3 animate-pulse"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header Skeleton */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-64 animate-pulse"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-48 animate-pulse"></div>
            </div>
            <div className="flex space-x-3">
              <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-24 animate-pulse"></div>
              <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-10 animate-pulse"></div>
              <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-20 animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-4 sm:px-6 lg:px-8 py-6">
        {/* Stats Grid Skeleton */}
        <div className={`grid gap-4 sm:gap-6 mb-6 ${
          compact 
            ? "grid-cols-2 sm:grid-cols-3 lg:grid-cols-6" 
            : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6"
        }`}>
          {[...Array(6)].map((_, index) => (
            <StatCardSkeleton key={index} />
          ))}
        </div>

        {/* Charts Row Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 mb-6">
          <div className="lg:col-span-2">
            <ChartSkeleton height={300} />
          </div>
          <div>
            <ChartSkeleton height={300} />
          </div>
        </div>

        {/* Activity and Alerts Row Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          <ActivitySkeleton />
          <AlertSkeleton />
        </div>
      </div>
    </div>
  );
};

export default DashboardSkeleton;

