import React from "react";

const Badge = ({ children, variant = "default", className = "", ...rest }) => {
  const variantStyles = {
    default: "bg-gray-700 text-gray-200",
    primary: "bg-[#3f51b5] text-white",
    secondary: "bg-gray-800 text-gray-300",
    success: "bg-green-700 text-green-200",
    warning: "bg-yellow-700 text-yellow-200",
    danger: "bg-red-700 text-red-200",
  };

  const baseStyles =
    "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium";

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
