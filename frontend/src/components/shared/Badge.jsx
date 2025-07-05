import React from "react";

const Badge = ({ children, variant = "default", className = "", ...rest }) => {
  const variantStyles = {
    default:
      "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200 border-gray-200 dark:border-gray-600",
    primary:
      "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 border-blue-200 dark:border-blue-800",
    secondary:
      "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200 border-gray-200 dark:border-gray-600",
    success:
      "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 border-green-200 dark:border-green-800",
    warning:
      "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300 border-amber-200 dark:border-amber-800",
    danger:
      "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 border-red-200 dark:border-red-800",
    info: "bg-sky-100 text-sky-800 dark:bg-sky-900/30 dark:text-sky-300 border-sky-200 dark:border-sky-800",
  };

  const baseStyles =
    "inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border transition-all duration-200";

  return (
    <span
      className={`${baseStyles} ${variantStyles[variant]} ${className}`}
      {...rest}
    >
      {children}
    </span>
  );
};

export default Badge;
