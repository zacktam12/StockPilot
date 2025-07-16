const { PrismaClient } = require("@prisma/client");

async function checkProfilePictureField() {
  const prisma = new PrismaClient();

  try {
    console.log("Checking if profilePicture field exists in User table...");

    // Try to query a user with profilePicture field
    const user = await prisma.user.findFirst({
      select: {
        id: true,
        email: true,
        profilePicture: true,
      },
    });

    console.log("✅ profilePicture field exists in the database");
    console.log("Sample user data:", user);
  } catch (error) {
    console.error("❌ Error accessing profilePicture field:", error.message);

    if (
      error.message.includes("Unknown column") ||
      error.message.includes("profilePicture")
    ) {
      console.log("The profilePicture field does not exist in the database.");
      console.log("You need to run a database migration to add this field.");
      console.log("Run: npx prisma migrate dev --name add-profile-picture");
    }
  } finally {
    await prisma.$disconnect();
  }
}

checkProfilePictureField();
