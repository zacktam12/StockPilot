// Enhanced form validation for product forms
import * as Yup from 'yup';

export const productValidationSchema = Yup.object({
  name: Yup.string()
    .trim()
    .min(2, 'Product name must be at least 2 characters')
    .max(100, 'Product name cannot exceed 100 characters')
    .matches(/^[a-zA-Z0-9\s\-&.,()]+$/, 'Product name can only contain letters, numbers, spaces, and basic punctuation')
    .required('Product name is required'),
  
  description: Yup.string()
    .trim()
    .max(1000, 'Description cannot exceed 1000 characters'),
  
  sku: Yup.string()
    .trim()
    .max(50, 'SKU cannot exceed 50 characters')
    .matches(/^[A-Z0-9\-_]*$/, 'SKU can only contain uppercase letters, numbers, hyphens, and underscores'),
  
  barcode: Yup.string()
    .trim()
    .max(50, 'Barcode cannot exceed 50 characters')
    .matches(/^[0-9]*$/, 'Barcode can only contain numbers'),
  
  price: Yup.number()
    .min(0.01, 'Price must be at least $0.01')
    .max(999999.99, 'Price cannot exceed $999,999.99')
    .required('Price is required'),
  
  cost: Yup.number()
    .min(0, 'Cost cannot be negative')
    .max(999999.99, 'Cost cannot exceed $999,999.99'),
  
  quantity: Yup.number()
    .integer('Quantity must be a whole number')
    .min(0, 'Quantity cannot be negative')
    .max(999999, 'Quantity cannot exceed 999,999')
    .default(0),
  
  minStock: Yup.number()
    .integer('Minimum stock must be a whole number')
    .min(0, 'Minimum stock cannot be negative')
    .max(999999, 'Minimum stock cannot exceed 999,999'),
  
  maxStock: Yup.number()
    .integer('Maximum stock must be a whole number')
    .min(0, 'Maximum stock cannot be negative')
    .max(999999, 'Maximum stock cannot exceed 999,999'),
  
  categoryId: Yup.string()
    .uuid('Category ID must be a valid UUID')
    .required('Category is required'),
  
  image: Yup.string()
    .url('Image must be a valid URL'),
  
  image_url: Yup.string()
    .url('Image URL must be a valid URL'),
  
  status: Yup.string()
    .oneOf(['active', 'inactive', 'discontinued'], 'Status must be either active, inactive, or discontinued')
    .default('active'),
  
  weight: Yup.number()
    .min(0, 'Weight cannot be negative')
    .max(999.99, 'Weight cannot exceed 999.99'),
  
  dimensions: Yup.object({
    length: Yup.number().min(0).max(999.99),
    width: Yup.number().min(0).max(999.99),
    height: Yup.number().min(0).max(999.99)
  }),
  
  tags: Yup.array()
    .of(Yup.string().trim().max(50))
    .max(10, 'Cannot have more than 10 tags'),
  
  notes: Yup.string()
    .trim()
    .max(500, 'Notes cannot exceed 500 characters')
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
export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount);
};

// Format number with commas
export const formatNumber = (number) => {
  return new Intl.NumberFormat('en-US').format(number);
};

// Generate SKU from product name
export const generateSKU = (name) => {
  if (!name) return '';
  
  // Remove special characters and convert to uppercase
  const sku = name
    .replace(/[^a-zA-Z0-9\s]/g, '')
    .replace(/\s+/g, '-')
    .toUpperCase()
    .substring(0, 20);
  
  // Add timestamp for uniqueness
  const timestamp = Date.now().toString().slice(-4);
  return `${sku}-${timestamp}`;
};

// Generate barcode (simple numeric)
export const generateBarcode = () => {
  // Generate a 12-digit barcode
  return Math.floor(100000000000 + Math.random() * 900000000000).toString();
};

// Validate SKU format
export const isValidSKU = (sku) => {
  const skuRegex = /^[A-Z0-9\-_]+$/;
  return skuRegex.test(sku);
};

// Validate barcode format
export const isValidBarcode = (barcode) => {
  const barcodeRegex = /^[0-9]+$/;
  return barcodeRegex.test(barcode);
};

// Validate price format
export const isValidPrice = (price) => {
  const priceRegex = /^\d+(\.\d{1,2})?$/;
  return priceRegex.test(price);
};

// Validate stock quantity
export const isValidStock = (quantity) => {
  const stockRegex = /^\d+$/;
  return stockRegex.test(quantity) && parseInt(quantity) >= 0;
};

// Calculate profit margin
export const calculateProfitMargin = (price, cost) => {
  if (!price || !cost || cost <= 0) return 0;
  return ((price - cost) / price * 100).toFixed(2);
};

// Check if stock is low
export const isLowStock = (quantity, minStock) => {
  if (!minStock) return false;
  return quantity <= minStock;
};

// Get stock status
export const getStockStatus = (quantity, minStock, maxStock) => {
  if (quantity <= 0) return 'out_of_stock';
  if (minStock && quantity <= minStock) return 'low_stock';
  if (maxStock && quantity >= maxStock) return 'overstocked';
  return 'in_stock';
};

// Format stock status for display
export const formatStockStatus = (status) => {
  const statusMap = {
    'out_of_stock': 'Out of Stock',
    'low_stock': 'Low Stock',
    'in_stock': 'In Stock',
    'overstocked': 'Overstocked'
  };
  return statusMap[status] || 'Unknown';
};

// Get stock status color
export const getStockStatusColor = (status) => {
  const colorMap = {
    'out_of_stock': 'red',
    'low_stock': 'yellow',
    'in_stock': 'green',
    'overstocked': 'blue'
  };
  return colorMap[status] || 'gray';
};
