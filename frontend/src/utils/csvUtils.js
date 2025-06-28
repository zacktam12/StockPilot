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
