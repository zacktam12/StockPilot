const BaseRepository = require("../utils/BaseRepository");

class UserRepository extends BaseRepository {
  constructor(prisma) {
    super(prisma.user);
  }

  async findByEmail(email) {
    return await this.findUnique(
      { email, isDeleted: false },
      {
        role: true,
      }
    );
  }

  async findActiveUsers(page = 1, limit = 10, search = "") {
    const where = {
      isDeleted: false,
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
        isDeleted: false,
      },
      include: {
        role: true,
      },
    });
  }

  async createUser(userData) {
    return await this.create(userData, {
      role: true,
    });
  }

  async updateUser(id, userData) {
    return await this.update({ id }, userData, {
      role: true,
    });
  }

  async findCustomers() {
    return await this.findMany({
      where: {
        isDeleted: false,
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
        isDeleted: false,
        role: {
          role_type: "supplier",
        },
      },
      include: {
        role: true,
      },
    });
  }
}

module.exports = new UserRepository();
