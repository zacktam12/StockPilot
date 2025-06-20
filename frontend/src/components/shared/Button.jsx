// Button

import React from "react";

const Button = React.forwardRef(
  (
    {
      children,
      variant = "primary",
      size = "md",
      isLoading = false,
      icon,
      className = "",
      ...props
    },
    ref
  ) => {
    // Correct ref parameter name
    const baseStyles =
      "inline-flex items-center justify-center font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none";

    const variantStyles = {
      primary:
        "bg-[#3f51b5] hover:bg-[#303f9f] text-white font-bold rounded-xl px-4 py-2 transition",
      secondary:
        "bg-blue-600 text-white hover:bg-blue-700 focus-visible:ring-blue-500",
      outline:
        "border border-gray-300 bg-white text-gray-800 hover:bg-blue-50 focus-visible:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700",
      ghost:
        "bg-transparent text-gray-800 hover:bg-blue-50 focus-visible:ring-blue-500 dark:text-gray-200 dark:hover:bg-gray-700",
      danger:
        "bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-500",
      success:
        "bg-green-600 text-white hover:bg-green-700 focus-visible:ring-green-500",
    };

    const sizeStyles = {
      sm: "text-xs py-1.5 px-3 rounded-md",
      md: "text-sm py-2 px-4 rounded-md",
      lg: "text-base py-2.5 px-5 rounded-md",
    };

    const styles = `${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`;

    return (
      <button
        ref={ref} // Correct ref usage
        className={styles}
        disabled={isLoading || props.disabled}
        {...props}
      >
        {isLoading && (
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4 text-current"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}
        {icon && !isLoading && <span className="mr-2">{icon}</span>}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";

export default Button;
