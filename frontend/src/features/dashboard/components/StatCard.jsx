// src/features/dashboard/components/StatCard.jsx
import React from "react";
import { Card, CardContent } from "../../../components/shared/Card";
import CardLoaderOverlay from "../../../components/shared/CardLoaderOverlay";

const StatCard = ({
  title,
  value,
  icon,
  change,
  className = "",
  isLoading,
}) => {
  return (
    <Card
      className={`bg-white rounded-xl shadow-md dark:bg-[#1e293b] relative ${className}`}
    >
      {isLoading && <CardLoaderOverlay />}
      <CardContent className="p-6">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm font-medium text-gray-500 font-sans dark:text-gray-300">
              {title}
            </p>
            <h4 className="mt-2 text-2xl font-bold text-gray-900 font-sans dark:text-white">
              {value}
            </h4>
            {change && (
              <p
                className={`mt-1 text-sm ${
                  change.isPositive
                    ? "text-green-600 dark:text-green-400"
                    : "text-red-600 dark:text-red-400"
                }`}
              >
                {change.isPositive ? "↑" : "↓"} {Math.abs(change.value)}%
                <span className="text-gray-400 ml-1">from last month</span>
              </p>
            )}
          </div>
          <div className="flex items-center justify-center bg-blue-600 p-3 rounded-full shadow">
            {React.cloneElement(icon, { className: "text-white", size: 28 })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default StatCard;
