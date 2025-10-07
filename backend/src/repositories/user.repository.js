const BaseRepository = require("../utils/BaseRepository");
const { prisma } = require("../config/db");

class UserRepository extends BaseRepository {
  constructor() {
    super(prisma.user);
  }

  async findByEmail(email) {
    return await this.model.findFirst({
      where: { 
        email: email.toLowerCase().trim(), 
        status: "Active" 
      },
      include: { role: true },
    });
  }

  async findActiveUsers(
    page = 1,
    limit = 5,
    search = "",
    status = "",
    roleId = "",
    sortField = "createdAt",
    sortOrder = "desc"
  ) {
    const where = {
      // Show all users including deactivated ones
      ...(search && {
        OR: [
          { firstName: { contains: search } },
          { lastName: { contains: search } },
          { email: { contains: search } },
        ],
      }),
      ...(status && { status }),
      ...(roleId && { roleId }),
    };

    // Build orderBy object
    let orderBy = { createdAt: "desc" };
    if (sortField && sortOrder) {
      orderBy = { [sortField]: sortOrder };
    }

    return await this.findManyWithPagination(
      where,
      page,
      limit,
      { role: true },
      orderBy
    );
  }

  async findByRole(roleId) {
    return await this.findMany({
      where: {
        roleId,
        status: "Active",
      },
      include: {
        role: true,
      },
    });
  }

  async createUser(userData) {
    // Ensure status is set to Active if not provided
    if (!userData.status) userData.status = "Active";
    return await this.create(userData);
  }

  async updateUser(id, userData) {
    
    try {
      const result = await this.update({ id: String(id) }, userData);
      return result;
    } catch (error) {
      throw error;
    }
  }

  async findCustomers() {
    return await this.findMany({
      where: {
        status: "Active",
        role: {
          role_type: "customer",
        },
      },
      include: {
        role: true,
      },
    });
  }

  async findSuppliers() {
    return await this.findMany({
      where: {
        status: "Active",
        role: {
          role_type: "supplier",
        },
      },
      include: {
        role: true,
      },
    });
  }

  // Soft delete: set status to Deactivated
  async softDeleteUser(id, deactivatedBy = null) {
    return await this.update(
      { id: String(id) }, 
      { 
        status: "Deactivated",
        deactivatedAt: new Date(),
        deactivatedBy: deactivatedBy
      }
    );
  }

  // Find role by name
  async findRoleByName(roleName) {
    return await prisma.role.findFirst({
      where: {
        role_type: {
          equals: roleName,
        },
      },
    });
  }
}

module.exports = new UserRepository();
