const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const createRole = (data) => prisma.role.create({ data });

const getAllRoles = () =>
  prisma.role.findMany({
    where: { isDeleted: false },
  });

const getRoleById = (id) =>
  prisma.role.findUnique({
    where: { id: String(id) },
  });

const updateRole = (id, data) =>
  prisma.role.update({
    where: { id: String(id) },
    data,
  });

const deleteRole = (id) =>
  prisma.role.update({
    where: { id: String(id) },
    data: { isDeleted: true },
  });

module.exports = {
  createRole,
  getAllRoles,
  getRoleById,
  updateRole,
  deleteRole,
};
