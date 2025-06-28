const { prisma } = require("../config/db");
const BaseRepository = require("../utils/BaseRepository");

class SupplierRepository extends BaseRepository {
  constructor() {
    super(prisma.supplier);
  }

  async findActiveSuppliers(search = "") {
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
    return this.findMany({ where, orderBy: { createdAt: "desc" } });
  }

  async findById(id) {
    return this.findUnique({ id });
  }

  async createSupplier(data) {
    return this.create(data);
  }

  async updateSupplier(id, data) {
    return this.update({ id }, data);
  }

  async softDeleteSupplier(id) {
    return this.update({ id }, { isDeleted: true });
  }
}

module.exports = new SupplierRepository();
