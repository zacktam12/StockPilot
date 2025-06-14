// src/utils/validators.js

/**
 * Validate email address format
 * @param {string} email - Email to validate
 * @returns {boolean} True if email is valid
 */
export const validateEmail = (email) => {
  if (!email) return false;
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(String(email).toLowerCase());
};

/**
 * Validate password strength
 * @param {string} password - Password to validate
 * @param {Object} [options] - Validation options
 * @param {number} [options.minLength=8] - Minimum length
 * @param {boolean} [options.requireNumber=true] - Require at least one number
 * @param {boolean} [options.requireSpecialChar=true] - Require special character
 * @returns {Object} { isValid: boolean, message: string }
 */
export const validatePassword = (password, options = {}) => {
  const {
    minLength = 8,
    requireNumber = true,
    requireSpecialChar = true,
    requireUppercase = true,
  } = options;

  if (!password) {
    return { isValid: false, message: "Password is required" };
  }

  if (password.length < minLength) {
    return {
      isValid: false,
      message: `Password must be at least ${minLength} characters`,
    };
  }

  if (requireNumber && !/\d/.test(password)) {
    return {
      isValid: false,
      message: "Password must contain at least one number",
    };
  }

  if (requireSpecialChar && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    return {
      isValid: false,
      message: "Password must contain at least one special character",
    };
  }

  if (requireUppercase && !/[A-Z]/.test(password)) {
    return {
      isValid: false,
      message: "Password must contain at least one uppercase letter",
    };
  }

  return { isValid: true, message: "Password is valid" };
};

/**
 * Validate required field
 * @param {*} value - Value to check
 * @param {string} [fieldName='Field'] - Name of the field for error message
 * @returns {Object} { isValid: boolean, message: string }
 */
export const validateRequired = (value, fieldName = "Field") => {
  if (value === null || value === undefined) {
    return { isValid: false, message: `${fieldName} is required` };
  }

  if (typeof value === "string" && value.trim() === "") {
    return { isValid: false, message: `${fieldName} is required` };
  }

  if (Array.isArray(value) && value.length === 0) {
    return { isValid: false, message: `${fieldName} is required` };
  }

  return { isValid: true, message: "" };
};

/**
 * Validate number value
 * @param {*} value - Value to validate
 * @param {Object} [options] - Validation options
 * @param {number} [options.min] - Minimum value
 * @param {number} [options.max] - Maximum value
 * @returns {Object} { isValid: boolean, message: string }
 */
export const validateNumber = (value, options = {}) => {
  const { min, max } = options;
  const num = Number(value);

  if (isNaN(num)) {
    return { isValid: false, message: "Must be a valid number" };
  }

  if (min !== undefined && num < min) {
    return { isValid: false, message: `Must be at least ${min}` };
  }

  if (max !== undefined && num > max) {
    return { isValid: false, message: `Must be less than ${max}` };
  }

  return { isValid: true, message: "" };
};

/**
 * Validate phone number format
 * @param {string} phone - Phone number to validate
 * @returns {boolean} True if phone number is valid
 */
export const validatePhone = (phone) => {
  if (!phone) return false;
  const re = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/;
  return re.test(phone);
};

/**
 * Validate URL format
 * @param {string} url - URL to validate
 * @returns {boolean} True if URL is valid
 */
export const validateUrl = (url) => {
  if (!url) return false;
  try {
    new URL(url);
    return true;
  } catch (_) {
    return false;
  }
};

/**
 * Validate date is in the future
 * @param {Date|string} date - Date to validate
 * @returns {boolean} True if date is in the future
 */
export const validateFutureDate = (date) => {
  try {
    const dateObj = date instanceof Date ? date : new Date(date);
    return dateObj > new Date();
  } catch (_) {
    return false;
  }
};

/**
 * Validate form fields object
 * @param {Object} fields - Object with field values
 * @param {Object} rules - Validation rules for each field
 * @returns {Object} { isValid: boolean, errors: Object }
 */
export const validateForm = (fields, rules) => {
  const errors = {};
  let isValid = true;

  Object.keys(rules).forEach((fieldName) => {
    const value = fields[fieldName];
    const fieldRules = rules[fieldName];
    const fieldError = [];

    fieldRules.forEach((rule) => {
      const result = rule.validator(value, rule.options);
      if (!result.isValid) {
        fieldError.push(result.message || rule.message);
      }
    });

    if (fieldError.length > 0) {
      errors[fieldName] = fieldError;
      isValid = false;
    }
  });

  return { isValid, errors };
};
