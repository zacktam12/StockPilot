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
        "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-2xl px-6 py-3 transition-all duration-200 shadow-lg hover:shadow-xl focus-visible:ring-4 focus-visible:ring-blue-500/20",
      secondary:
        "bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white font-semibold rounded-2xl px-6 py-3 transition-all duration-200 shadow-lg hover:shadow-xl focus-visible:ring-4 focus-visible:ring-gray-500/20",
      outline:
        "border-2 border-gray-300 bg-white text-gray-800 hover:bg-blue-50 hover:border-blue-500 focus-visible:ring-4 focus-visible:ring-blue-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700 rounded-2xl px-6 py-3 transition-all duration-200",
      ghost:
        "bg-transparent text-gray-800 hover:bg-blue-50 focus-visible:ring-4 focus-visible:ring-blue-500/20 dark:text-gray-200 dark:hover:bg-gray-700 rounded-2xl px-6 py-3 transition-all duration-200",
      danger:
        "bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-semibold rounded-2xl px-6 py-3 transition-all duration-200 shadow-lg hover:shadow-xl focus-visible:ring-4 focus-visible:ring-red-500/20",
      success:
        "bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold rounded-2xl px-6 py-3 transition-all duration-200 shadow-lg hover:shadow-xl focus-visible:ring-4 focus-visible:ring-green-500/20",
    };

    const sizeStyles = {
      sm: "text-sm py-2 px-4 rounded-xl",
      md: "text-base py-3 px-6 rounded-2xl",
      lg: "text-lg py-4 px-8 rounded-2xl",
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
