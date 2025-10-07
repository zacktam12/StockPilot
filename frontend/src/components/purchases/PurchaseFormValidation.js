// Enhanced form validation for purchase forms
import * as Yup from 'yup';

export const purchaseValidationSchema = Yup.object({
  supplierId: Yup.string()
    .uuid('Supplier ID must be a valid UUID')
    .required('Supplier is required'),
  
  totalCost: Yup.number()
    .min(0, 'Total cost cannot be negative')
    .max(999999.99, 'Total cost cannot exceed $999,999.99'),
  
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
  
  status: Yup.string()
    .oneOf(['pending', 'received', 'cancelled', 'partially_received', 'on_hold'], 
           'Invalid status'),
  
  notes: Yup.string()
    .trim()
    .max(1000, 'Notes cannot exceed 1000 characters'),
  
  poNumber: Yup.string()
    .trim()
    .max(50, 'PO number cannot exceed 50 characters'),
  
  expectedDeliveryDate: Yup.date()
    .min(new Date(), 'Expected delivery date cannot be in the past'),
  
  actualDeliveryDate: Yup.date(),
  
  shippingCost: Yup.number()
    .min(0, 'Shipping cost cannot be negative')
    .max(99999.99, 'Shipping cost cannot exceed $99,999.99'),
  
  paymentTerms: Yup.string()
    .oneOf(['net_15', 'net_30', 'net_45', 'net_60', 'due_on_receipt', 'prepaid'], 
           'Invalid payment terms'),
  
  paymentMethod: Yup.string()
    .oneOf(['cash', 'check', 'bank_transfer', 'credit_card', 'purchase_order'], 
           'Invalid payment method'),
  
  priority: Yup.string()
    .oneOf(['low', 'medium', 'high', 'urgent'], 
           'Invalid priority'),
  
  items: Yup.array()
    .of(
      Yup.object({
        productId: Yup.string()
          .uuid('Product ID must be a valid UUID')
          .required('Product is required'),
        
        purchase_price: Yup.number()
          .positive('Purchase price must be positive')
          .max(999999.99, 'Purchase price cannot exceed $999,999.99')
          .required('Purchase price is required'),
        
        purchase_quantity: Yup.number()
          .integer('Purchase quantity must be a whole number')
          .positive('Purchase quantity must be positive')
          .max(9999, 'Purchase quantity cannot exceed 9999')
          .required('Purchase quantity is required'),
        
        received_quantity: Yup.number()
          .integer('Received quantity must be a whole number')
          .min(0, 'Received quantity cannot be negative')
          .max(9999, 'Received quantity cannot exceed 9999'),
        
        notes: Yup.string()
          .trim()
          .max(500, 'Item notes cannot exceed 500 characters')
      })
    )
    .min(1, 'At least one item is required')
    .max(100, 'Cannot have more than 100 items in a single purchase')
    .required('Items are required'),
  
  tags: Yup.array()
    .of(Yup.string().trim().max(50))
    .max(10, 'Cannot have more than 10 tags'),
  
  attachments: Yup.array()
    .of(Yup.string().url('Invalid attachment URL'))
    .max(5, 'Cannot have more than 5 attachments')
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

// Calculate purchase total
export const calculatePurchaseTotal = (items, discount = 0, tax = 0, shippingCost = 0) => {
  const subtotal = items.reduce((sum, item) => {
    return sum + calculateItemTotal(item.purchase_quantity, item.purchase_price, item.discount || 0);
  }, 0);
  
  const discountAmount = (discount / 100) * subtotal;
  const taxableAmount = subtotal - discountAmount;
  const taxAmount = (tax / 100) * taxableAmount;
  
  return {
    subtotal,
    discountAmount,
    taxableAmount,
    taxAmount,
    shippingCost,
    total: taxableAmount + taxAmount + shippingCost
  };
};

// Generate PO number
export const generatePONumber = () => {
  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
  const timeStr = now.getTime().toString().slice(-6);
  return `PO-${dateStr}-${timeStr}`;
};

// Get payment terms display name
export const getPaymentTermsDisplay = (terms) => {
  const termsMap = {
    'net_15': 'Net 15',
    'net_30': 'Net 30',
    'net_45': 'Net 45',
    'net_60': 'Net 60',
    'due_on_receipt': 'Due on Receipt',
    'prepaid': 'Prepaid'
  };
  return termsMap[terms] || terms;
};

// Get payment method display name
export const getPaymentMethodDisplay = (method) => {
  const methods = {
    'cash': 'Cash',
    'check': 'Check',
    'bank_transfer': 'Bank Transfer',
    'credit_card': 'Credit Card',
    'purchase_order': 'Purchase Order'
  };
  return methods[method] || method;
};

// Get payment method icon
export const getPaymentMethodIcon = (method) => {
  const icons = {
    'cash': '💵',
    'check': '📝',
    'bank_transfer': '🏦',
    'credit_card': '💳',
    'purchase_order': '📋'
  };
  return icons[method] || '💰';
};

// Get status color
export const getStatusColor = (status) => {
  const colors = {
    'pending': 'yellow',
    'received': 'green',
    'cancelled': 'red',
    'partially_received': 'blue',
    'on_hold': 'orange'
  };
  return colors[status] || 'gray';
};

// Get status display name
export const getStatusDisplay = (status) => {
  const statuses = {
    'pending': 'Pending',
    'received': 'Received',
    'cancelled': 'Cancelled',
    'partially_received': 'Partially Received',
    'on_hold': 'On Hold'
  };
  return statuses[status] || status;
};

// Get priority color
export const getPriorityColor = (priority) => {
  const colors = {
    'low': 'green',
    'medium': 'yellow',
    'high': 'orange',
    'urgent': 'red'
  };
  return colors[priority] || 'gray';
};

// Get priority display name
export const getPriorityDisplay = (priority) => {
  const priorities = {
    'low': 'Low',
    'medium': 'Medium',
    'high': 'High',
    'urgent': 'Urgent'
  };
  return priorities[priority] || priority;
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

// Check if purchase is editable
export const isPurchaseEditable = (status) => {
  return ['pending', 'partially_received'].includes(status);
};

// Check if purchase can be cancelled
export const canCancelPurchase = (status) => {
  return ['pending', 'partially_received'].includes(status);
};

// Check if purchase can be received
export const canReceivePurchase = (status) => {
  return ['pending', 'partially_received'].includes(status);
};

// Get purchase priority
export const getPurchasePriority = (purchase) => {
  const total = purchase.totalCost || 0;
  const daysUntilDelivery = purchase.expectedDeliveryDate 
    ? Math.ceil((new Date(purchase.expectedDeliveryDate) - new Date()) / (1000 * 60 * 60 * 24))
    : 999;
  
  if (daysUntilDelivery < 0) return 'urgent'; // Overdue
  if (daysUntilDelivery <= 1) return 'high'; // Due soon
  if (total >= 5000) return 'medium'; // High value
  return 'low';
};

// Calculate purchase metrics
export const calculatePurchaseMetrics = (purchases) => {
  const totalPurchases = purchases.length;
  const totalCost = purchases.reduce((sum, purchase) => sum + (purchase.totalCost || 0), 0);
  const avgOrderValue = totalPurchases > 0 ? totalCost / totalPurchases : 0;
  
  const statusCounts = purchases.reduce((acc, purchase) => {
    acc[purchase.status] = (acc[purchase.status] || 0) + 1;
    return acc;
  }, {});
  
  return {
    totalPurchases,
    totalCost,
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

// Validate PO number format
export const validatePONumber = (poNumber) => {
  const pattern = /^PO-\d{8}-\d{4,6}$/;
  if (!pattern.test(poNumber)) {
    return {
      isValid: false,
      error: 'PO number must be in format PO-YYYYMMDD-XXXX'
    };
  }
  return { isValid: true, error: null };
};

// Check if purchase is overdue
export const isPurchaseOverdue = (purchase) => {
  if (!purchase.expectedDeliveryDate) return false;
  return new Date(purchase.expectedDeliveryDate) < new Date();
};

// Get days until delivery
export const getDaysUntilDelivery = (purchase) => {
  if (!purchase.expectedDeliveryDate) return null;
  return Math.ceil((new Date(purchase.expectedDeliveryDate) - new Date()) / (1000 * 60 * 60 * 24));
};

// Calculate received percentage
export const calculateReceivedPercentage = (purchase) => {
  if (!purchase.productPurchases || purchase.productPurchases.length === 0) return 0;
  
  const totalOrdered = purchase.productPurchases.reduce((sum, item) => sum + item.purchase_quantity, 0);
  const totalReceived = purchase.productPurchases.reduce((sum, item) => sum + (item.received_quantity || 0), 0);
  
  return totalOrdered > 0 ? Math.round((totalReceived / totalOrdered) * 100) : 0;
};

// Get purchase status based on received quantity
export const getPurchaseStatusFromItems = (productPurchases) => {
  if (!productPurchases || productPurchases.length === 0) return 'pending';
  
  const totalOrdered = productPurchases.reduce((sum, item) => sum + item.purchase_quantity, 0);
  const totalReceived = productPurchases.reduce((sum, item) => sum + (item.received_quantity || 0), 0);
  
  if (totalReceived === 0) return 'pending';
  if (totalReceived >= totalOrdered) return 'received';
  return 'partially_received';
};

// Validate received quantity
export const validateReceivedQuantity = (received, ordered) => {
  if (received < 0) {
    return {
      isValid: false,
      error: 'Received quantity cannot be negative'
    };
  }
  if (received > ordered) {
    return {
      isValid: false,
      error: 'Received quantity cannot exceed ordered quantity'
    };
  }
  return { isValid: true, error: null };
};

// Get supplier performance metrics
export const getSupplierPerformance = (purchases) => {
  const supplierStats = purchases.reduce((acc, purchase) => {
    const supplierId = purchase.supplierId;
    if (!acc[supplierId]) {
      acc[supplierId] = {
        name: purchase.supplier?.name || 'Unknown',
        totalOrders: 0,
        totalValue: 0,
        onTimeDeliveries: 0,
        lateDeliveries: 0
      };
    }
    
    acc[supplierId].totalOrders++;
    acc[supplierId].totalValue += purchase.totalCost || 0;
    
    if (purchase.status === 'received') {
      const isOnTime = !isPurchaseOverdue(purchase);
      if (isOnTime) {
        acc[supplierId].onTimeDeliveries++;
      } else {
        acc[supplierId].lateDeliveries++;
      }
    }
    
    return acc;
  }, {});
  
  // Calculate performance scores
  Object.values(supplierStats).forEach(supplier => {
    const totalDeliveries = supplier.onTimeDeliveries + supplier.lateDeliveries;
    supplier.onTimeRate = totalDeliveries > 0 ? (supplier.onTimeDeliveries / totalDeliveries * 100).toFixed(1) : 0;
    supplier.avgOrderValue = supplier.totalOrders > 0 ? (supplier.totalValue / supplier.totalOrders).toFixed(2) : 0;
  });
  
  return supplierStats;
};
