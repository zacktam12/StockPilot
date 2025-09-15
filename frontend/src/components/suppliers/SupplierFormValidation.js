// Enhanced form validation for supplier forms
import * as Yup from 'yup';

export const supplierValidationSchema = Yup.object({
  name: Yup.string()
    .trim()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name cannot exceed 100 characters')
    .matches(/^[a-zA-Z0-9\s\-&.,()]+$/, 'Name can only contain letters, numbers, spaces, and basic punctuation')
    .required('Supplier name is required'),
  
  contactName: Yup.string()
    .trim()
    .max(100, 'Contact name cannot exceed 100 characters')
    .matches(/^[a-zA-Z\s\-'.]*$/, 'Contact name can only contain letters, spaces, hyphens, apostrophes, and periods'),
  
  email: Yup.string()
    .trim()
    .email('Please provide a valid email address')
    .max(255, 'Email cannot exceed 255 characters'),
  
  phone: Yup.string()
    .trim()
    .matches(/^[\+]?[1-9][\d]{0,15}$/, 'Please provide a valid phone number')
    .max(30, 'Phone number cannot exceed 30 characters'),
  
  address: Yup.string()
    .trim()
    .max(255, 'Address cannot exceed 255 characters'),
  
  companyName: Yup.string()
    .trim()
    .max(100, 'Company name cannot exceed 100 characters')
    .matches(/^[a-zA-Z0-9\s\-&.,()]*$/, 'Company name can only contain letters, numbers, spaces, and basic punctuation'),
  
  notes: Yup.string()
    .trim()
    .max(500, 'Notes cannot exceed 500 characters'),
  
  status: Yup.string()
    .oneOf(['active', 'inactive'], 'Status must be either active or inactive')
    .default('active')
});

// Real-time validation functions
export const validateField = async (field, value, schema) => {
  try {
    await schema.validateAt(field, { [field]: value });
    return { isValid: true, error: null };
  } catch (error) {
    return { isValid: false, error: error.message };
  }
};

// Sanitize input to prevent XSS
export const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '')
    .trim()
    .replace(/\s+/g, ' ');
};

// Format phone number
export const formatPhoneNumber = (phone) => {
  if (!phone) return '';
  
  // Remove all non-digit characters except +
  const cleaned = phone.replace(/[^\d+]/g, '');
  
  // Format based on length
  if (cleaned.length <= 10) {
    return cleaned.replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3');
  } else if (cleaned.length <= 11 && cleaned.startsWith('1')) {
    return cleaned.replace(/(\d{1})(\d{3})(\d{3})(\d{4})/, '+$1 ($2) $3-$4');
  }
  
  return cleaned;
};

// Validate email format
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Validate phone format
export const isValidPhone = (phone) => {
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
  return phoneRegex.test(phone.replace(/[^\d+]/g, ''));
};

