// Enhanced form validation for user forms
import * as Yup from 'yup';

export const userValidationSchema = Yup.object({
  firstName: Yup.string()
    .trim()
    .min(2, 'First name must be at least 2 characters long')
    .max(50, 'First name cannot exceed 50 characters')
    .matches(/^[a-zA-Z\s\-'.]+$/, 'First name can only contain letters, spaces, hyphens, apostrophes, and periods')
    .required('First name is required'),
  
  lastName: Yup.string()
    .trim()
    .min(2, 'Last name must be at least 2 characters long')
    .max(50, 'Last name cannot exceed 50 characters')
    .matches(/^[a-zA-Z\s\-'.]+$/, 'Last name can only contain letters, spaces, hyphens, apostrophes, and periods')
    .required('Last name is required'),
  
  email: Yup.string()
    .trim()
    .email('Please enter a valid email address')
    .max(255, 'Email cannot exceed 255 characters')
    .required('Email is required'),
  
  password: Yup.string()
    .min(8, 'Password must be at least 8 characters long')
    .max(128, 'Password cannot exceed 128 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, 
             'Password must contain at least one lowercase letter, one uppercase letter, one number, and one special character')
    .required('Password is required'),
  
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password'), null], 'Passwords must match')
    .required('Please confirm your password'),
  
  phone: Yup.string()
    .trim()
    .matches(/^[+]?[\d\s\-\(\)]{10,20}$/, 
             'Phone number must be between 10-20 characters and contain only digits, spaces, hyphens, parentheses, and optional + prefix'),
  
  employeeId: Yup.string()
    .trim()
    .max(20, 'Employee ID cannot exceed 20 characters')
    .matches(/^[A-Z0-9\-_]+$/, 'Employee ID can only contain uppercase letters, numbers, hyphens, and underscores'),
  
  roleId: Yup.string()
    .uuid('Role ID must be a valid UUID')
    .required('Role is required'),
  
  status: Yup.string()
    .oneOf(['Active', 'Inactive', 'Deactivated', 'Banned', 'Pending'], 
           'Invalid status'),
  
  department: Yup.string()
    .trim()
    .max(100, 'Department cannot exceed 100 characters'),
  
  position: Yup.string()
    .trim()
    .max(100, 'Position cannot exceed 100 characters'),
  
  hireDate: Yup.date()
    .max(new Date(), 'Hire date cannot be in the future'),
  
  salary: Yup.number()
    .min(0, 'Salary cannot be negative')
    .max(999999.99, 'Salary cannot exceed $999,999.99'),
  
  address: Yup.object({
    street: Yup.string().trim().max(200),
    city: Yup.string().trim().max(50),
    state: Yup.string().trim().max(50),
    zipCode: Yup.string().trim().max(20),
    country: Yup.string().trim().max(50)
  }),
  
  emergencyContact: Yup.object({
    name: Yup.string().trim().max(100),
    relationship: Yup.string().trim().max(50),
    phone: Yup.string().trim().matches(/^[+]?[\d\s\-\(\)]{10,20}$/)
  }),
  
  notes: Yup.string()
    .trim()
    .max(1000, 'Notes cannot exceed 1000 characters'),
  
  permissions: Yup.array()
    .of(Yup.string().trim().max(50))
    .max(20, 'Cannot have more than 20 permissions'),
  
  isEmailVerified: Yup.boolean(),
  
  twoFactorEnabled: Yup.boolean()
});

// Update schema (password optional)
export const userUpdateValidationSchema = userValidationSchema.shape({
  password: Yup.string()
    .min(8, 'Password must be at least 8 characters long')
    .max(128, 'Password cannot exceed 128 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, 
             'Password must contain at least one lowercase letter, one uppercase letter, one number, and one special character'),
  
  confirmPassword: Yup.string()
    .when('password', {
      is: (password) => password && password.length > 0,
      then: (schema) => schema.oneOf([Yup.ref('password'), null], 'Passwords must match'),
      otherwise: (schema) => schema.notRequired()
    }),
  
  roleId: Yup.string()
    .uuid('Role ID must be a valid UUID')
});

// Password change schema
export const passwordChangeValidationSchema = Yup.object({
  currentPassword: Yup.string()
    .required('Current password is required'),
  
  newPassword: Yup.string()
    .min(8, 'New password must be at least 8 characters long')
    .max(128, 'New password cannot exceed 128 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, 
             'New password must contain at least one lowercase letter, one uppercase letter, one number, and one special character')
    .required('New password is required'),
  
  confirmNewPassword: Yup.string()
    .oneOf([Yup.ref('newPassword'), null], 'Passwords must match')
    .required('Please confirm your new password')
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

// Format number with commas
export const formatNumber = (number) => {
  return new Intl.NumberFormat('en-US').format(number);
};

// Generate employee ID
export const generateEmployeeId = () => {
  const prefix = "EMP";
  const randomPart = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `${prefix}-${randomPart}`;
};

// Get status color
export const getStatusColor = (status) => {
  const colors = {
    'Active': 'green',
    'Inactive': 'yellow',
    'Deactivated': 'red',
    'Banned': 'red',
    'Pending': 'blue',
    'Locked': 'orange'
  };
  return colors[status] || 'gray';
};

// Get status display name
export const getStatusDisplay = (status) => {
  const statuses = {
    'Active': 'Active',
    'Inactive': 'Inactive',
    'Deactivated': 'Deactivated',
    'Banned': 'Banned',
    'Pending': 'Pending',
    'Locked': 'Locked'
  };
  return statuses[status] || status;
};

// Get role display name
export const getRoleDisplay = (roleType) => {
  const roles = {
    'admin': 'Administrator',
    'staff': 'Staff',
    'manager': 'Manager',
    'viewer': 'Viewer'
  };
  return roles[roleType] || roleType;
};

// Get role color
export const getRoleColor = (roleType) => {
  const colors = {
    'admin': 'red',
    'staff': 'blue',
    'manager': 'purple',
    'viewer': 'gray'
  };
  return colors[roleType] || 'gray';
};

// Format date for display
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
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(dateObj);
  } catch (error) {
    return "Invalid date";
  }
};

// Format date for input
export const formatDateForInput = (date) => {
  return new Date(date).toISOString().slice(0, 16);
};

// Calculate user age
export const calculateAge = (birthDate) => {
  if (!birthDate) return null;
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  
  return age;
};

// Calculate years of service
export const calculateYearsOfService = (hireDate) => {
  if (!hireDate) return null;
  const today = new Date();
  const hire = new Date(hireDate);
  let years = today.getFullYear() - hire.getFullYear();
  const monthDiff = today.getMonth() - hire.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < hire.getDate())) {
    years--;
  }
  
  return years;
};

// Get full name
export const getFullName = (firstName, lastName) => {
  return `${firstName || ''} ${lastName || ''}`.trim();
};

// Get initials
export const getInitials = (firstName, lastName) => {
  const first = firstName ? firstName.charAt(0).toUpperCase() : '';
  const last = lastName ? lastName.charAt(0).toUpperCase() : '';
  return first + last;
};

// Validate password strength
export const validatePasswordStrength = (password) => {
  const checks = {
    length: password.length >= 8,
    lowercase: /[a-z]/.test(password),
    uppercase: /[A-Z]/.test(password),
    number: /\d/.test(password),
    special: /[@$!%*?&]/.test(password)
  };
  
  const score = Object.values(checks).filter(Boolean).length;
  const strength = score <= 2 ? 'weak' : score <= 4 ? 'medium' : 'strong';
  
  return {
    score,
    strength,
    checks,
    isValid: score >= 5
  };
};

// Get password strength color
export const getPasswordStrengthColor = (strength) => {
  const colors = {
    'weak': 'red',
    'medium': 'yellow',
    'strong': 'green'
  };
  return colors[strength] || 'gray';
};

// Check if user is active
export const isUserActive = (status) => {
  return status === 'Active';
};

// Check if user can be edited
export const canEditUser = (user, currentUser) => {
  // Admin can edit anyone
  if (currentUser.role?.role_type === 'admin') return true;
  
  // Users can edit their own profile
  if (user.id === currentUser.id) return true;
  
  // Managers can edit staff
  if (currentUser.role?.role_type === 'manager' && user.role?.role_type === 'staff') {
    return true;
  }
  
  return false;
};

// Check if user can be deleted
export const canDeleteUser = (user, currentUser) => {
  // Cannot delete yourself
  if (user.id === currentUser.id) return false;
  
  // Only admin can delete users
  if (currentUser.role?.role_type !== 'admin') return false;
  
  // Cannot delete other admins
  if (user.role?.role_type === 'admin') return false;
  
  return true;
};

// Check if user can change role
export const canChangeRole = (user, newRole, currentUser) => {
  // Cannot change your own role
  if (user.id === currentUser.id) return false;
  
  // Only admin can change roles
  if (currentUser.role?.role_type !== 'admin') return false;
  
  // Cannot promote to admin
  if (newRole === 'admin' && currentUser.role?.role_type !== 'admin') return false;
  
  return true;
};

// Get user priority
export const getUserPriority = (user) => {
  if (user.role?.role_type === 'admin') return 'high';
  if (user.status === 'Inactive') return 'low';
  if (user.role?.role_type === 'manager') return 'medium';
  return 'normal';
};

// Calculate user metrics
export const calculateUserMetrics = (users) => {
  const totalUsers = users.length;
  const activeUsers = users.filter(user => user.status === 'Active').length;
  const inactiveUsers = users.filter(user => user.status === 'Inactive').length;
  
  const roleCounts = users.reduce((acc, user) => {
    const role = user.role?.role_type || 'unknown';
    acc[role] = (acc[role] || 0) + 1;
    return acc;
  }, {});
  
  const departmentCounts = users.reduce((acc, user) => {
    const dept = user.department || 'Unknown';
    acc[dept] = (acc[dept] || 0) + 1;
    return acc;
  }, {});
  
  return {
    totalUsers,
    activeUsers,
    inactiveUsers,
    roleCounts,
    departmentCounts
  };
};

// Get last login display
export const getLastLoginDisplay = (lastLoginAt) => {
  if (!lastLoginAt) return 'Never';
  
  const now = new Date();
  const lastLogin = new Date(lastLoginAt);
  const diffMs = now - lastLogin;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} minutes ago`;
  if (diffHours < 24) return `${diffHours} hours ago`;
  if (diffDays < 7) return `${diffDays} days ago`;
  
  return formatDate(lastLoginAt);
};

// Check if user is online
export const isUserOnline = (lastLoginAt) => {
  if (!lastLoginAt) return false;
  
  const now = new Date();
  const lastLogin = new Date(lastLoginAt);
  const diffMs = now - lastLogin;
  const diffMins = Math.floor(diffMs / 60000);
  
  // Consider online if last login was within 15 minutes
  return diffMins <= 15;
};

// Get user activity status
export const getUserActivityStatus = (lastLoginAt) => {
  if (!lastLoginAt) return 'offline';
  
  const now = new Date();
  const lastLogin = new Date(lastLoginAt);
  const diffMs = now - lastLogin;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  
  if (diffMins <= 15) return 'online';
  if (diffMins <= 60) return 'recent';
  if (diffHours <= 24) return 'today';
  if (diffDays <= 7) return 'week';
  return 'inactive';
};

// Get activity status color
export const getActivityStatusColor = (status) => {
  const colors = {
    'online': 'green',
    'recent': 'blue',
    'today': 'yellow',
    'week': 'orange',
    'inactive': 'red',
    'offline': 'gray'
  };
  return colors[status] || 'gray';
};

// Format phone number for display
export const formatPhoneNumber = (phone) => {
  if (!phone) return '';
  
  // Remove all non-digits
  const cleaned = phone.replace(/\D/g, '');
  
  // Format as (XXX) XXX-XXXX for US numbers
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  }
  
  // Return original if not standard format
  return phone;
};

// Validate phone number format
export const validatePhoneNumber = (phone) => {
  if (!phone) return { isValid: true, error: null };
  
  const phoneRegex = /^[+]?[\d\s\-\(\)]{10,20}$/;
  if (!phoneRegex.test(phone)) {
    return {
      isValid: false,
      error: 'Phone number must be between 10-20 characters and contain only digits, spaces, hyphens, parentheses, and optional + prefix'
    };
  }
  
  return { isValid: true, error: null };
};

// Get user permissions
export const getUserPermissions = (roleType) => {
  const permissions = {
    'admin': [
      'users.create', 'users.read', 'users.update', 'users.delete',
      'products.create', 'products.read', 'products.update', 'products.delete',
      'customers.create', 'customers.read', 'customers.update', 'customers.delete',
      'suppliers.create', 'suppliers.read', 'suppliers.update', 'suppliers.delete',
      'sales.create', 'sales.read', 'sales.update', 'sales.delete',
      'purchases.create', 'purchases.read', 'purchases.update', 'purchases.delete',
      'reports.read', 'settings.update'
    ],
    'manager': [
      'users.read', 'users.update',
      'products.create', 'products.read', 'products.update', 'products.delete',
      'customers.create', 'customers.read', 'customers.update',
      'suppliers.create', 'suppliers.read', 'suppliers.update',
      'sales.create', 'sales.read', 'sales.update',
      'purchases.create', 'purchases.read', 'purchases.update',
      'reports.read'
    ],
    'staff': [
      'products.read', 'products.update',
      'customers.read', 'customers.update',
      'suppliers.read',
      'sales.create', 'sales.read',
      'purchases.read'
    ],
    'viewer': [
      'products.read',
      'customers.read',
      'suppliers.read',
      'sales.read',
      'purchases.read',
      'reports.read'
    ]
  };
  
  return permissions[roleType] || [];
};

// Check if user has permission
export const hasPermission = (user, permission) => {
  const permissions = getUserPermissions(user.role?.role_type);
  return permissions.includes(permission);
};
