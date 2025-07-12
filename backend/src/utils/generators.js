const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// Generate a unique SKU based on product name and timestamp
const generateSKU = async (productName) => {
  // Clean the product name: remove special chars, convert to uppercase, limit length
  const cleanName = productName
    .replace(/[^a-zA-Z0-9]/g, "")
    .toUpperCase()
    .substring(0, 6);

  // Get current timestamp components
  const now = new Date();
  const year = now.getFullYear().toString().slice(-2); // Last 2 digits
  const month = (now.getMonth() + 1).toString().padStart(2, "0");
  const day = now.getDate().toString().padStart(2, "0");
  const hour = now.getHours().toString().padStart(2, "0");
  const minute = now.getMinutes().toString().padStart(2, "0");
  const second = now.getSeconds().toString().padStart(2, "0");

  // Generate base SKU: NAME-YYMMDD-HHMMSS
  let sku = `${cleanName}-${year}${month}${day}-${hour}${minute}${second}`;

  // Check if SKU already exists and generate a unique one
  let counter = 1;
  while (await prisma.product.findUnique({ where: { sku } })) {
    sku = `${cleanName}-${year}${month}${day}-${hour}${minute}${second}-${counter
      .toString()
      .padStart(2, "0")}`;
    counter++;
  }

  return sku;
};

// Generate a unique barcode (EAN-13 format)
const generateBarcode = async () => {
  // Generate a 12-digit base number
  const baseNumber = Math.floor(Math.random() * 900000000000) + 100000000000; // 12 digits

  // Calculate EAN-13 check digit
  const digits = baseNumber.toString().split("").map(Number);
  let sum = 0;

  for (let i = 0; i < 12; i++) {
    sum += digits[i] * (i % 2 === 0 ? 1 : 3);
  }

  const checkDigit = (10 - (sum % 10)) % 10;
  const barcode = baseNumber.toString() + checkDigit.toString();

  // Check if barcode already exists and generate a unique one
  let counter = 1;
  let finalBarcode = barcode;
  while (
    await prisma.product.findUnique({ where: { barcode: finalBarcode } })
  ) {
    // Generate a new base number if collision occurs
    const newBaseNumber =
      Math.floor(Math.random() * 900000000000) + 100000000000;
    const newDigits = newBaseNumber.toString().split("").map(Number);
    let newSum = 0;

    for (let i = 0; i < 12; i++) {
      newSum += newDigits[i] * (i % 2 === 0 ? 1 : 3);
    }

    const newCheckDigit = (10 - (newSum % 10)) % 10;
    finalBarcode = newBaseNumber.toString() + newCheckDigit.toString();
  }

  return finalBarcode;
};

// Generate both SKU and barcode for a product
const generateProductIdentifiers = async (productName) => {
  const [sku, barcode] = await Promise.all([
    generateSKU(productName),
    generateBarcode(),
  ]);

  return { sku, barcode };
};

module.exports = {
  generateSKU,
  generateBarcode,
  generateProductIdentifiers,
};
