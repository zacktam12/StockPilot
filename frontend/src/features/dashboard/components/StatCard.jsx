// src/features/dashboard/components/StatCard.jsx
import React from "react";
import { Card, CardContent } from "../../../components/shared/Card";
import CardLoaderOverlay from "../../../components/shared/CardLoaderOverlay";

// StatCard: displays a single dashboard statistic with icon and optional change indicator
const StatCard = ({
  title,
  value,
  icon,
  change,
  className = "",
  isLoading,
  compact = false,
}) => {
  return (
    <Card
      className={`bg-white rounded-xl shadow-md dark:bg-[#1e293b] relative cursor-pointer transition-all duration-300 ease-in-out hover:shadow-lg hover:scale-105 hover:bg-blue-50 dark:hover:bg-gray-800 ${className}`}
    >
      {/* Loader overlay when loading */}
      {isLoading && <CardLoaderOverlay />}
      <CardContent className={compact ? "p-2 sm:p-3" : "p-4 sm:p-6"}>
        <div className="flex justify-between items-start">
          {/* Stat label and value */}
          <div className="flex-1 min-w-0">
            <p
              className={`font-medium text-gray-500 font-sans dark:text-gray-300 transition-colors duration-300 hover:text-blue-600 dark:hover:text-blue-400 truncate ${
                compact ? "text-xs sm:text-sm" : "text-sm"
              }`}
            >
              {title}
            </p>
            <h4
              className={`mt-1 font-bold text-gray-900 font-sans dark:text-white transition-colors duration-300 hover:text-blue-700 dark:hover:text-blue-300 truncate ${
                compact ? "text-sm sm:text-lg" : "text-xl sm:text-2xl"
              }`}
            >
              {value}
            </h4>
            {/* Optional change indicator */}
            {change && (
              <p
                className={`mt-1 text-xs sm:text-sm transition-colors duration-300 ${
                  change.isPositive
                    ? "text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300"
                    : "text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
                }`}
              >
                {change.isPositive ? "↑" : "↓"} {Math.abs(change.value)}%
                <span className="text-gray-400 ml-1 hidden sm:inline">
                  from last month
                </span>
              </p>
            )}
          </div>
          {/* Icon */}
          <div
            className={`flex items-center justify-center bg-blue-600 rounded-full shadow transition-all duration-300 hover:bg-blue-700 hover:scale-110 flex-shrink-0 ${
              compact ? "p-1.5 sm:p-2" : "p-2 sm:p-3"
            }`}
          >
            {React.cloneElement(icon, {
              className: "text-white transition-transform duration-300",
              size: compact ? 16 : 24,
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default StatCard;
