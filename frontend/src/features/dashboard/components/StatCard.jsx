// src/features/dashboard/components/StatCard.jsx
import React from "react";
import { Card, CardContent } from "../../../components/shared/Card";

const StatCard = ({ title, value, icon, change, className = "" }) => {
  return (
    <Card className={`overflow-hidden ${className}`}>
      <CardContent className="p-6">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm font-medium text-gray-500">{title}</p>
            <h4 className="mt-2 text-2xl font-semibold text-gray-900">
              {value}
            </h4>
            {change && (
              <p
                className={`mt-1 text-sm ${
                  change.isPositive ? "text-green-600" : "text-red-600"
                }`}
              >
                {change.isPositive ? "↑" : "↓"} {Math.abs(change.value)}%
                <span className="text-gray-500 ml-1">from last month</span>
              </p>
            )}
          </div>
          <div className="p-2.5 rounded-full bg-indigo-50 text-indigo-600">
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default StatCard;
