const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

exports.getAllSuppliers = async (
  page = 1,
  limit = 10,
  search = "",
  sortField = "",
  sortOrder = ""
) => {
  const where = {
    isDeleted: false,
    ...(search && {
      OR: [
        { name: { contains: search, mode: "insensitive" } },
        { contactName: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { phone: { contains: search, mode: "insensitive" } },
        { address: { contains: search, mode: "insensitive" } },
        { companyName: { contains: search, mode: "insensitive" } },
      ],
    }),
  };

  // Calculate pagination
  const skip = (page - 1) * limit;

  // Build orderBy object
  const orderBy = {};
  if (sortField && sortOrder) {
    orderBy[sortField] = sortOrder.toLowerCase();
  } else {
    orderBy.createdAt = "desc";
  }

  // Get total count for pagination
  const totalItems = await prisma.supplier.count({ where });
  const totalPages = Math.ceil(totalItems / limit);

  // Get paginated data
  const data = await prisma.supplier.findMany({
    where,
    orderBy,
    skip,
    take: limit,
  });

  return {
    success: true,
    data: data || [],
    pagination: {
      currentPage: page,
      totalPages,
      totalItems,
      itemsPerPage: limit,
    },
  };
};

exports.getSupplierById = async (id) => {
  // Always return null if not found, never undefined
  return (
    (await prisma.supplier.findUnique({
      where: { id },
    })) || null
  );
};

exports.createSupplier = async (data) => {
  const { name, contactName, email, phone, address, companyName } = data;
  return prisma.supplier.create({
    data: { name, contactName, email, phone, address, companyName },
  });
};

exports.updateSupplier = async (id, data) => {
  const { name, contactName, email, phone, address, companyName } = data;
  return prisma.supplier.update({
    where: { id },
    data: { name, contactName, email, phone, address, companyName },
  });
};

exports.deleteSupplier = async (id) => {
  return prisma.supplier.update({
    where: { id },
    data: { isDeleted: true },
  });
};

// Bulk operations
exports.bulkDeleteSuppliers = async (ids) => {
  return prisma.supplier.updateMany({
    where: { id: { in: ids } },
    data: { isDeleted: true },
  });
};

exports.bulkUpdateSuppliers = async (ids, data) => {
  return prisma.supplier.updateMany({
    where: { id: { in: ids } },
    data,
  });
};

// Import suppliers from array
exports.importSuppliers = async (suppliers) => {
  const validSuppliers = suppliers.map((supplier) => ({
    name: supplier.name || supplier.Name,
    contactName: supplier.contactName || supplier["Contact Name"] || null,
    email: supplier.email || supplier.Email || null,
    phone: supplier.phone || supplier.Phone || null,
    address: supplier.address || supplier.Address || null,
    companyName: supplier.companyName || supplier["Company Name"] || null,
  }));

  return prisma.supplier.createMany({
    data: validSuppliers,
    skipDuplicates: true, // Skip if email already exists
  });
};

// Get suppliers for export
exports.getSuppliersForExport = async (search = "") => {
  const where = {
    isDeleted: false,
    ...(search && {
      OR: [
        { name: { contains: search, mode: "insensitive" } },
        { contactName: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { phone: { contains: search, mode: "insensitive" } },
        { address: { contains: search, mode: "insensitive" } },
        { companyName: { contains: search, mode: "insensitive" } },
      ],
    }),
  };

  return prisma.supplier.findMany({
    where,
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      contactName: true,
      email: true,
      phone: true,
      address: true,
      companyName: true,
      createdAt: true,
      updatedAt: true,
    },
  });
};
