import React, { useState, useEffect } from "react";
import { Card, CardContent } from "../../../components/shared/Card";
import { TrendingUp, TrendingDown, Minus, RefreshCw } from "lucide-react";
import { useSystemSettings } from "../../../hooks/useSystemSettings";
import { formatCurrency, formatNumber } from "../../../utils/formatUtils";

const AdvancedStatCard = ({
  title,
  value,
  icon,
  change,
  changeType = "percentage", // percentage, currency, count
  isLoading = false,
  compact = false,
  className = "",
  onClick,
  realTimeUpdate = false,
  lastUpdated = null,
  trend = "neutral", // up, down, neutral
  subtitle = null,
  color = "blue",
}) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const [displayValue, setDisplayValue] = useState(value);
  const { currency, language } = useSystemSettings();

  // Animate value changes
  useEffect(() => {
    if (value !== displayValue) {
      setIsAnimating(true);
      const timer = setTimeout(() => {
        setDisplayValue(value);
        setIsAnimating(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [value, displayValue]);

  const getColorClasses = () => {
    const colors = {
      blue: {
        bg: "bg-gradient-to-br from-blue-500 to-blue-600",
        hover: "hover:from-blue-600 hover:to-blue-700",
        text: "text-blue-600 dark:text-blue-400",
        bgLight: "bg-blue-50 dark:bg-blue-900/20",
      },
      green: {
        bg: "bg-gradient-to-br from-green-500 to-green-600",
        hover: "hover:from-green-600 hover:to-green-700",
        text: "text-green-600 dark:text-green-400",
        bgLight: "bg-green-50 dark:bg-green-900/20",
      },
      red: {
        bg: "bg-gradient-to-br from-red-500 to-red-600",
        hover: "hover:from-red-600 hover:to-red-700",
        text: "text-red-600 dark:text-red-400",
        bgLight: "bg-red-50 dark:bg-red-900/20",
      },
      purple: {
        bg: "bg-gradient-to-br from-purple-500 to-purple-600",
        hover: "hover:from-purple-600 hover:to-purple-700",
        text: "text-purple-600 dark:text-purple-400",
        bgLight: "bg-purple-50 dark:bg-purple-900/20",
      },
      orange: {
        bg: "bg-gradient-to-br from-orange-500 to-orange-600",
        hover: "hover:from-orange-600 hover:to-orange-700",
        text: "text-orange-600 dark:text-orange-400",
        bgLight: "bg-orange-50 dark:bg-orange-900/20",
      },
    };
    return colors[color] || colors.blue;
  };

  const getTrendIcon = () => {
    switch (trend) {
      case "up":
        return <TrendingUp className="w-4 h-4" />;
      case "down":
        return <TrendingDown className="w-4 h-4" />;
      default:
        return <Minus className="w-4 h-4" />;
    }
  };

  const getTrendColor = () => {
    switch (trend) {
      case "up":
        return "text-green-600 dark:text-green-400";
      case "down":
        return "text-red-600 dark:text-red-400";
      default:
        return "text-gray-600 dark:text-gray-400";
    }
  };

  const formatValue = (val) => {
    if (typeof val === "number") {
      if (changeType === "currency") {
        return formatCurrency(val, currency, language);
      }
      return formatNumber(val, language);
    }
    return val;
  };

  const formatChange = (changeVal) => {
    if (!changeVal) return null;
    
    if (changeType === "currency") {
      return formatCurrency(Math.abs(changeVal), currency, language);
    } else if (changeType === "percentage") {
      return `${Math.abs(changeVal)}%`;
    } else {
      return formatNumber(Math.abs(changeVal), language);
    }
  };

  const colorClasses = getColorClasses();

  return (
    <Card
      className={`
        relative overflow-hidden transition-all duration-300 ease-out
        hover:shadow-xl hover:shadow-blue-500/10 hover:-translate-y-1
        ${isAnimating ? "animate-pulse" : ""}
        ${onClick ? "cursor-pointer" : ""}
        ${className}
      `}
      onClick={onClick}
    >
      {/* Background gradient overlay */}
      <div className={`absolute inset-0 ${colorClasses.bgLight} opacity-0 hover:opacity-100 transition-opacity duration-300`} />
      
      {/* Real-time indicator */}
      {realTimeUpdate && (
        <div className="absolute top-2 right-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
        </div>
      )}

      <CardContent className={`relative ${compact ? "p-3 sm:p-4" : "p-4 sm:p-6"}`}>
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            {/* Title */}
            <p className={`font-medium text-gray-600 dark:text-gray-300 mb-1 transition-colors duration-300 ${
              compact ? "text-xs sm:text-sm" : "text-sm"
            }`}>
              {title}
            </p>
            
            {/* Main Value */}
            <h3 className={`font-bold text-gray-900 dark:text-white mb-1 transition-all duration-300 ${
              compact ? "text-lg sm:text-xl" : "text-2xl sm:text-3xl"
            } ${isAnimating ? "scale-105" : ""}`}>
              {isLoading ? (
                <div className="flex items-center space-x-2">
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Loading...</span>
                </div>
              ) : (
                formatValue(displayValue)
              )}
            </h3>

            {/* Subtitle */}
            {subtitle && (
              <p className={`text-gray-500 dark:text-gray-400 ${
                compact ? "text-xs" : "text-sm"
              }`}>
                {subtitle}
              </p>
            )}

            {/* Change indicator */}
            {change && (
              <div className={`flex items-center space-x-1 mt-2 ${
                compact ? "text-xs" : "text-sm"
              }`}>
                <div className={`flex items-center space-x-1 ${getTrendColor()}`}>
                  {getTrendIcon()}
                  <span className="font-medium">
                    {formatChange(change)}
                  </span>
                </div>
                <span className="text-gray-500 dark:text-gray-400">
                  from last period
                </span>
              </div>
            )}

            {/* Last updated */}
            {lastUpdated && (
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                Updated {new Date(lastUpdated).toLocaleTimeString()}
              </p>
            )}
          </div>

          {/* Icon */}
          <div className={`
            flex items-center justify-center rounded-xl shadow-lg
            ${colorClasses.bg} ${colorClasses.hover}
            transition-all duration-300 hover:scale-110
            ${compact ? "p-2 sm:p-3" : "p-3 sm:p-4"}
          `}>
            {React.cloneElement(icon, {
              className: "text-white transition-transform duration-300",
              size: compact ? 18 : 24,
            })}
          </div>
        </div>

        {/* Hover effect overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
      </CardContent>

      {/* Loading overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm flex items-center justify-center">
          <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
            <RefreshCw className="w-4 h-4 animate-spin" />
            <span className="text-sm font-medium">Loading...</span>
          </div>
        </div>
      )}
    </Card>
  );
};

export default AdvancedStatCard;

