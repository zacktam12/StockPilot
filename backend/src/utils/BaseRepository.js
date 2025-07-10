class BaseRepository {
  constructor(model) {
    this.model = model;
  }

  // Helper method to check if model has isDeleted field
  hasIsDeletedField() {
    // Check if the model has isDeleted field by looking at the schema
    // For now, we'll check based on model name or add a flag
    const modelsWithIsDeleted = [
      "Product",
      "Category",
      "Supplier",
      "Sale",
      "Purchase",
    ];
    return modelsWithIsDeleted.includes(this.model.name);
  }

  // Helper method to build where clause
  buildWhereClause(where = {}) {
    if (this.hasIsDeletedField()) {
      return { isDeleted: false, ...where };
    }
    return where;
  }

  // Helper to extract unique fields (e.g., id)
  extractUniqueWhere(where) {
    // Prisma's update/findUnique expects only unique fields (like id)
    // Remove isDeleted and other non-unique fields
    if (where && where.id !== undefined) {
      return { id: String(where.id) };
    }
    // Add more unique fields if needed for other models
    return where;
  }

  async findMany({ where = {}, include, skip, take, ...rest } = {}) {
    return this.model.findMany({
      where: this.buildWhereClause(where),
      include,
      skip,
      take,
      ...rest,
    });
  }

  async count(where = {}) {
    return this.model.count({
      where: this.buildWhereClause(where),
    });
  }

  async findManyWithPagination(
    where = {},
    page = 1,
    limit = 5,
    include = {},
    orderBy = {}
  ) {
    // Ensure page and limit are numbers
    page = Number(page) || 1;
    limit = Number(limit) || 5;

    const skip = (page - 1) * limit;
    const mergedWhere = this.buildWhereClause(where);
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

    const totalPages = Math.ceil(total / limit);

    return {
      data,
      pagination: {
        page,
        limit,
        total,
        pages: totalPages,
      },
    };
  }

  findUnique(where, include) {
    // Only pass unique fields to where
    const uniqueWhere = this.extractUniqueWhere(where);
    // Apply isDeleted filter if the model supports it
    const finalWhere = this.hasIsDeletedField()
      ? { ...uniqueWhere, isDeleted: false }
      : uniqueWhere;
    return this.model.findUnique({
      where: finalWhere,
      include,
    });
  }

  create(data) {
    return this.model.create({ data });
  }

  update(where, data) {
    // Only pass unique fields to where
    const uniqueWhere = this.extractUniqueWhere(where);
    return this.model.update({
      where: uniqueWhere,
      data,
    });
  }

  softDelete(where) {
    if (!this.hasIsDeletedField()) {
      throw new Error(`Model ${this.model.name} does not support soft delete`);
    }
    // Only pass unique fields to where
    const uniqueWhere = this.extractUniqueWhere(where);
    return this.model.update({
      where: uniqueWhere,
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
    const mergedWhere = this.buildWhereClause(where);

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
