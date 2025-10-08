// src/utils/authValidation.js
// Centralized validation utilities for all authentication forms

/**
 * Enhanced email validation with detailed error messages
 */
export const validateEmail = (email) => {
  if (!email) return { isValid: false, error: null };
  
  // Trim and lowercase for validation
  const normalizedEmail = email.trim().toLowerCase();
  
  // Check for basic format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(normalizedEmail)) {
    return { isValid: false, error: "Please enter a valid email address" };
  }
  
  // Check for common issues
  if (normalizedEmail.includes('..')) {
    return { isValid: false, error: "Email cannot contain consecutive dots" };
  }
  if (normalizedEmail.startsWith('.') || normalizedEmail.endsWith('.')) {
    return { isValid: false, error: "Email cannot start or end with a dot" };
  }
  if (normalizedEmail.includes(' ')) {
    return { isValid: false, error: "Email cannot contain spaces" };
  }
  
  const parts = normalizedEmail.split('@');
  if (parts.length !== 2) {
    return { isValid: false, error: "Invalid email format" };
  }
  
  const [localPart, domain] = parts;
  if (localPart.length === 0 || localPart.length > 64) {
    return { isValid: false, error: "Invalid email format" };
  }
  if (domain.length === 0 || domain.length > 255) {
    return { isValid: false, error: "Invalid email domain" };
  }
  if (!domain.includes('.')) {
    return { isValid: false, error: "Email domain must contain a dot" };
  }
  
  return { isValid: true, error: null };
};

/**
 * Password validation with configurable requirements
 */
export const validatePassword = (password, options = {}) => {
  const {
    minLength = 8,
    maxLength = 128,
    requireLowercase = true,
    requireUppercase = true,
    requireNumber = true,
    requireSpecialChar = true,
    specialChars = "@$!%*?&"
  } = options;

  if (!password) return { isValid: false, error: null };
  
  // Check length
  if (password.length < minLength) {
    return { 
      isValid: false, 
      error: `Password must be at least ${minLength} characters` 
    };
  }
  if (password.length > maxLength) {
    return { 
      isValid: false, 
      error: `Password is too long (max ${maxLength} characters)` 
    };
  }
  
  // Check requirements
  if (requireLowercase && !/[a-z]/.test(password)) {
    return { 
      isValid: false, 
      error: "Password must contain at least one lowercase letter" 
    };
  }
  if (requireUppercase && !/[A-Z]/.test(password)) {
    return { 
      isValid: false, 
      error: "Password must contain at least one uppercase letter" 
    };
  }
  if (requireNumber && !/\d/.test(password)) {
    return { 
      isValid: false, 
      error: "Password must contain at least one number" 
    };
  }
  if (requireSpecialChar) {
    const specialCharRegex = new RegExp(`[${specialChars.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}]`);
    if (!specialCharRegex.test(password)) {
      return { 
        isValid: false, 
        error: `Password must contain at least one special character (${specialChars})` 
      };
    }
  }
  
  return { isValid: true, error: null };
};

/**
 * Simplified password validation for login (no complexity requirements)
 */
export const validateLoginPassword = (password) => {
  return validatePassword(password, {
    minLength: 6,
    maxLength: 128,
    requireLowercase: false,
    requireUppercase: false,
    requireNumber: false,
    requireSpecialChar: false
  });
};

/**
 * Phone number validation
 */
export const validatePhone = (phone) => {
  if (!phone) return { isValid: false, error: null };
  
  // Remove all non-digit characters for validation
  const digitsOnly = phone.replace(/\D/g, '');
  
  // Check length (should be at least 10 digits)
  if (digitsOnly.length < 10) {
    return { 
      isValid: false, 
      error: "Phone number must have at least 10 digits" 
    };
  }
  
  if (digitsOnly.length > 15) {
    return { 
      isValid: false, 
      error: "Phone number is too long (max 15 digits)" 
    };
  }
  
  return { isValid: true, error: null };
};

/**
 * Sanitize phone number (allow digits, spaces, dashes, parentheses, plus)
 */
export const sanitizePhone = (phone) => {
  if (!phone) return "";
  // Allow: digits, spaces, dashes, parentheses, plus
  return phone.replace(/[^\d\s\-\(\)\+]/g, '');
};

/**
 * Employee ID validation
 */
export const validateEmployeeId = (employeeId) => {
  if (!employeeId) return { isValid: false, error: null };
  
  const trimmed = employeeId.trim();
  
  if (trimmed.length < 3) {
    return { 
      isValid: false, 
      error: "Employee ID must be at least 3 characters" 
    };
  }
  
  if (trimmed.length > 20) {
    return { 
      isValid: false, 
      error: "Employee ID is too long (max 20 characters)" 
    };
  }
  
  // Allow alphanumeric, dashes, underscores
  if (!/^[A-Za-z0-9\-_]+$/.test(trimmed)) {
    return { 
      isValid: false, 
      error: "Employee ID can only contain letters, numbers, dashes, and underscores" 
    };
  }
  
  return { isValid: true, error: null };
};

/**
 * Reset code validation (6 digits)
 */
export const validateResetCode = (code) => {
  if (!code) return { isValid: false, error: null };
  
  // Remove any non-digit characters
  const digitsOnly = code.replace(/\D/g, '');
  
  if (digitsOnly.length !== 6) {
    return { 
      isValid: false, 
      error: "Code must be exactly 6 digits" 
    };
  }
  
  return { isValid: true, error: null };
};

/**
 * Sanitize reset code (only allow digits)
 */
export const sanitizeResetCode = (code) => {
  if (!code) return "";
  return code.replace(/\D/g, '').substring(0, 6);
};

/**
 * Name validation (first name, last name)
 */
export const validateName = (name, fieldName = "Name") => {
  if (!name) return { isValid: false, error: null };
  
  const trimmed = name.trim();
  
  if (trimmed.length < 2) {
    return { 
      isValid: false, 
      error: `${fieldName} must be at least 2 characters` 
    };
  }
  
  if (trimmed.length > 50) {
    return { 
      isValid: false, 
      error: `${fieldName} is too long (max 50 characters)` 
    };
  }
  
  // Allow letters, spaces, hyphens, apostrophes
  if (!/^[A-Za-z\s\-']+$/.test(trimmed)) {
    return { 
      isValid: false, 
      error: `${fieldName} can only contain letters, spaces, hyphens, and apostrophes` 
    };
  }
  
  return { isValid: true, error: null };
};

/**
 * Password confirmation validation
 */
export const validatePasswordMatch = (password, confirmPassword) => {
  if (!confirmPassword) {
    return { isValid: false, error: "Please confirm your password" };
  }
  
  if (password !== confirmPassword) {
    return { isValid: false, error: "Passwords do not match" };
  }
  
  return { isValid: true, error: null };
};

/**
 * Sanitize email (trim and lowercase)
 */
export const sanitizeEmail = (email) => {
  if (!email) return "";
  return email.trim().toLowerCase();
};

/**
 * Calculate password strength (0-100)
 */
export const calculatePasswordStrength = (password) => {
  if (!password) return 0;
  
  let strength = 0;
  
  // Length score (max 40 points)
  if (password.length >= 8) strength += 20;
  if (password.length >= 12) strength += 10;
  if (password.length >= 16) strength += 10;
  
  // Character variety (max 60 points)
  if (/[a-z]/.test(password)) strength += 15;
  if (/[A-Z]/.test(password)) strength += 15;
  if (/\d/.test(password)) strength += 15;
  if (/[@$!%*?&]/.test(password)) strength += 15;
  
  return Math.min(strength, 100);
};

/**
 * Get password strength label and color
 */
export const getPasswordStrengthInfo = (strength) => {
  if (strength === 0) return { label: "No Password", color: "gray" };
  if (strength < 30) return { label: "Weak", color: "red" };
  if (strength < 60) return { label: "Fair", color: "yellow" };
  if (strength < 80) return { label: "Good", color: "blue" };
  return { label: "Strong", color: "green" };
};

export default {
  validateEmail,
  validatePassword,
  validateLoginPassword,
  validatePhone,
  sanitizePhone,
  validateEmployeeId,
  validateResetCode,
  sanitizeResetCode,
  validateName,
  validatePasswordMatch,
  sanitizeEmail,
  calculatePasswordStrength,
  getPasswordStrengthInfo
};

