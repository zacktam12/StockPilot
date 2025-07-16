const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function generateNotificationsForExistingActivities() {
  try {
    console.log("🔔 Generating notifications for existing activities...");

    // Get all users
    const users = await prisma.user.findMany({
      where: { status: "Active" },
      select: { id: true, firstName: true, lastName: true },
    });

    if (users.length === 0) {
      console.log("❌ No active users found");
      return;
    }

    console.log(`✅ Found ${users.length} active users`);

    // Get existing activities
    const sales = await prisma.sale.findMany({
      select: {
        id: true,
        orderNumber: true,
        totalPrice: true,
        createdAt: true,
        userId: true,
      },
    });

    const purchases = await prisma.purchase.findMany({
      select: {
        id: true,
        poNumber: true,
        totalCost: true,
        createdAt: true,
        userId: true,
      },
    });

    const products = await prisma.product.findMany({
      select: { id: true, name: true, quantity: true, minStock: true },
    });

    console.log(
      `📊 Found ${sales.length} sales, ${purchases.length} purchases, ${products.length} products`
    );

    // Generate notifications for each user
    for (const user of users) {
      console.log(
        `\n👤 Generating notifications for user: ${user.firstName} ${user.lastName}`
      );

      // Create notifications for recent sales (last 30 days)
      const recentSales = sales.filter(
        (sale) =>
          sale.userId === user.id &&
          new Date(sale.createdAt) >
            new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      );

      for (const sale of recentSales.slice(0, 5)) {
        // Limit to 5 recent sales
        await prisma.notification.create({
          data: {
            userId: user.id,
            type: "SALE",
            title: "Sale Completed",
            message: `Sale #${
              sale.orderNumber || sale.id.slice(0, 8)
            } completed for $${sale.totalPrice.toFixed(2)}`,
            data: {
              saleId: sale.id,
              orderNumber: sale.orderNumber,
              amount: sale.totalPrice,
            },
          },
        });
      }

      // Create notifications for recent purchases (last 30 days)
      const recentPurchases = purchases.filter(
        (purchase) =>
          purchase.userId === user.id &&
          new Date(purchase.createdAt) >
            new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      );

      for (const purchase of recentPurchases.slice(0, 5)) {
        // Limit to 5 recent purchases
        await prisma.notification.create({
          data: {
            userId: user.id,
            type: "PURCHASE",
            title: "Purchase Received",
            message: `Purchase #${
              purchase.poNumber || purchase.id.slice(0, 8)
            } received for $${purchase.totalCost.toFixed(2)}`,
            data: {
              purchaseId: purchase.id,
              poNumber: purchase.poNumber,
              amount: purchase.totalCost,
            },
          },
        });
      }

      // Create low stock notifications
      const lowStockProducts = products.filter(
        (product) => product.quantity <= (product.minStock || 5)
      );

      for (const product of lowStockProducts.slice(0, 3)) {
        // Limit to 3 low stock products
        await prisma.notification.create({
          data: {
            userId: user.id,
            type: "LOW_STOCK",
            title: "Low Stock Alert",
            message: `${product.name} is running low (${product.quantity} remaining)`,
            data: {
              productId: product.id,
              productName: product.name,
              currentStock: product.quantity,
              minStock: product.minStock || 5,
            },
          },
        });
      }

      // Create some system notifications
      await prisma.notification.create({
        data: {
          userId: user.id,
          type: "SYSTEM",
          title: "Welcome to StockPilot",
          message: "Your inventory management system is ready to use!",
          data: { type: "welcome" },
        },
      });

      await prisma.notification.create({
        data: {
          userId: user.id,
          type: "SYSTEM",
          title: "System Update",
          message: "Notification system has been enabled for better tracking",
          data: { type: "system_update" },
        },
      });
    }

    // Count total notifications created
    const totalNotifications = await prisma.notification.count();
    const unreadNotifications = await prisma.notification.count({
      where: { read: false },
    });

    console.log(`\n🎉 Successfully generated notifications!`);
    console.log(`📊 Total notifications: ${totalNotifications}`);
    console.log(`📊 Unread notifications: ${unreadNotifications}`);

    // Show notifications for first user
    const firstUser = users[0];
    const userNotifications = await prisma.notification.findMany({
      where: { userId: firstUser.id },
      orderBy: { createdAt: "desc" },
      take: 5,
    });

    console.log(`\n📋 Sample notifications for ${firstUser.firstName}:`);
    userNotifications.forEach((notification, index) => {
      console.log(
        `${index + 1}. [${notification.type}] ${notification.title}: ${
          notification.message
        }`
      );
    });
  } catch (error) {
    console.error("❌ Error generating notifications:", error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
generateNotificationsForExistingActivities();
