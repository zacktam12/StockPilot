const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  // Find the staff role
  const staffRole = await prisma.role.findFirst({
    where: { role_type: "staff" },
  });

  if (!staffRole) {
    throw new Error('No "staff" role found in the Role table!');
  }

  // Update all users with email containing "staff" to have the staff role
  const updated = await prisma.user.updateMany({
    where: {
      email: { contains: "staff" }, // Adjust this if your staff emails are different
    },
    data: {
      roleId: staffRole.id,
      isAdmin: false,
      status: "Active",
    },
  });

  console.log(
    `Updated ${updated.count} staff user(s) to have the correct staff role.`
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
