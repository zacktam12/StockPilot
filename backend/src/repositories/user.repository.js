const BaseRepository = require("../utils/BaseRepository");
const { prisma } = require("../config/db");

class UserRepository extends BaseRepository {
  constructor() {
    super(prisma.user);
  }

  async findByEmail(email) {
    return await this.model.findFirst({
      where: { email, status: "Active" },
      include: { role: true },
    });
  }

  async findActiveUsers(page = 1, limit = 10, search = "") {
    const where = {
      status: "Active",
      ...(search && {
        OR: [
          { firstName: { contains: search } },
          { lastName: { contains: search } },
          { email: { contains: search } },
        ],
      }),
    };

    return await this.findManyWithPagination(
      where,
      page,
      limit,
      { role: true },
      { createdAt: "desc" }
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
    return await this.create(userData, {
      role: true,
    });
  }

  async updateUser(id, userData) {
    return await this.update({ id: String(id) }, userData, {
      role: true,
    });
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
  async softDeleteUser(id) {
    return await this.update({ id: String(id) }, { status: "Deactivated" });
  }
}

module.exports = new UserRepository();
