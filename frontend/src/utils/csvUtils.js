/**
 * CSV Export Utilities
 */

// Escape and quote CSV values
const escapeCSVValue = (value) => {
  if (value === null || value === undefined) return '""';

  const stringValue = String(value);

  // If the value contains comma, quote, or newline, it needs to be quoted
  if (
    stringValue.includes(",") ||
    stringValue.includes('"') ||
    stringValue.includes("\n")
  ) {
    // Escape quotes by doubling them
    const escapedValue = stringValue.replace(/"/g, '""');
    return `"${escapedValue}"`;
  }

  return stringValue;
};

// Convert array of objects to CSV string
export const convertToCSV = (data, headers) => {
  if (!data || data.length === 0) return "";

  // Create header row
  const headerRow = headers
    .map((header) => escapeCSVValue(header.label))
    .join(",");

  // Create data rows
  const dataRows = data.map((item) => {
    return headers
      .map((header) => {
        const value = header.key
          .split(".")
          .reduce((obj, key) => obj?.[key], item);
        return escapeCSVValue(value);
      })
      .join(",");
  });

  return [headerRow, ...dataRows].join("\n");
};

// Generate filename with current date
export const generateCSVFilename = (prefix = "export") => {
  const date = new Date().toISOString().split("T")[0];
  return `${prefix}-${date}.csv`;
};

// Download CSV file
export const downloadCSV = (csvContent, filename) => {
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");

  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};

/**
 * CSV Import Utilities
 */

// Parse CSV string to array of objects
export const parseCSV = (csvString) => {
  const lines = csvString.split("\n").filter((line) => line.trim());
  if (lines.length < 2) {
    throw new Error(
      "CSV file must have at least a header row and one data row"
    );
  }

  // Parse header row
  const headers = parseCSVRow(lines[0]);

  // Parse data rows
  const data = lines.slice(1).map((line) => {
    const values = parseCSVRow(line);
    const row = {};

    headers.forEach((header, i) => {
      row[header] = values[i] || "";
    });

    return row;
  });

  return { headers, data };
};

// Parse a single CSV row, handling quoted values
const parseCSVRow = (row) => {
  const result = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < row.length; i++) {
    const char = row[i];

    if (char === '"') {
      if (inQuotes && row[i + 1] === '"') {
        // Escaped quote
        current += '"';
        i++; // Skip next quote
      } else {
        // Toggle quote state
        inQuotes = !inQuotes;
      }
    } else if (char === "," && !inQuotes) {
      // End of field
      result.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }

  // Add the last field
  result.push(current.trim());

  return result;
};

// Validate CSV data structure with field mapping support
export const validateCSVData = (data, requiredFields = []) => {
  const errors = [];

  if (!data || data.length === 0) {
    errors.push("No data found in CSV file");
    return errors;
  }

  // Check required fields (support both formats)
  const firstRow = data[0];
  const availableFields = Object.keys(firstRow);

  // Check if required fields exist in either format
  const missingFields = requiredFields.filter((requiredField) => {
    // Check for exact match
    if (availableFields.includes(requiredField)) return false;

    // Check for mapped field (capitalized version)
    const capitalizedField =
      requiredField.charAt(0).toUpperCase() + requiredField.slice(1);
    if (availableFields.includes(capitalizedField)) return false;

    // Check for special cases
    if (requiredField === "name" && availableFields.includes("Name"))
      return false;
    if (requiredField === "price" && availableFields.includes("Price"))
      return false;

    return true;
  });

  if (missingFields.length > 0) {
    errors.push(`Missing required fields: ${missingFields.join(", ")}`);
  }

  // Validate data types and required values
  data.forEach((row, index) => {
    const rowNumber = index + 2; // +2 because we start from row 2 (after header)

    // Check for required fields (support both formats)
    requiredFields.forEach((requiredField) => {
      let fieldValue = null;

      // Try different field name formats
      if (row[requiredField]) {
        fieldValue = row[requiredField];
      } else if (
        row[requiredField.charAt(0).toUpperCase() + requiredField.slice(1)]
      ) {
        fieldValue =
          row[requiredField.charAt(0).toUpperCase() + requiredField.slice(1)];
      } else if (requiredField === "name" && row["Name"]) {
        fieldValue = row["Name"];
      } else if (requiredField === "price" && row["Price"]) {
        fieldValue = row["Price"];
      }

      if (!fieldValue || fieldValue.toString().trim() === "") {
        errors.push(`Row ${rowNumber}: ${requiredField} is required`);
      }
    });

    // Validate numeric fields (support both formats)
    const getNumericValue = (fieldName) => {
      return (
        row[fieldName] ||
        row[fieldName.charAt(0).toUpperCase() + fieldName.slice(1)]
      );
    };

    const priceValue = getNumericValue("price");
    if (priceValue && isNaN(parseFloat(priceValue))) {
      errors.push(`Row ${rowNumber}: Price must be a valid number`);
    }

    const costValue = getNumericValue("cost");
    if (costValue && isNaN(parseFloat(costValue))) {
      errors.push(`Row ${rowNumber}: Cost must be a valid number`);
    }

    const quantityValue = getNumericValue("quantity");
    if (quantityValue && isNaN(parseInt(quantityValue))) {
      errors.push(`Row ${rowNumber}: Quantity must be a valid integer`);
    }

    const minStockValue =
      getNumericValue("minStock") || getNumericValue("Min Stock");
    if (minStockValue && isNaN(parseInt(minStockValue))) {
      errors.push(`Row ${rowNumber}: Min Stock must be a valid integer`);
    }

    const maxStockValue =
      getNumericValue("maxStock") || getNumericValue("Max Stock");
    if (maxStockValue && isNaN(parseInt(maxStockValue))) {
      errors.push(`Row ${rowNumber}: Max Stock must be a valid integer`);
    }
  });

  return errors;
};

// Convert CSV data to product format with field mapping support
export const convertCSVToProducts = (csvData) => {
  return csvData.map((row) => {
    // Helper function to get field value with fallback
    const getFieldValue = (fieldName, defaultValue = "") => {
      return (
        row[fieldName] ||
        row[fieldName.charAt(0).toUpperCase() + fieldName.slice(1)] ||
        defaultValue
      );
    };

    // Helper function to get numeric field value
    const getNumericValue = (fieldName, defaultValue = 0) => {
      const value = getFieldValue(fieldName);
      return value ? parseFloat(value) : defaultValue;
    };

    // Helper function to get integer field value
    const getIntegerValue = (fieldName, defaultValue = 0) => {
      const value = getFieldValue(fieldName);
      return value ? parseInt(value) : defaultValue;
    };

    return {
      name: getFieldValue("name", "").trim(),
      description: getFieldValue("description", "").trim(),
      sku: getFieldValue("sku", "").trim(),
      barcode: getFieldValue("barcode", "").trim(),
      price: getNumericValue("price", 0),
      cost: getNumericValue("cost", null),
      quantity: getIntegerValue("quantity", 0),
      minStock:
        getIntegerValue("minStock", null) || getIntegerValue("Min Stock", null),
      maxStock:
        getIntegerValue("maxStock", null) || getIntegerValue("Max Stock", null),
      categoryId: getIntegerValue("categoryId", null),
      image_url: getFieldValue("image_url", "").trim(),
    };
  });
};

// Product CSV headers configuration
export const PRODUCT_CSV_HEADERS = [
  { key: "name", label: "Name" },
  { key: "description", label: "Description" },
  { key: "sku", label: "SKU" },
  { key: "barcode", label: "Barcode" },
  { key: "price", label: "Price" },
  { key: "cost", label: "Cost" },
  { key: "quantity", label: "Quantity" },
  { key: "minStock", label: "Min Stock" },
  { key: "maxStock", label: "Max Stock" },
  { key: "category.name", label: "Category" },
  { key: "status", label: "Status" },
];

// Required fields for CSV import (support both lowercase and capitalized versions)
export const REQUIRED_CSV_FIELDS = ["name", "price"];

// Field mapping for CSV import (handles both export and import formats)
export const CSV_FIELD_MAPPING = {
  // Export format (capitalized)
  Name: "name",
  Description: "description",
  SKU: "sku",
  Barcode: "barcode",
  Price: "price",
  Cost: "cost",
  Quantity: "quantity",
  "Min Stock": "minStock",
  "Max Stock": "maxStock",
  Category: "categoryName",
  "Category ID": "categoryId",
  "Image URL": "image_url",
  "Created At": "createdAt",

  // Import format (lowercase)
  name: "name",
  description: "description",
  sku: "sku",
  barcode: "barcode",
  price: "price",
  cost: "cost",
  quantity: "quantity",
  minStock: "minStock",
  maxStock: "maxStock",
  categoryId: "categoryId",
  image_url: "image_url",
};

// CSV Export utility functions

export const exportToCSV = (data, filename = "export.csv", headers = null) => {
  if (!data || data.length === 0) {
    console.warn("No data to export");
    return;
  }

  // Generate headers if not provided
  const csvHeaders = headers || Object.keys(data[0]);

  // Create CSV content
  const csvContent = [
    csvHeaders.join(","),
    ...data.map((row) =>
      csvHeaders
        .map((header) => {
          const value = row[header];
          // Handle values that contain commas, quotes, or newlines
          if (value === null || value === undefined) return "";
          const stringValue = String(value);
          if (
            stringValue.includes(",") ||
            stringValue.includes('"') ||
            stringValue.includes("\n")
          ) {
            return `"${stringValue.replace(/"/g, '""')}"`;
          }
          return stringValue;
        })
        .join(",")
    ),
  ].join("\n");

  // Create and download file
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");

  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};

// User-specific export function
export const exportUsersToCSV = (users) => {
  const userData = users.map((user) => ({
    "First Name": user.firstName || "",
    "Last Name": user.lastName || "",
    Email: user.email || "",
    Phone: user.phone || "",
    "Employee ID": user.employeeId || "",
    Role: user.role?.role_type || "",
    Status: user.status || "",
    "Created At": user.createdAt
      ? new Date(user.createdAt).toLocaleDateString()
      : "",
  }));

  exportToCSV(
    userData,
    `users-export-${new Date().toISOString().split("T")[0]}.csv`
  );
};

// Product-specific export function
export const exportProductsToCSV = (products) => {
  const productData = products.map((product) => ({
    Name: product.name || "",
    Description: product.description || "",
    SKU: product.sku || "",
    Barcode: product.barcode || "",
    Price: product.price || "",
    Cost: product.cost || "",
    Quantity: product.quantity || "",
    "Min Stock": product.minStock || "",
    "Max Stock": product.maxStock || "",
    Category: product.category?.name || "",
    "Created At": product.createdAt
      ? new Date(product.createdAt).toLocaleDateString()
      : "",
  }));

  exportToCSV(
    productData,
    `products-export-${new Date().toISOString().split("T")[0]}.csv`
  );
};

// Generic export function with custom field mapping
export const exportDataToCSV = (data, fieldMapping, filename) => {
  const mappedData = data.map((item) => {
    const mappedItem = {};
    Object.keys(fieldMapping).forEach((key) => {
      const value = getNestedValue(item, fieldMapping[key]);
      mappedItem[key] = value;
    });
    return mappedItem;
  });

  exportToCSV(mappedData, filename);
};

// Helper function to get nested object values
const getNestedValue = (obj, path) => {
  return path.split(".").reduce((current, key) => {
    return current && current[key] !== undefined ? current[key] : "";
  }, obj);
};

// CSV Import validation helpers
export const validateUserCSV = (data) => {
  const requiredFields = ["First Name", "Last Name", "Email"];
  const errors = [];

  data.forEach((row, index) => {
    requiredFields.forEach((field) => {
      if (!row[field] || row[field].trim() === "") {
        errors.push(`Row ${index + 1}: ${field} is required`);
      }
    });

    // Validate email format
    if (row.Email && !isValidEmail(row.Email)) {
      errors.push(`Row ${index + 1}: Invalid email format`);
    }
  });

  return {
    isValid: errors.length === 0,
    errors,
  };
};

export const validateProductCSV = (data) => {
  const errors = [];
  const requiredFields = ["Name", "Price"];

  if (!data || data.length === 0) {
    return { isValid: false, errors: ["No data found in CSV file"] };
  }

  // Check required fields
  const firstRow = data[0];
  const missingFields = requiredFields.filter((field) => !(field in firstRow));

  if (missingFields.length > 0) {
    errors.push(`Missing required fields: ${missingFields.join(", ")}`);
  }

  // Validate data
  data.forEach((row, index) => {
    const rowNumber = index + 2;

    // Check required fields
    requiredFields.forEach((field) => {
      if (!row[field] || row[field].trim() === "") {
        errors.push(`Row ${rowNumber}: ${field} is required`);
      }
    });

    // Validate numeric fields
    if (row.Price && isNaN(parseFloat(row.Price))) {
      errors.push(`Row ${rowNumber}: Price must be a valid number`);
    }

    if (row.Cost && isNaN(parseFloat(row.Cost))) {
      errors.push(`Row ${rowNumber}: Cost must be a valid number`);
    }

    if (row.Quantity && isNaN(parseInt(row.Quantity))) {
      errors.push(`Row ${rowNumber}: Quantity must be a valid integer`);
    }

    if (row["Min Stock"] && isNaN(parseInt(row["Min Stock"]))) {
      errors.push(`Row ${rowNumber}: Min Stock must be a valid integer`);
    }

    if (row["Max Stock"] && isNaN(parseInt(row["Max Stock"]))) {
      errors.push(`Row ${rowNumber}: Max Stock must be a valid integer`);
    }
  });

  return { isValid: errors.length === 0, errors };
};

const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Supplier CSV utilities
export const exportSuppliersToCSV = (suppliers) => {
  const headers = [
    { key: "name", label: "Name" },
    { key: "contactName", label: "Contact Name" },
    { key: "email", label: "Email" },
    { key: "phone", label: "Phone" },
    { key: "address", label: "Address" },
    { key: "companyName", label: "Company Name" },
    { key: "createdAt", label: "Created At" },
    { key: "updatedAt", label: "Updated At" },
  ];

  const csvContent = convertToCSV(suppliers, headers);
  const filename = generateCSVFilename("suppliers");
  downloadCSV(csvContent, filename);
};

export const validateSupplierCSV = (data) => {
  const errors = [];
  const requiredFields = ["Name"];

  if (!data || data.length === 0) {
    return { isValid: false, errors: ["No data found in CSV file"] };
  }

  // Check required fields (support both formats)
  const firstRow = data[0];
  const availableFields = Object.keys(firstRow);

  // Check if required fields exist in either format
  const missingFields = requiredFields.filter((requiredField) => {
    // Check for exact match
    if (availableFields.includes(requiredField)) return false;

    // Check for lowercase version
    const lowercaseField = requiredField.toLowerCase();
    if (availableFields.includes(lowercaseField)) return false;

    return true;
  });

  if (missingFields.length > 0) {
    errors.push(`Missing required fields: ${missingFields.join(", ")}`);
  }

  // Validate data
  data.forEach((row, index) => {
    const rowNumber = index + 2;

    // Check for required fields (support both formats)
    requiredFields.forEach((requiredField) => {
      let fieldValue = null;

      // Try different field name formats
      if (row[requiredField]) {
        fieldValue = row[requiredField];
      } else if (row[requiredField.toLowerCase()]) {
        fieldValue = row[requiredField.toLowerCase()];
      }

      if (!fieldValue || fieldValue.toString().trim() === "") {
        errors.push(`Row ${rowNumber}: ${requiredField} is required`);
      }
    });

    // Validate email format (support both formats)
    const emailValue = row.Email || row.email;
    if (emailValue && !isValidEmail(emailValue)) {
      errors.push(`Row ${rowNumber}: Invalid email format`);
    }

    // Validate phone format (support both formats)
    const phoneValue = row.Phone || row.phone;
    if (phoneValue && phoneValue.trim() !== "" && phoneValue.length < 5) {
      errors.push(`Row ${rowNumber}: Phone number is too short`);
    }
  });

  return { isValid: errors.length === 0, errors };
};

export const convertCSVToSuppliers = (csvData) => {
  return csvData.map((row) => {
    // Helper function to get field value with fallback
    const getFieldValue = (fieldName, defaultValue = "") => {
      return row[fieldName] || row[fieldName.toLowerCase()] || defaultValue;
    };

    return {
      name: getFieldValue("Name", "").trim(),
      contactName: getFieldValue("Contact Name", "").trim(),
      email: getFieldValue("Email", "").trim(),
      phone: getFieldValue("Phone", "").trim(),
      address: getFieldValue("Address", "").trim(),
      companyName: getFieldValue("Company Name", "").trim(),
    };
  });
};

export const exportCustomersToCSV = (customers) => {
  const headers = [
    { key: "name", label: "Name" },
    { key: "email", label: "Email" },
    { key: "phone", label: "Phone" },
    { key: "address", label: "Address" },
    { key: "createdAt", label: "Created At" },
  ];
  const csvContent = convertToCSV(customers, headers);
  const filename = generateCSVFilename("customers");
  downloadCSV(csvContent, filename);
};

export const validateCustomerCSV = (data) => {
  const errors = [];
  const requiredFields = ["Name", "Email"];

  if (!data || data.length === 0) {
    return { isValid: false, errors: ["No data found in CSV file"] };
  }

  // Check required fields (support both formats)
  const firstRow = data[0];
  const availableFields = Object.keys(firstRow);

  // Check if required fields exist in either format
  const missingFields = requiredFields.filter((requiredField) => {
    // Check for exact match
    if (availableFields.includes(requiredField)) return false;

    // Check for lowercase version
    const lowercaseField = requiredField.toLowerCase();
    if (availableFields.includes(lowercaseField)) return false;

    return true;
  });

  if (missingFields.length > 0) {
    errors.push(`Missing required fields: ${missingFields.join(", ")}`);
  }

  // Validate data
  data.forEach((row, index) => {
    const rowNumber = index + 2;

    // Check for required fields (support both formats)
    requiredFields.forEach((requiredField) => {
      let fieldValue = null;

      // Try different field name formats
      if (row[requiredField]) {
        fieldValue = row[requiredField];
      } else if (row[requiredField.toLowerCase()]) {
        fieldValue = row[requiredField.toLowerCase()];
      }

      if (!fieldValue || fieldValue.toString().trim() === "") {
        errors.push(`Row ${rowNumber}: ${requiredField} is required`);
      }
    });

    // Validate email format (support both formats)
    const emailValue = row.Email || row.email;
    if (emailValue && !isValidEmail(emailValue)) {
      errors.push(`Row ${rowNumber}: Invalid email format`);
    }

    // Validate phone format (support both formats)
    const phoneValue = row.Phone || row.phone;
    if (phoneValue && phoneValue.trim() !== "" && phoneValue.length < 5) {
      errors.push(`Row ${rowNumber}: Phone number is too short`);
    }
  });

  return { isValid: errors.length === 0, errors };
};

export const convertCSVToCustomers = (csvData) => {
  return csvData.map((row) => {
    // Helper function to get field value with fallback
    const getFieldValue = (fieldName, defaultValue = "") => {
      return row[fieldName] || row[fieldName.toLowerCase()] || defaultValue;
    };

    return {
      name: getFieldValue("Name", "").trim(),
      email: getFieldValue("Email", "").trim(),
      phone: getFieldValue("Phone", "").trim(),
      address: getFieldValue("Address", "").trim(),
    };
  });
};

export const exportPurchasesToCSV = (purchases) => {
  const headers = [
    { key: "id", label: "Purchase Order" },
    { key: "created_at", label: "Date & Time" },
    { key: "supplierName", label: "Supplier" },
    { key: "total_amount", label: "Total Amount" },
    { key: "status", label: "Status" },
  ];
  const data = purchases.map((purchase) => ({
    id: purchase.id,
    created_at: purchase.created_at,
    supplierName: purchase.supplier?.name || purchase.supplier_id,
    total_amount: purchase.total_amount || purchase.totalCost,
    status: purchase.status,
  }));
  const csvContent = convertToCSV(data, headers);
  const filename = generateCSVFilename("purchases");
  downloadCSV(csvContent, filename);
};

// Purchase CSV validation and conversion utilities
export const validatePurchaseCSV = (data) => {
  const errors = [];
  const requiredFields = [
    "Purchase Order",
    "Date & Time",
    "Supplier",
    "Total Amount",
    "Status",
  ];
  if (!data || data.length === 0) {
    return { isValid: false, errors: ["No data found in CSV file"] };
  }
  // Check required fields (support both formats)
  const firstRow = data[0];
  const availableFields = Object.keys(firstRow);
  const missingFields = requiredFields.filter((requiredField) => {
    if (availableFields.includes(requiredField)) return false;
    // Check for import format
    if (
      requiredField === "Purchase Order" &&
      (availableFields.includes("id") ||
        availableFields.includes("poNumber") ||
        availableFields.includes("orderNumber"))
    )
      return false;
    if (
      requiredField === "Date & Time" &&
      (availableFields.includes("created_at") ||
        availableFields.includes("createdAt"))
    )
      return false;
    if (
      requiredField === "Supplier" &&
      (availableFields.includes("supplier") ||
        availableFields.includes("supplierName") ||
        availableFields.includes("supplier_id") ||
        availableFields.includes("supplierId"))
    )
      return false;
    if (
      requiredField === "Total Amount" &&
      (availableFields.includes("total_amount") ||
        availableFields.includes("totalCost"))
    )
      return false;
    if (requiredField === "Status" && availableFields.includes("status"))
      return false;
    return true;
  });
  if (missingFields.length > 0) {
    errors.push(`Missing required fields: ${missingFields.join(", ")}`);
  }
  // Validate data
  data.forEach((row, index) => {
    const rowNumber = index + 2;
    // Check for required fields (support both formats)
    requiredFields.forEach((requiredField) => {
      let fieldValue = null;
      if (row[requiredField]) fieldValue = row[requiredField];
      // Import format fallbacks
      if (!fieldValue) {
        if (requiredField === "Purchase Order")
          fieldValue = row.id || row.poNumber || row.orderNumber;
        if (requiredField === "Date & Time")
          fieldValue = row.created_at || row.createdAt;
        if (requiredField === "Supplier")
          fieldValue =
            row.supplier ||
            row.supplierName ||
            row.supplier_id ||
            row.supplierId;
        if (requiredField === "Total Amount")
          fieldValue = row.total_amount || row.totalCost;
        if (requiredField === "Status") fieldValue = row.status;
      }
      if (!fieldValue || fieldValue.toString().trim() === "") {
        errors.push(`Row ${rowNumber}: ${requiredField} is required`);
      }
    });
    // Validate total amount
    const totalValue = row["Total Amount"] || row.total_amount || row.totalCost;
    if (totalValue && isNaN(parseFloat(totalValue))) {
      errors.push(`Row ${rowNumber}: Total Amount must be a valid number`);
    }
    // Validate status
    const statusValue = row["Status"] || row.status;
    if (
      statusValue &&
      !["pending", "received", "cancelled"].includes(
        String(statusValue).toLowerCase()
      )
    ) {
      errors.push(
        `Row ${rowNumber}: Status must be one of pending, received, cancelled`
      );
    }
  });
  return { isValid: errors.length === 0, errors };
};

export const convertCSVToPurchases = (csvData) => {
  return csvData.map((row) => {
    // Helper function to get field value with fallback
    const getFieldValue = (fieldName, ...fallbacks) => {
      for (const key of [fieldName, ...fallbacks]) {
        if (row[key]) return row[key];
      }
      return "";
    };
    return {
      id: getFieldValue("Purchase Order", "id", "poNumber", "orderNumber"),
      created_at: getFieldValue("Date & Time", "created_at", "createdAt"),
      supplier: { name: getFieldValue("Supplier", "supplier", "supplierName") },
      total_amount: parseFloat(
        getFieldValue("Total Amount", "total_amount", "totalCost")
      ),
      status: String(getFieldValue("Status", "status")).toLowerCase(),
    };
  });
};

export const validateSaleCSV = (data) => {
  const errors = [];
  const requiredFields = [
    "Order Number",
    "Date & Time",
    "Customer",
    "Total Amount",
    "Status",
  ];
  if (!data || data.length === 0) {
    return { isValid: false, errors: ["No data found in CSV file"] };
  }
  // Check required fields (support both formats)
  const firstRow = data[0];
  const availableFields = Object.keys(firstRow);
  const missingFields = requiredFields.filter((requiredField) => {
    if (availableFields.includes(requiredField)) return false;
    // Check for import format
    if (
      requiredField === "Order Number" &&
      (availableFields.includes("id") ||
        availableFields.includes("orderNumber"))
    )
      return false;
    if (
      requiredField === "Date & Time" &&
      (availableFields.includes("created_at") ||
        availableFields.includes("createdAt"))
    )
      return false;
    if (
      requiredField === "Customer" &&
      (availableFields.includes("customer") ||
        availableFields.includes("customerName") ||
        availableFields.includes("customer_id") ||
        availableFields.includes("customerId"))
    )
      return false;
    if (
      requiredField === "Total Amount" &&
      (availableFields.includes("total_amount") ||
        availableFields.includes("totalPrice"))
    )
      return false;
    if (requiredField === "Status" && availableFields.includes("status"))
      return false;
    return true;
  });
  if (missingFields.length > 0) {
    errors.push(`Missing required fields: ${missingFields.join(", ")}`);
  }
  // Validate data
  data.forEach((row, index) => {
    const rowNumber = index + 2;
    // Check for required fields (support both formats)
    requiredFields.forEach((requiredField) => {
      let fieldValue = null;
      if (row[requiredField]) fieldValue = row[requiredField];
      // Import format fallbacks
      if (!fieldValue) {
        if (requiredField === "Order Number")
          fieldValue = row.id || row.orderNumber;
        if (requiredField === "Date & Time")
          fieldValue = row.created_at || row.createdAt;
        if (requiredField === "Customer")
          fieldValue =
            row.customer ||
            row.customerName ||
            row.customer_id ||
            row.customerId;
        if (requiredField === "Total Amount")
          fieldValue = row.total_amount || row.totalPrice;
        if (requiredField === "Status") fieldValue = row.status;
      }
      if (!fieldValue || fieldValue.toString().trim() === "") {
        errors.push(`Row ${rowNumber}: ${requiredField} is required`);
      }
    });
    // Validate total amount
    const totalValue =
      row["Total Amount"] || row.total_amount || row.totalPrice;
    if (totalValue && isNaN(parseFloat(totalValue))) {
      errors.push(`Row ${rowNumber}: Total Amount must be a valid number`);
    }
    // Validate status
    const statusValue = row["Status"] || row.status;
    if (
      statusValue &&
      !["pending", "completed", "cancelled"].includes(
        String(statusValue).toLowerCase()
      )
    ) {
      errors.push(
        `Row ${rowNumber}: Status must be one of pending, completed, cancelled`
      );
    }
  });
  return { isValid: errors.length === 0, errors };
};

export const convertCSVToSales = (csvData) => {
  return csvData.map((row) => {
    // Helper function to get field value with fallback
    const getFieldValue = (fieldName, ...fallbacks) => {
      for (const key of [fieldName, ...fallbacks]) {
        if (row[key]) return row[key];
      }
      return "";
    };
    return {
      id: getFieldValue("Order Number", "id", "orderNumber"),
      created_at: getFieldValue("Date & Time", "created_at", "createdAt"),
      customer: { name: getFieldValue("Customer", "customer", "customerName") },
      total_amount: parseFloat(
        getFieldValue("Total Amount", "total_amount", "totalPrice")
      ),
      status: String(getFieldValue("Status", "status")).toLowerCase(),
    };
  });
};

// User CSV conversion utility
export const convertCSVToUsers = (csvData) => {
  return csvData.map((row) => {
    // Helper to get value from multiple possible field names
    const getField = (...names) => {
      for (const name of names) {
        if (row[name] && row[name].toString().trim() !== "")
          return row[name].toString().trim();
        if (
          row[name.toLowerCase()] &&
          row[name.toLowerCase()].toString().trim() !== ""
        )
          return row[name.toLowerCase()].toString().trim();
      }
      return "";
    };
    return {
      "First Name": getField("First Name", "firstName"),
      "Last Name": getField("Last Name", "lastName"),
      Email: getField("Email", "email"),
      Phone: getField("Phone", "phone"),
      Role: getField("Role", "role"),
      Status: getField("Status", "status"),
      // Employee ID is generated by backend, but allow import if present
      "Employee ID": getField("Employee ID", "employeeId"),
    };
  });
};

// Export sales to CSV
export const exportSalesToCSV = (sales) => {
  const headers = [
    { key: "id", label: "Order Number" },
    { key: "created_at", label: "Date & Time" },
    { key: "customer.name", label: "Customer" },
    { key: "total_amount", label: "Total Amount" },
    { key: "status", label: "Status" },
  ];
  const csvContent = convertToCSV(sales, headers);
  const filename = generateCSVFilename("sales");
  downloadCSV(csvContent, filename);
};
