// Enhanced form validation for customer forms
import * as Yup from 'yup';

export const customerValidationSchema = Yup.object({
  name: Yup.string()
    .trim()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name cannot exceed 100 characters')
    .matches(/^[a-zA-Z\s\-'.]+$/, 'Name can only contain letters, spaces, hyphens, apostrophes, and periods')
    .required('Name is required'),
  
  email: Yup.string()
    .trim()
    .email('Please enter a valid email address')
    .max(255, 'Email cannot exceed 255 characters'),
  
  phone: Yup.string()
    .trim()
    .matches(/^[\+]?[1-9][\d]{0,15}$/, 'Please enter a valid phone number (international format supported)')
    .max(20, 'Phone number cannot exceed 20 characters'),
  
  address: Yup.string()
    .trim()
    .max(500, 'Address cannot exceed 500 characters'),
  
  company: Yup.string()
    .trim()
    .max(100, 'Company name cannot exceed 100 characters'),
  
  city: Yup.string()
    .trim()
    .max(50, 'City name cannot exceed 50 characters'),
  
  state: Yup.string()
    .trim()
    .max(50, 'State name cannot exceed 50 characters'),
  
  zipCode: Yup.string()
    .trim()
    .matches(/^[0-9]{5}(-[0-9]{4})?$/, 'ZIP code must be in format 12345 or 12345-6789'),
  
  country: Yup.string()
    .trim()
    .max(50, 'Country name cannot exceed 50 characters'),
  
  status: Yup.string()
    .oneOf(['active', 'inactive', 'blocked'], 'Status must be either active, inactive, or blocked')
    .default('active'),
  
  customerType: Yup.string()
    .oneOf(['individual', 'business', 'wholesale'], 'Customer type must be individual, business, or wholesale')
    .default('individual'),
  
  creditLimit: Yup.number()
    .min(0, 'Credit limit cannot be negative')
    .max(999999.99, 'Credit limit cannot exceed $999,999.99'),
  
  taxId: Yup.string()
    .trim()
    .matches(/^[0-9\-]*$/, 'Tax ID can only contain numbers and hyphens')
    .max(20, 'Tax ID cannot exceed 20 characters'),
  
  dateOfBirth: Yup.date()
    .max(new Date(), 'Date of birth cannot be in the future'),
  
  notes: Yup.string()
    .trim()
    .max(1000, 'Notes cannot exceed 1000 characters'),
  
  tags: Yup.array()
    .of(Yup.string().trim().max(50))
    .max(10, 'Cannot have more than 10 tags'),
  
  preferences: Yup.object({
    newsletter: Yup.boolean().default(false),
    smsNotifications: Yup.boolean().default(false),
    emailNotifications: Yup.boolean().default(true),
    preferredContactMethod: Yup.string().oneOf(['email', 'phone', 'sms']).default('email')
  })
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
export const formatPhoneNumber = (phoneNumber) => {
  if (!phoneNumber) return '';
  
  // Remove all non-digits
  const cleaned = phoneNumber.replace(/\D/g, '');
  
  // Format based on length
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  } else if (cleaned.length === 11 && cleaned[0] === '1') {
    return `+1 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7)}`;
  }
  
  return phoneNumber;
};

// Format currency
export const formatCurrency = (amount, currency = 'USD') => {
  // Handle ETB with custom formatting since it's not widely supported by Intl.NumberFormat
  if (currency === 'ETB') {
    return `Br ${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency
  }).format(amount);
};

// Format date
export const formatDate = (date) => {
  if (!date) {
    return "No date available";
  }
  
  try {
    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) {
      return "Invalid date";
    }
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(dateObj);
  } catch (error) {
    return "Invalid date";
  }
};

// Calculate age from date of birth
export const calculateAge = (dateOfBirth) => {
  if (!dateOfBirth) return null;
  
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
};

// Validate email format
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Validate phone number format
export const isValidPhoneNumber = (phone) => {
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
  return phoneRegex.test(phone.replace(/\D/g, ''));
};

// Validate ZIP code format
export const isValidZipCode = (zipCode) => {
  const zipRegex = /^[0-9]{5}(-[0-9]{4})?$/;
  return zipRegex.test(zipCode);
};

// Get customer status color
export const getCustomerStatusColor = (status) => {
  const colorMap = {
    'active': 'green',
    'inactive': 'yellow',
    'blocked': 'red'
  };
  return colorMap[status] || 'gray';
};

// Get customer type color
export const getCustomerTypeColor = (type) => {
  const colorMap = {
    'individual': 'blue',
    'business': 'purple',
    'wholesale': 'orange'
  };
  return colorMap[type] || 'gray';
};

// Format customer type for display
export const formatCustomerType = (type) => {
  const typeMap = {
    'individual': 'Individual',
    'business': 'Business',
    'wholesale': 'Wholesale'
  };
  return typeMap[type] || 'Unknown';
};

// Format customer status for display
export const formatCustomerStatus = (status) => {
  const statusMap = {
    'active': 'Active',
    'inactive': 'Inactive',
    'blocked': 'Blocked'
  };
  return statusMap[status] || 'Unknown';
};

// Generate customer ID
export const generateCustomerId = () => {
  const timestamp = Date.now().toString();
  const random = Math.random().toString(36).substr(2, 5).toUpperCase();
  return `CUST-${timestamp.slice(-6)}-${random}`;
};

// Check if customer is VIP (based on credit limit)
export const isVIPCustomer = (creditLimit) => {
  return creditLimit && creditLimit >= 10000;
};

// Get customer priority level
export const getCustomerPriority = (customer) => {
  if (customer.customerType === 'wholesale') return 'high';
  if (customer.creditLimit && customer.creditLimit >= 5000) return 'medium';
  return 'low';
};

// Format full address
export const formatFullAddress = (customer) => {
  const parts = [
    customer.address,
    customer.city,
    customer.state,
    customer.zipCode,
    customer.country
  ].filter(Boolean);
  
  return parts.join(', ');
};

// Get customer initials
export const getCustomerInitials = (name) => {
  if (!name) return '??';
  
  const words = name.trim().split(' ');
  if (words.length === 1) {
    return words[0].substring(0, 2).toUpperCase();
  }
  
  return words
    .slice(0, 2)
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase();
};

// Validate credit limit
export const validateCreditLimit = (creditLimit) => {
  if (!creditLimit) return true; // Optional field
  return creditLimit >= 0 && creditLimit <= 999999.99;
};

// Check if customer has complete contact info
export const hasCompleteContactInfo = (customer) => {
  return !!(customer.email || customer.phone);
};

// Check if customer has complete address
export const hasCompleteAddress = (customer) => {
  return !!(customer.address && customer.city && customer.state && customer.zipCode);
};

// Get customer contact score (0-100)
export const getCustomerContactScore = (customer) => {
  let score = 0;
  
  if (customer.email) score += 30;
  if (customer.phone) score += 30;
  if (customer.address) score += 20;
  if (customer.company) score += 10;
  if (customer.notes) score += 10;
  
  return score;
};
