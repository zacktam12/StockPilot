const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// Function to generate order number (same as in sale.service.js)
const generateOrderNumber = async (saleDate) => {
  const dateStr =
    saleDate.getFullYear().toString() +
    (saleDate.getMonth() + 1).toString().padStart(2, "0") +
    saleDate.getDate().toString().padStart(2, "0");

  // Get the count of sales for that date
  const startOfDay = new Date(
    saleDate.getFullYear(),
    saleDate.getMonth(),
    saleDate.getDate()
  );
  const endOfDay = new Date(
    saleDate.getFullYear(),
    saleDate.getMonth(),
    saleDate.getDate() + 1
  );

  const todaySalesCount = await prisma.sale.count({
    where: {
      createdAt: {
        gte: startOfDay,
        lt: endOfDay,
      },
    },
  });

  // Generate order number: SO-YYYYMMDD-XXXX (SO = Sales Order)
  let orderNumber = `SO-${dateStr}-${(todaySalesCount + 1)
    .toString()
    .padStart(4, "0")}`;

  // Check if this order number already exists
  let counter = 1;
  while (await prisma.sale.findUnique({ where: { orderNumber } })) {
    orderNumber = `SO-${dateStr}-${(todaySalesCount + 1 + counter)
      .toString()
      .padStart(4, "0")}`;
    counter++;
  }

  return orderNumber;
};

async function generateOrderNumbersForExistingSales() {
  try {
    console.log("Starting to generate order numbers for existing sales...");

    // Get all sales without order numbers
    const salesWithoutOrderNumbers = await prisma.sale.findMany({
      where: {
        orderNumber: null,
        isDeleted: false,
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    console.log(
      `Found ${salesWithoutOrderNumbers.length} sales without order numbers`
    );

    if (salesWithoutOrderNumbers.length === 0) {
      console.log("No sales found without order numbers. Exiting...");
      return;
    }

    // Group sales by date to maintain proper numbering
    const salesByDate = {};
    salesWithoutOrderNumbers.forEach((sale) => {
      const dateKey = sale.createdAt.toISOString().split("T")[0];
      if (!salesByDate[dateKey]) {
        salesByDate[dateKey] = [];
      }
      salesByDate[dateKey].push(sale);
    });

    let updatedCount = 0;

    // Process each date group
    for (const [dateKey, sales] of Object.entries(salesByDate)) {
      console.log(`Processing sales for date: ${dateKey}`);

      for (let i = 0; i < sales.length; i++) {
        const sale = sales[i];

        // Generate order number based on the sale's creation date
        const orderNumber = await generateOrderNumber(sale.createdAt);

        // Update the sale with the order number
        await prisma.sale.update({
          where: { id: sale.id },
          data: { orderNumber },
        });

        console.log(
          `Updated sale ${sale.id} with order number: ${orderNumber}`
        );
        updatedCount++;
      }
    }

    console.log(
      `Successfully updated ${updatedCount} sales with order numbers`
    );
  } catch (error) {
    console.error("Error generating order numbers:", error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
generateOrderNumbersForExistingSales();
