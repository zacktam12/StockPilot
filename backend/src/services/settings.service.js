const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const getSettings = () => prisma.settings.findUnique({ where: { id: 1 } });

const updateSettings = (data) =>
  prisma.settings.update({ where: { id: 1 }, data });

module.exports = {
  getSettings,
  updateSettings,
};
