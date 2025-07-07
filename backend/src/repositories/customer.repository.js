const BaseRepository = require("../utils/BaseRepository");
const { prisma } = require("../config/db");

class CustomerRepository extends BaseRepository {
  constructor() {
    super(prisma.customer);
  }

  async findCustomers(
    page = 1,
    limit = 5,
    search = "",
    sortField = "createdAt",
    sortOrder = "desc"
  ) {
    const where = {
      ...(search && {
        OR: [
          { name: { contains: search } },
          { email: { contains: search } },
          { phone: { contains: search } },
          { address: { contains: search } },
        ],
      }),
    };

    const orderBy = {};
    if (sortField && sortOrder) {
      orderBy[sortField] = sortOrder.toLowerCase();
    } else {
      orderBy.createdAt = "desc";
    }

    return this.findManyWithPagination(where, page, limit, {}, orderBy);
  }
}

module.exports = new CustomerRepository();
