// Enhanced form validation for sales forms
import * as Yup from 'yup';

export const salesValidationSchema = Yup.object({
  customerId: Yup.string()
    .uuid('Customer ID must be a valid UUID'),
  
  items: Yup.array()
    .of(
      Yup.object({
        product_id: Yup.string()
          .uuid('Product ID must be a valid UUID')
          .required('Product is required'),
        
        quantity: Yup.number()
          .integer('Quantity must be a whole number')
          .positive('Quantity must be positive')
          .max(9999, 'Quantity cannot exceed 9999')
          .required('Quantity is required'),
        
        price: Yup.number()
          .positive('Price must be positive')
          .max(999999.99, 'Price cannot exceed $999,999.99')
          .required('Price is required'),
        
        discount: Yup.number()
          .min(0, 'Discount cannot be negative')
          .max(100, 'Discount cannot exceed 100%'),
        
        notes: Yup.string()
          .trim()
          .max(500, 'Item notes cannot exceed 500 characters')
      })
    )
    .min(1, 'At least one item is required')
    .max(100, 'Cannot have more than 100 items in a single sale')
    .required('Items are required'),
  
  totalPrice: Yup.number()
    .min(0, 'Total price cannot be negative')
    .max(999999.99, 'Total price cannot exceed $999,999.99'),
  
  discount: Yup.number()
    .min(0, 'Discount cannot be negative')
    .max(999999.99, 'Discount cannot exceed $999,999.99'),
  
  discountPercentage: Yup.number()
    .min(0, 'Discount percentage cannot be negative')
    .max(100, 'Discount percentage cannot exceed 100%'),
  
  tax: Yup.number()
    .min(0, 'Tax cannot be negative')
    .max(999999.99, 'Tax cannot exceed $999,999.99'),
  
  taxPercentage: Yup.number()
    .min(0, 'Tax percentage cannot be negative')
    .max(50, 'Tax percentage cannot exceed 50%'),
  
  paymentMethod: Yup.string()
    .oneOf(['cash', 'card', 'check', 'bank_transfer', 'digital_wallet', 'store_credit'], 
           'Invalid payment method'),
  
  status: Yup.string()
    .oneOf(['completed', 'pending', 'cancelled', 'refunded', 'partially_refunded'], 
           'Invalid status'),
  
  notes: Yup.string()
    .trim()
    .max(1000, 'Notes cannot exceed 1000 characters'),
  
  orderNumber: Yup.string()
    .trim()
    .max(50, 'Order number cannot exceed 50 characters'),
  
  shippingAddress: Yup.object({
    street: Yup.string().trim().max(200),
    city: Yup.string().trim().max(50),
    state: Yup.string().trim().max(50),
    zipCode: Yup.string().trim().max(20),
    country: Yup.string().trim().max(50)
  }),
  
  deliveryDate: Yup.date()
    .min(new Date(), 'Delivery date cannot be in the past'),
  
  tags: Yup.array()
    .of(Yup.string().trim().max(50))
    .max(10, 'Cannot have more than 10 tags')
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

// Calculate item total
export const calculateItemTotal = (quantity, price, discount = 0) => {
  const subtotal = quantity * price;
  const discountAmount = (discount / 100) * subtotal;
  return subtotal - discountAmount;
};

// Calculate sale total
export const calculateSaleTotal = (items, discount = 0, tax = 0) => {
  const subtotal = items.reduce((sum, item) => {
    return sum + calculateItemTotal(item.quantity, item.price, item.discount || 0);
  }, 0);
  
  const discountAmount = (discount / 100) * subtotal;
  const taxableAmount = subtotal - discountAmount;
  const taxAmount = (tax / 100) * taxableAmount;
  
  return {
    subtotal,
    discountAmount,
    taxableAmount,
    taxAmount,
    total: taxableAmount + taxAmount
  };
};

// Validate quantity against stock
export const validateStock = (quantity, availableStock) => {
  if (quantity > availableStock) {
    return {
      isValid: false,
      error: `Insufficient stock. Available: ${availableStock}`
    };
  }
  return { isValid: true, error: null };
};

// Generate order number
export const generateOrderNumber = () => {
  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
  const timeStr = now.getTime().toString().slice(-6);
  return `SO-${dateStr}-${timeStr}`;
};

// Get payment method display name
export const getPaymentMethodDisplay = (method) => {
  const methods = {
    'cash': 'Cash',
    'card': 'Credit/Debit Card',
    'check': 'Check',
    'bank_transfer': 'Bank Transfer',
    'digital_wallet': 'Digital Wallet',
    'store_credit': 'Store Credit'
  };
  return methods[method] || method;
};

// Get payment method icon
export const getPaymentMethodIcon = (method) => {
  const icons = {
    'cash': '💵',
    'card': '💳',
    'check': '📝',
    'bank_transfer': '🏦',
    'digital_wallet': '📱',
    'store_credit': '🎫'
  };
  return icons[method] || '💰';
};

// Get status color
export const getStatusColor = (status) => {
  const colors = {
    'completed': 'green',
    'pending': 'yellow',
    'cancelled': 'red',
    'refunded': 'blue',
    'partially_refunded': 'orange'
  };
  return colors[status] || 'gray';
};

// Get status display name
export const getStatusDisplay = (status) => {
  const statuses = {
    'completed': 'Completed',
    'pending': 'Pending',
    'cancelled': 'Cancelled',
    'refunded': 'Refunded',
    'partially_refunded': 'Partially Refunded'
  };
  return statuses[status] || status;
};

// Calculate profit margin
export const calculateProfitMargin = (sellingPrice, costPrice) => {
  if (!costPrice || costPrice <= 0) return 0;
  return ((sellingPrice - costPrice) / sellingPrice * 100).toFixed(2);
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
    console.error("Date formatting error:", error);
    return "Invalid date";
  }
};

// Format date for input
export const formatDateForInput = (date) => {
  return new Date(date).toISOString().slice(0, 16);
};

// Validate discount percentage
export const validateDiscountPercentage = (percentage) => {
  if (percentage < 0 || percentage > 100) {
    return {
      isValid: false,
      error: 'Discount percentage must be between 0 and 100'
    };
  }
  return { isValid: true, error: null };
};

// Validate tax percentage
export const validateTaxPercentage = (percentage) => {
  if (percentage < 0 || percentage > 50) {
    return {
      isValid: false,
      error: 'Tax percentage must be between 0 and 50'
    };
  }
  return { isValid: true, error: null };
};

// Check if sale is editable
export const isSaleEditable = (status) => {
  return ['pending', 'completed'].includes(status);
};

// Check if sale can be cancelled
export const canCancelSale = (status) => {
  return ['pending', 'completed'].includes(status);
};

// Check if sale can be refunded
export const canRefundSale = (status) => {
  return ['completed'].includes(status);
};

// Get sale priority
export const getSalePriority = (sale) => {
  const total = sale.totalPrice || 0;
  if (total >= 1000) return 'high';
  if (total >= 500) return 'medium';
  return 'low';
};

// Calculate sale metrics
export const calculateSaleMetrics = (sales) => {
  const totalSales = sales.length;
  const totalRevenue = sales.reduce((sum, sale) => sum + (sale.totalPrice || 0), 0);
  const avgOrderValue = totalSales > 0 ? totalRevenue / totalSales : 0;
  
  const statusCounts = sales.reduce((acc, sale) => {
    acc[sale.status] = (acc[sale.status] || 0) + 1;
    return acc;
  }, {});
  
  return {
    totalSales,
    totalRevenue,
    avgOrderValue,
    statusCounts
  };
};

// Validate delivery date
export const validateDeliveryDate = (date, minDate = new Date()) => {
  if (new Date(date) < minDate) {
    return {
      isValid: false,
      error: 'Delivery date cannot be in the past'
    };
  }
  return { isValid: true, error: null };
};

// Get shipping address display
export const formatShippingAddress = (address) => {
  if (!address) return 'No address';
  
  const parts = [
    address.street,
    address.city,
    address.state,
    address.zipCode,
    address.country
  ].filter(Boolean);
  
  return parts.join(', ');
};

// Validate order number format
export const validateOrderNumber = (orderNumber) => {
  const pattern = /^SO-\d{8}-\d{4,6}$/;
  if (!pattern.test(orderNumber)) {
    return {
      isValid: false,
      error: 'Order number must be in format SO-YYYYMMDD-XXXX'
    };
  }
  return { isValid: true, error: null };
};
