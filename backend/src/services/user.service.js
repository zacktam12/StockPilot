const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const createUser = async (data) => {
  // Check if email already exists
  const existingUser = await prisma.user.findUnique({
    where: { email: data.email },
  });

  if (existingUser) {
    throw new Error(`User with email ${data.email} already exists.`);
  }

  // Create user if not exists
  return prisma.user.create({ data });
};

const getAllUsers = () =>
  prisma.user.findMany({
    where: { isDeleted: false },
  });

const getUserById = (id) =>
  prisma.user.findUnique({
    where: { id: parseInt(id) },
  });

const updateUser = async (id, data) => {
  const user = await prisma.user.findUnique({
    where: { id: parseInt(id) },
  });

  if (!user) {
    throw new Error(`User with ID ${id} does not exist.`);
  }

  return prisma.user.update({
    where: { id: parseInt(id) },
    data,
  });
};

const deleteUser = (id) =>
  prisma.user.update({
    where: { id: parseInt(id) },
    data: { isDeleted: true },
  });

module.exports = {
  createUser,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
};
