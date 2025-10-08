import { format, parseISO } from 'date-fns';

/**
 * Utility functions for formatting based on system settings
 */

/**
 * Format currency based on system settings
 */
export const formatCurrency = (amount, currency = 'USD', locale = 'en-US') => {
  if (typeof amount !== 'number') {
    amount = parseFloat(amount) || 0;
  }
  
  // Handle ETB with custom formatting since it's not widely supported by Intl.NumberFormat
  if (currency === 'ETB') {
    const symbol = getCurrencySymbol(currency);
    return `${symbol} ${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }
  
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
  }).format(amount);
};

/**
 * Format date based on system settings
 */
export const formatDate = (date, dateFormat = 'MM/dd/yyyy', timeFormat = '12') => {
  if (!date) return '';
  
  let dateObj;
  if (typeof date === 'string') {
    dateObj = parseISO(date);
  } else {
    dateObj = date;
  }
  
  if (isNaN(dateObj.getTime())) return '';
  
  // Convert date format from system settings to date-fns format
  let formatString = dateFormat;
  if (dateFormat === 'MM/DD/YYYY') {
    formatString = 'MM/dd/yyyy';
  } else if (dateFormat === 'DD/MM/YYYY') {
    formatString = 'dd/MM/yyyy';
  } else if (dateFormat === 'YYYY-MM-DD') {
    formatString = 'yyyy-MM-dd';
  }
  
  return format(dateObj, formatString);
};

/**
 * Format time based on system settings
 */
export const formatTime = (date, timeFormat = '12') => {
  if (!date) return '';
  
  let dateObj;
  if (typeof date === 'string') {
    dateObj = parseISO(date);
  } else {
    dateObj = date;
  }
  
  if (isNaN(dateObj.getTime())) return '';
  
  const formatString = timeFormat === '24' ? 'HH:mm' : 'h:mm a';
  return format(dateObj, formatString);
};

/**
 * Format date and time based on system settings
 */
export const formatDateTime = (date, dateFormat = 'MM/dd/yyyy', timeFormat = '12') => {
  if (!date) return '';
  
  let dateObj;
  if (typeof date === 'string') {
    dateObj = parseISO(date);
  } else {
    dateObj = date;
  }
  
  if (isNaN(dateObj.getTime())) return '';
  
  let dateFormatString = dateFormat;
  if (dateFormat === 'MM/DD/YYYY') {
    dateFormatString = 'MM/dd/yyyy';
  } else if (dateFormat === 'DD/MM/YYYY') {
    dateFormatString = 'dd/MM/yyyy';
  } else if (dateFormat === 'YYYY-MM-DD') {
    dateFormatString = 'yyyy-MM-dd';
  }
  
  const timeFormatString = timeFormat === '24' ? 'HH:mm' : 'h:mm a';
  const formatString = `${dateFormatString} ${timeFormatString}`;
  
  return format(dateObj, formatString);
};

/**
 * Format number based on locale
 */
export const formatNumber = (number, locale = 'en-US', options = {}) => {
  if (typeof number !== 'number') {
    number = parseFloat(number) || 0;
  }
  
  return new Intl.NumberFormat(locale, options).format(number);
};

/**
 * Format percentage
 */
export const formatPercentage = (value, decimals = 2) => {
  if (typeof value !== 'number') {
    value = parseFloat(value) || 0;
  }
  
  return `${value.toFixed(decimals)}%`;
};

/**
 * Get currency symbol
 */
export const getCurrencySymbol = (currency = 'USD') => {
  const symbols = {
    'USD': '$',
    'EUR': '€',
    'GBP': '£',
    'JPY': '¥',
    'CAD': 'C$',
    'AUD': 'A$',
    'CHF': 'CHF',
    'CNY': '¥',
    'INR': '₹',
    'ETB': 'Br',
  };
  
  return symbols[currency] || currency;
};

export default {
  formatCurrency,
  formatDate,
  formatTime,
  formatDateTime,
  formatNumber,
  formatPercentage,
  getCurrencySymbol,
};
