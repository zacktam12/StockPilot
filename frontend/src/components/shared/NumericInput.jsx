// src/components/shared/NumericInput.jsx
import React, { useState, useEffect } from "react";
import { AlertCircle } from "lucide-react";

/**
 * Enhanced Numeric Input Component with validation and sanitization
 * Prevents invalid input and provides real-time feedback
 */
const NumericInput = ({
  label,
  name,
  value,
  onChange,
  error,
  icon,
  placeholder = "0",
  required = false,
  min = 0,
  max,
  step = "1",
  decimals = 2,
  allowNegative = false,
  allowDecimal = true,
  className = "",
  disabled = false,
  ...props
}) => {
  const [localError, setLocalError] = useState("");

  // Sanitize input to only allow valid numeric characters
  const sanitizeInput = (inputValue) => {
    if (!inputValue && inputValue !== 0) return "";
    
    let sanitized = inputValue.toString();
    
    // Remove any non-numeric characters except minus (if allowed) and decimal point (if allowed)
    if (allowNegative && allowDecimal) {
      sanitized = sanitized.replace(/[^\d.-]/g, "");
    } else if (allowNegative) {
      sanitized = sanitized.replace(/[^\d-]/g, "");
    } else if (allowDecimal) {
      sanitized = sanitized.replace(/[^\d.]/g, "");
    } else {
      sanitized = sanitized.replace(/[^\d]/g, "");
    }
    
    // Ensure only one minus sign at the beginning
    if (allowNegative) {
      const minusCount = (sanitized.match(/-/g) || []).length;
      if (minusCount > 1) {
        sanitized = "-" + sanitized.replace(/-/g, "");
      } else if (sanitized.indexOf("-") > 0) {
        sanitized = "-" + sanitized.replace(/-/g, "");
      }
    }
    
    // Ensure only one decimal point
    if (allowDecimal) {
      const parts = sanitized.split(".");
      if (parts.length > 2) {
        sanitized = parts[0] + "." + parts.slice(1).join("");
      }
      
      // Limit decimal places
      if (parts.length === 2 && decimals !== undefined) {
        sanitized = parts[0] + "." + parts[1].substring(0, decimals);
      }
    }
    
    return sanitized;
  };

  // Validate the input value
  const validateValue = (inputValue) => {
    if (!inputValue && inputValue !== 0) {
      if (required) {
        return "This field is required";
      }
      return "";
    }

    const numValue = parseFloat(inputValue);
    
    // Check if it's a valid number
    if (isNaN(numValue)) {
      return "Please enter a valid number";
    }
    
    // Check minimum value
    if (min !== undefined && numValue < min) {
      return `Value must be at least ${min}`;
    }
    
    // Check maximum value
    if (max !== undefined && numValue > max) {
      return `Value must be at most ${max}`;
    }
    
    // Check if negative values are allowed
    if (!allowNegative && numValue < 0) {
      return "Negative values are not allowed";
    }
    
    return "";
  };

  const handleInputChange = (e) => {
    const rawValue = e.target.value;
    
    // Allow empty string for clearing
    if (rawValue === "") {
      setLocalError("");
      onChange({ target: { name, value: "" } });
      return;
    }
    
    // Sanitize the input
    const sanitized = sanitizeInput(rawValue);
    
    // Validate the sanitized value
    const validationError = validateValue(sanitized);
    setLocalError(validationError);
    
    // Always update with sanitized value
    onChange({ target: { name, value: sanitized } });
  };

  const handleBlur = () => {
    // Final validation on blur
    if (value || value === 0) {
      const validationError = validateValue(value);
      setLocalError(validationError);
    }
  };

  const handleFocus = () => {
    setLocalError("");
  };

  // Handle paste events
  const handlePaste = (e) => {
    e.preventDefault();
    const pastedText = e.clipboardData.getData("text");
    const sanitized = sanitizeInput(pastedText);
    
    if (sanitized) {
      const validationError = validateValue(sanitized);
      setLocalError(validationError);
      onChange({ target: { name, value: sanitized } });
    }
  };

  // Clear local error when external error changes
  useEffect(() => {
    if (error && error !== localError) {
      setLocalError("");
    }
  }, [error]);

  const displayError = error || localError;
  const hasError = !!displayError;

  return (
    <div className={`${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500">
            {icon}
          </div>
        )}
        <input
          type="text"
          name={name}
          value={value}
          onChange={handleInputChange}
          onBlur={handleBlur}
          onFocus={handleFocus}
          onPaste={handlePaste}
          disabled={disabled}
          placeholder={placeholder}
          inputMode="decimal"
          className={`w-full h-11 ${icon ? "pl-10" : "pl-3"} pr-3 py-2 text-base border rounded-lg transition-colors duration-200
            ${hasError 
              ? "border-red-300 focus:border-red-500 focus:ring-red-500" 
              : "border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 focus:border-blue-500 focus:ring-blue-500"
            }
            ${disabled ? "bg-gray-100 dark:bg-gray-700 cursor-not-allowed opacity-60" : "bg-white dark:bg-gray-700"}
            text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500
            focus:outline-none focus:ring-1
          `}
          {...props}
        />
        {hasError && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-red-500">
            <AlertCircle size={18} />
          </div>
        )}
      </div>
      {hasError && (
        <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-start gap-1">
          <AlertCircle size={14} className="mt-0.5 flex-shrink-0" />
          <span>{displayError}</span>
        </p>
      )}
    </div>
  );
};

export default NumericInput;

