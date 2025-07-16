const { PrismaClient } = require("@prisma/client");
const { generateProductIdentifiers } = require("./src/utils/generators");

const prisma = new PrismaClient();

async function generateIdentifiersForExistingProducts() {
  try {
    console.log("Starting to generate identifiers for existing products...");

    // Get all products without SKU or barcode
    const productsWithoutIdentifiers = await prisma.product.findMany({
      where: {
        isDeleted: false,
        OR: [{ sku: null }, { sku: "" }, { barcode: null }, { barcode: "" }],
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    console.log(
      `Found ${productsWithoutIdentifiers.length} products without identifiers`
    );

    if (productsWithoutIdentifiers.length === 0) {
      console.log("No products found without identifiers. Exiting...");
      return;
    }

    let updatedCount = 0;

    for (const product of productsWithoutIdentifiers) {
      console.log(`Processing product: ${product.name} (ID: ${product.id})`);

      const updateData = {};

      // Generate SKU if missing
      if (!product.sku || product.sku.trim() === "") {
        const { sku } = await generateProductIdentifiers(product.name);
        updateData.sku = sku;
        console.log(`  Generated SKU: ${sku}`);
      }

      // Generate barcode if missing
      if (!product.barcode || product.barcode.trim() === "") {
        const { barcode } = await generateProductIdentifiers(product.name);
        updateData.barcode = barcode;
        console.log(`  Generated barcode: ${barcode}`);
      }

      // Update the product if we have data to update
      if (Object.keys(updateData).length > 0) {
        await prisma.product.update({
          where: { id: product.id },
          data: updateData,
        });

        console.log(`  Updated product ${product.id}`);
        updatedCount++;
      }
    }

    console.log(
      `Successfully updated ${updatedCount} products with identifiers`
    );
  } catch (error) {
    console.error("Error generating identifiers:", error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
generateIdentifiersForExistingProducts();
