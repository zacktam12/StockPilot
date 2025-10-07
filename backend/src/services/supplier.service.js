const { PrismaClient } = require("@prisma/client");
const cacheService = require("./cache.service");
const prisma = new PrismaClient();

exports.getAllSuppliers = async (
  page = 1,
  limit = 10,
  search = "",
  sortField = "",
  sortOrder = "",
  hasPhone = false,
  hasAddress = false,
  hasEmail = false,
  hasCompany = false
) => {
  const where = {
    isDeleted: false,
  };

  // Add search condition
  if (search) {
    where.OR = [
      { name: { contains: search } },
      { contactName: { contains: search } },
      { email: { contains: search } },
      { phone: { contains: search } },
      { address: { contains: search } },
      { companyName: { contains: search } },
    ];
  }

  // Apply filters (filter out null and empty strings)
  // Build AND conditions for filters
  const filterConditions = [];
  
  if (hasPhone === 'true' || hasPhone === true) {
    filterConditions.push({
      AND: [
        { phone: { not: null } },
        { phone: { not: "" } }
      ]
    });
  }
  if (hasAddress === 'true' || hasAddress === true) {
    filterConditions.push({
      AND: [
        { address: { not: null } },
        { address: { not: "" } }
      ]
    });
  }
  if (hasEmail === 'true' || hasEmail === true) {
    filterConditions.push({
      AND: [
        { email: { not: null } },
        { email: { not: "" } }
      ]
    });
  }
  if (hasCompany === 'true' || hasCompany === true) {
    filterConditions.push({
      AND: [
        { companyName: { not: null } },
        { companyName: { not: "" } }
      ]
    });
  }

  // Add filter conditions to where clause if any exist
  if (filterConditions.length > 0) {
    if (where.AND) {
      where.AND = [...where.AND, ...filterConditions];
    } else {
      where.AND = filterConditions;
    }
  }

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

  const result = {
    suppliers: data || [],
    total: totalItems,
    pagination: {
      page,
      limit,
      totalItems,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    },
  };

  // Cache the result for 5 minutes
  const cacheKey = cacheService.generateKey(
    'suppliers',
    page.toString(),
    limit.toString(),
    search,
    sortField,
    sortOrder,
    hasPhone.toString(),
    hasAddress.toString(),
    hasEmail.toString(),
    hasCompany.toString()
  );
  await cacheService.set(cacheKey, result, 300);

  return result;
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
  const supplier = await prisma.supplier.create({
    data: { name, contactName, email, phone, address, companyName },
  });
  
  // Invalidate cache
  await cacheService.deletePattern('suppliers:*');
  
  return supplier;
};

exports.updateSupplier = async (id, data) => {
  const { name, contactName, email, phone, address, companyName } = data;
  const supplier = await prisma.supplier.update({
    where: { id },
    data: { name, contactName, email, phone, address, companyName },
  });
  
  // Invalidate cache
  await cacheService.deletePattern('suppliers:*');
  
  return supplier;
};

exports.deleteSupplier = async (id) => {
  const supplier = await prisma.supplier.update({
    where: { id },
    data: { isDeleted: true },
  });
  
  // Invalidate cache
  await cacheService.deletePattern('suppliers:*');
  
  return supplier;
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

// Import suppliers from array with validation and error handling
exports.importSuppliers = async (suppliers) => {
  try {
    const results = [];
    const errors = [];

    for (let i = 0; i < suppliers.length; i++) {
      try {
        const supplier = suppliers[i];

        // Map CSV fields to supplier data format
        const mappedSupplier = {
          name: supplier.name || supplier.Name || "",
          contactName: supplier.contactName || supplier["Contact Name"] || "",
          email: supplier.email || supplier.Email || "",
          phone: supplier.phone || supplier.Phone || "",
          address: supplier.address || supplier.Address || "",
          companyName: supplier.companyName || supplier["Company Name"] || "",
        };

        // Validate required fields
        if (!mappedSupplier.name || mappedSupplier.name.trim() === "") {
          throw new Error("Name is required");
        }

        // Validate email format if provided
        if (mappedSupplier.email && mappedSupplier.email.trim() !== "") {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(mappedSupplier.email)) {
            throw new Error("Invalid email format");
          }
        }

        // Validate phone format if provided
        if (
          mappedSupplier.phone &&
          mappedSupplier.phone.trim() !== "" &&
          mappedSupplier.phone.length < 5
        ) {
          throw new Error("Phone number is too short");
        }

        const result = await this.createSupplier(mappedSupplier);
        results.push(result);
      } catch (error) {
        errors.push({
          index: i,
          supplier: suppliers[i],
          error: error.message,
        });
      }
    }

    return {
      success: true,
      data: results,
      importedCount: results.length,
      errorCount: errors.length,
      errors: errors,
    };
  } catch (error) {
    throw new Error(`Failed to bulk import suppliers: ${error.message}`);
  }
};

// Get suppliers for export
exports.getSuppliersForExport = async (search = "") => {
  const where = {
    isDeleted: false,
    ...(search && {
      OR: [
        { name: { contains: search } },
        { contactName: { contains: search } },
        { email: { contains: search } },
        { phone: { contains: search } },
        { address: { contains: search } },
        { companyName: { contains: search } },
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
