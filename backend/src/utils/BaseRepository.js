class BaseRepository {
  constructor(model) {
    this.model = model;
  }

  async findMany({ where = {}, include, skip, take, ...rest } = {}) {
    return this.model.findMany({
      where: { isDeleted: false, ...where },
      include,
      skip,
      take,
      ...rest,
    });
  }

  async findManyWithPagination(
    where = {},
    page = 1,
    limit = 10,
    include = {},
    orderBy = {}
  ) {
    // Ensure page and limit are numbers
    page = Number(page) || 1;
    limit = Number(limit) || 10;

    const skip = (page - 1) * limit;
    const mergedWhere = { isDeleted: false, ...where };
    const [data, total] = await Promise.all([
      this.model.findMany({
        where: mergedWhere,
        include,
        skip,
        take: limit,
        orderBy,
      }),
      this.model.count({ where: mergedWhere }),
    ]);
    return {
      data,
      total,
      page,
      pageCount: Math.ceil(total / limit),
    };
  }

  findUnique(where, include) {
    if (where?.id) {
      where.id = String(where.id); // convert id to string
    }
    return this.model.findUnique({
      where: { isDeleted: false, ...where },
      include,
    });
  }

  create(data) {
    return this.model.create({ data });
  }

  update(where, data) {
    return this.model.update({ where, data });
  }

  softDelete(where) {
    return this.model.update({
      where,
      data: { isDeleted: true },
    });
  }

  async paginate({
    page = 1,
    pageSize = 10,
    where = {},
    orderBy = { id: "desc" },
    include = {},
  }) {
    // Ensure page and pageSize are numbers
    page = Number(page) || 1;
    pageSize = Number(pageSize) || 10;

    const skip = (page - 1) * pageSize;
    const mergedWhere = { isDeleted: false, ...where };

    const [data, total] = await Promise.all([
      this.model.findMany({
        where: mergedWhere,
        skip,
        take: pageSize,
        orderBy,
        include,
      }),
      this.model.count({ where: mergedWhere }),
    ]);

    return {
      data,
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
    };
  }
}

module.exports = BaseRepository;
