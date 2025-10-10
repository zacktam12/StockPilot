// src/utils/formatters.js

/**
 * Format currency amount (USD by default)
 * @param {number} amount - The amount to format
 * @param {string} [currency='USD'] - Currency code (ISO 4217)
 * @param {string} [locale='en-US'] - Locale code
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (amount, currency = "USD", locale = "en-US") => {
  try {
    if (isNaN(amount)) {
      return "$0.00";
    }
    
    // Handle ETB with custom formatting since it's not widely supported by Intl.NumberFormat
    if (currency === 'ETB') {
      return `Br ${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
    
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency: currency,
    }).format(amount);
  } catch (error) {
    return amount?.toString() || "0";
  }
};

/**
 * Format date with time
 * @param {Date|string} date - Date object or ISO date string
 * @param {string} [locale='en-US'] - Locale code
 * @param {Object} [options] - Intl.DateTimeFormat options
 * @returns {string} Formatted date string
 */
export const formatDate = (date, locale = "en-US", options = {}) => {
  const defaultOptions = {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  };

  try {
    const dateObj = date instanceof Date ? date : new Date(date);
    if (isNaN(dateObj.getTime())) {
      return "Invalid Date";
    }
    return new Intl.DateTimeFormat(locale, {
      ...defaultOptions,
      ...options,
    }).format(dateObj);
  } catch (error) {
    return date?.toString() || "Invalid Date";
  }
};

/**
 * Format number with thousands separators
 * @param {number} number - The number to format
 * @param {string} [locale='en-US'] - Locale code
 * @returns {string} Formatted number string
 */
export const formatNumber = (number, locale = "en-US") => {
  try {
    if (isNaN(number)) {
      return "0";
    }
    return new Intl.NumberFormat(locale).format(number);
  } catch (error) {
    return number?.toString() || "0";
  }
};

/**
 * Format percentage value
 * @param {number} value - The percentage value (0-1 or 0-100)
 * @param {boolean} [isDecimal=true] - Whether the input is decimal (0-1)
 * @param {string} [locale='en-US'] - Locale code
 * @returns {string} Formatted percentage string
 */
export const formatPercentage = (value, isDecimal = true, locale = "en-US") => {
  try {
    const numValue = isDecimal ? value * 100 : value;
    if (isNaN(numValue)) {
      return "0%";
    }
    return new Intl.NumberFormat(locale, {
      style: "percent",
      maximumFractionDigits: 2,
    }).format(numValue / 100);
  } catch (error) {
    return "0%";
  }
};

/**
 * Format file size in human-readable format
 * @param {number} bytes - File size in bytes
 * @returns {string} Formatted file size (e.g., "1.5 MB")
 */
export const formatFileSize = (bytes) => {
  try {
    if (isNaN(bytes)) {
      return "0 Bytes";
    }
    if (bytes === 0) return "0 Bytes";

    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  } catch (error) {
    return bytes?.toString() || "0 Bytes";
  }
};

/**
 * Format phone number (US format)
 * @param {string} phoneNumber - The phone number to format
 * @returns {string} Formatted phone number
 */
export const formatPhoneNumber = (phoneNumber) => {
  try {
    if (!phoneNumber) return "";
    // Remove all non-digit characters
    const cleaned = phoneNumber.toString().replace(/\D/g, "");
    const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
    return match ? `(${match[1]}) ${match[2]}-${match[3]}` : phoneNumber;
  } catch (error) {
    return phoneNumber?.toString() || "";
  }
};
