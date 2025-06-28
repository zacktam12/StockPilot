const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

exports.getAllSuppliers = async (search = "") => {
  const where = {
    isDeleted: false,
    ...(search && {
      OR: [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { phone: { contains: search, mode: "insensitive" } },
        { address: { contains: search, mode: "insensitive" } },
      ],
    }),
  };
  // Always return an array, never undefined
  return (
    (await prisma.supplier.findMany({
      where,
      orderBy: { createdAt: "desc" },
    })) || []
  );
};

exports.getSupplierById = async (id) => {
  // Always return null if not found, never undefined
  return (await prisma.supplier.findUnique({
    where: { id },
  })) || null;
};

exports.createSupplier = async (data) => {
  const { name, email, phone, address } = data;
  return prisma.supplier.create({
    data: { name, email, phone, address },
  });
};

exports.updateSupplier = async (id, data) => {
  const { name, email, phone, address } = data;
  return prisma.supplier.update({
    where: { id },
    data: { name, email, phone, address },
  });
};

exports.deleteSupplier = async (id) => {
  return prisma.supplier.update({
    where: { id },
    data: { isDeleted: true },
  });
};
