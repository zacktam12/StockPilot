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

  findUnique(where, include) {
    return this.model.findUnique({ where, include });
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
    const skip = (page - 1) * pageSize;

    const [data, total] = await Promise.all([
      this.model.findMany({
        where: { isDeleted: false, ...where },
        skip,
        take: pageSize,
        orderBy,
        include,
      }),
      this.model.count({ where: { isDeleted: false, ...where } }),
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
