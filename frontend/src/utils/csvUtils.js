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

// Validate CSV data structure
export const validateCSVData = (data, requiredFields = []) => {
  const errors = [];

  if (!data || data.length === 0) {
    errors.push("No data found in CSV file");
    return errors;
  }

  // Check required fields
  const firstRow = data[0];
  const missingFields = requiredFields.filter((field) => !(field in firstRow));

  if (missingFields.length > 0) {
    errors.push(`Missing required fields: ${missingFields.join(", ")}`);
  }

  // Validate data types and required values
  data.forEach((row, index) => {
    const rowNumber = index + 2; // +2 because we start from row 2 (after header)

    // Check for required fields
    requiredFields.forEach((field) => {
      if (!row[field] || row[field].trim() === "") {
        errors.push(`Row ${rowNumber}: ${field} is required`);
      }
    });

    // Validate numeric fields
    if (row.price && isNaN(parseFloat(row.price))) {
      errors.push(`Row ${rowNumber}: Price must be a valid number`);
    }

    if (row.cost && isNaN(parseFloat(row.cost))) {
      errors.push(`Row ${rowNumber}: Cost must be a valid number`);
    }

    if (row.quantity && isNaN(parseInt(row.quantity))) {
      errors.push(`Row ${rowNumber}: Quantity must be a valid integer`);
    }

    if (row.minStock && isNaN(parseInt(row.minStock))) {
      errors.push(`Row ${rowNumber}: Min Stock must be a valid integer`);
    }

    if (row.maxStock && isNaN(parseInt(row.maxStock))) {
      errors.push(`Row ${rowNumber}: Max Stock must be a valid integer`);
    }
  });

  return errors;
};

// Convert CSV data to product format
export const convertCSVToProducts = (csvData) => {
  return csvData.map((row) => ({
    name: row.name?.trim() || "",
    description: row.description?.trim() || "",
    sku: row.sku?.trim() || "",
    barcode: row.barcode?.trim() || "",
    price: row.price ? parseFloat(row.price) : 0,
    cost: row.cost ? parseFloat(row.cost) : null,
    quantity: row.quantity ? parseInt(row.quantity) : 0,
    minStock: row.minStock ? parseInt(row.minStock) : null,
    maxStock: row.maxStock ? parseInt(row.maxStock) : null,
    categoryId: row.categoryId ? parseInt(row.categoryId) : null,
    image_url: row.image_url?.trim() || "",
  }));
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

// Required fields for CSV import
export const REQUIRED_CSV_FIELDS = ["name", "price"];

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

    // Validate email format if provided
    if (row.Email && !isValidEmail(row.Email)) {
      errors.push(`Row ${rowNumber}: Invalid email format`);
    }

    // Validate phone format if provided (basic validation)
    if (row.Phone && row.Phone.trim() !== "" && row.Phone.length < 5) {
      errors.push(`Row ${rowNumber}: Phone number is too short`);
    }
  });

  return { isValid: errors.length === 0, errors };
};

export const convertCSVToSuppliers = (csvData) => {
  return csvData.map((row) => ({
    name: row.Name?.trim() || "",
    contactName: row["Contact Name"]?.trim() || "",
    email: row.Email?.trim() || "",
    phone: row.Phone?.trim() || "",
    address: row.Address?.trim() || "",
    companyName: row["Company Name"]?.trim() || "",
  }));
};
