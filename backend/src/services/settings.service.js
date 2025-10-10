const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const getSettings = async () => {
  try {
    // Get the first (and should be only) settings record
    let settings = await prisma.settings.findFirst();

    // If no settings exist, create default settings
    if (!settings) {
      settings = await prisma.settings.create({
        data: {
          appName: "StockPilot",
          theme: "light",
          lowStockThreshold: 5,
          currency: "USD",
          taxRate: 0,
          passwordExpiry: 90,
          sessionTimeout: 30,
          loginAttempts: 5,
          twoFactorAuth: false,
          autoBackup: false,
          backupFrequency: "daily",
          timezone: "UTC",
          dateFormat: "MM/DD/YYYY",
          timeFormat: "12",
          language: "en",
        },
      });
    }

    return settings;
  } catch (error) {
    throw error;
  }
};

const updateSettings = async (data) => {
  try {
    // Get the first settings record
    const existingSettings = await prisma.settings.findFirst();

    if (existingSettings) {
      // Update existing settings
      return await prisma.settings.update({
        where: { id: existingSettings.id },
        data,
      });
    } else {
      // Create new settings if none exist
      return await prisma.settings.create({ data });
    }
  } catch (error) {
    throw error;
  }
};

module.exports = {
  getSettings,
  updateSettings,
};
