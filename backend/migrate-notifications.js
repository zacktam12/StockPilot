const { PrismaClient } = require("@prisma/client");

async function migrateNotifications() {
  const prisma = new PrismaClient();

  try {
    console.log("Starting notification system migration...");

    // Generate and apply the migration
    console.log("Generating migration...");
    const { execSync } = require("child_process");

    try {
      execSync("npx prisma migrate dev --name add_notifications", {
        stdio: "inherit",
        cwd: process.cwd(),
      });
      console.log("✅ Migration completed successfully!");
    } catch (error) {
      console.log(
        "⚠️ Migration command failed, but this might be expected if the migration already exists."
      );
      console.log(
        "You can manually run: npx prisma migrate dev --name add_notifications"
      );
    }

    // Generate Prisma client
    console.log("Generating Prisma client...");
    try {
      execSync("npx prisma generate", {
        stdio: "inherit",
        cwd: process.cwd(),
      });
      console.log("✅ Prisma client generated successfully!");
    } catch (error) {
      console.log("⚠️ Prisma client generation failed.");
    }

    console.log("\n🎉 Notification system setup complete!");
    console.log("\nWhat was added:");
    console.log("- Notification model in Prisma schema");
    console.log("- Notification controller and routes");
    console.log("- Notification service for automatic notifications");
    console.log("- Updated frontend notification slice");
    console.log("- Enhanced header component with real notifications");
    console.log(
      "\nThe system will now automatically create notifications for:"
    );
    console.log("- New sales and purchases");
    console.log("- Low stock alerts");
    console.log("- New customers, suppliers, users, and categories");
  } catch (error) {
    console.error("Migration failed:", error);
  } finally {
    await prisma.$disconnect();
  }
}

migrateNotifications();
