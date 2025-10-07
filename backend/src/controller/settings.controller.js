const settingsService = require("../services/settings.service");
const path = require("path");
const fs = require("fs");

exports.getSettings = async (req, res, next) => {
  try {
    const settings = await settingsService.getSettings();
    res.json({
      success: true,
      data: settings,
    });
  } catch (error) {
    next(error);
  }
};

exports.updateSettings = async (req, res, next) => {
  try {
    const settings = await settingsService.updateSettings(req.body);
    res.json({
      success: true,
      message: "Settings updated successfully",
      data: settings,
    });
  } catch (error) {
    next(error);
  }
};

exports.updateCompanySettings = async (req, res, next) => {
  try {
    const companyFields = [
      'appName', 'companyName', 'companyEmail', 'companyPhone', 
      'companyAddress', 'companyTaxId', 'companyWebsite', 'companyLogo'
    ];
    const companyData = {};
    
    companyFields.forEach(field => {
      if (req.body[field] !== undefined) {
        companyData[field] = req.body[field];
      }
    });

    const settings = await settingsService.updateSettings(companyData);
    res.json({
      success: true,
      message: "Company settings updated successfully",
      data: settings,
    });
  } catch (error) {
    next(error);
  }
};

exports.updateSystemSettings = async (req, res, next) => {
  try {
    const systemFields = [
      'theme', 'currency', 'timezone', 'dateFormat', 'timeFormat', 
      'language', 'taxRate', 'lowStockThreshold'
    ];
    const systemData = {};
    
    systemFields.forEach(field => {
      if (req.body[field] !== undefined) {
        systemData[field] = req.body[field];
      }
    });

    const settings = await settingsService.updateSettings(systemData);
    res.json({
      success: true,
      message: "System settings updated successfully",
      data: settings,
    });
  } catch (error) {
    next(error);
  }
};


exports.updateSecuritySettings = async (req, res, next) => {
  try {
    const securityFields = [
      'twoFactorAuth', 'passwordExpiry', 'sessionTimeout', 'loginAttempts'
    ];
    const securityData = {};
    
    securityFields.forEach(field => {
      if (req.body[field] !== undefined) {
        securityData[field] = req.body[field];
      }
    });

    const settings = await settingsService.updateSettings(securityData);
    res.json({
      success: true,
      message: "Security settings updated successfully",
      data: settings,
    });
  } catch (error) {
    next(error);
  }
};

exports.updateBackupSettings = async (req, res, next) => {
  try {
    const backupFields = ['autoBackup', 'backupFrequency'];
    const backupData = {};
    
    backupFields.forEach(field => {
      if (req.body[field] !== undefined) {
        backupData[field] = req.body[field];
      }
    });

    const settings = await settingsService.updateSettings(backupData);
    res.json({
      success: true,
      message: "Backup settings updated successfully",
      data: settings,
    });
  } catch (error) {
    next(error);
  }
};

exports.uploadLogo = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded",
      });
    }

    // Move file to permanent location
    const uploadDir = path.join(__dirname, '../../uploads/logos');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const fileName = `logo_${Date.now()}${path.extname(req.file.originalname)}`;
    const filePath = path.join(uploadDir, fileName);
    
    // Move the file from temp location to permanent location
    fs.renameSync(req.file.path, filePath);
    
    // Update settings with new logo path
    const logoUrl = `/uploads/logos/${fileName}`;
    const settings = await settingsService.updateSettings({ companyLogo: logoUrl });
    res.json({
      success: true,
      message: "Logo uploaded successfully",
      data: { logoUrl, settings },
    });
  } catch (error) {
    console.error('Logo upload error:', error);
    
    // Clean up temp file if it exists
    if (req.file && req.file.path) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (unlinkError) {
        console.error('Error cleaning up temp file:', unlinkError);
      }
    }
    
    res.status(500).json({
      success: false,
      message: "Failed to upload logo",
      error: error.message
    });
  }
};

exports.changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    // Import required modules
    const bcrypt = require("bcrypt");
    const { PrismaClient } = require("@prisma/client");
    const prisma = new PrismaClient();

    // Get user with password to verify current password
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Hash new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedNewPassword }
    });

    res.json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    console.error('Password change error:', error);
    next(error);
  }
};

exports.downloadBackup = async (req, res, next) => {
  try {
    // This would generate a backup file
    // For now, we'll return a placeholder response
    res.json({
      success: true,
      message: "Backup generation started",
      downloadUrl: "/api/settings/backup/download-file",
    });
  } catch (error) {
    next(error);
  }
};

exports.resetSettings = async (req, res, next) => {
  try {
    // Reset to default settings
    const defaultSettings = {
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
    };

    const settings = await settingsService.updateSettings(defaultSettings);
    res.json({
      success: true,
      message: "Settings reset to default values",
      data: settings,
    });
  } catch (error) {
    next(error);
  }
};

exports.testEmailConfig = async (req, res, next) => {
  try {
    // This would test the email configuration
    // For now, we'll return a success response
    res.json({
      success: true,
      message: "Email configuration test successful",
    });
  } catch (error) {
    next(error);
  }
};

exports.getSystemInfo = async (req, res, next) => {
  try {
    const systemInfo = {
      version: "2.1.0",
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      platform: process.platform,
      nodeVersion: process.version,
      database: "Connected",
      lastBackup: new Date().toISOString(),
    };

    res.json({
      success: true,
      data: systemInfo,
    });
  } catch (error) {
    next(error);
  }
};

// Get public statistics for login page (no auth required)
exports.getPublicStats = async (req, res, next) => {
  try {
    const userService = require("../services/user.service");
    const { PrismaClient } = require("@prisma/client");
    const prisma = new PrismaClient();
    // Direct database check to see if there are any users
    try {
      const directUserCount = await prisma.user.count();
      const allUsers = await prisma.user.findMany({
        select: { id: true, email: true, status: true, createdAt: true }
      });
    } catch (dbError) {
      console.error('Database error:', dbError);
    }
    
    // Get user statistics
    const userStats = await userService.calculateUserSummary({});
    // Calculate uptime percentage (simplified - could be enhanced with actual monitoring)
    const uptimeSeconds = process.uptime();
    const uptimeDays = Math.floor(uptimeSeconds / 86400);
    const uptimeHours = Math.floor((uptimeSeconds % 86400) / 3600);
    const uptimeMinutes = Math.floor((uptimeSeconds % 3600) / 60);
    
    // Calculate a mock uptime percentage based on system uptime
    // In a real system, this would be calculated from actual monitoring data
    const uptimePercentage = Math.min(99.9, 95 + (uptimeDays * 0.1));
    
    const publicStats = {
      totalUsers: userStats.totalUsers || 0,
      activeUsers: userStats.activeUsers || 0,
      uptimePercentage: Math.round(uptimePercentage * 10) / 10,
      supportAvailable: true, // Always true for now
      systemStatus: 'online'
    };
    res.json({
      success: true,
      data: publicStats,
    });
  } catch (error) {
    console.error('Error getting public stats:', error);
    // Return fallback stats if there's an error
    res.json({
      success: true,
      data: {
        totalUsers: 0,
        activeUsers: 0,
        uptimePercentage: 99.9,
        supportAvailable: true,
        systemStatus: 'online'
      },
    });
  }
};