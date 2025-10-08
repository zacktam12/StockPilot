-- Migration to add new fields to Settings table
-- Run this after updating the Prisma schema

ALTER TABLE `Settings` 
ADD COLUMN `companyName` VARCHAR(200) NULL,
ADD COLUMN `companyEmail` VARCHAR(255) NULL,
ADD COLUMN `companyPhone` VARCHAR(50) NULL,
ADD COLUMN `companyAddress` VARCHAR(500) NULL,
ADD COLUMN `companyTaxId` VARCHAR(50) NULL,
ADD COLUMN `companyLogo` VARCHAR(500) NULL,
ADD COLUMN `companyWebsite` VARCHAR(255) NULL,
ADD COLUMN `emailNotifications` BOOLEAN DEFAULT true,
ADD COLUMN `orderConfirmations` BOOLEAN DEFAULT true,
ADD COLUMN `twoFactorAuth` BOOLEAN DEFAULT false,
ADD COLUMN `autoBackup` BOOLEAN DEFAULT false,
ADD COLUMN `backupFrequency` VARCHAR(20) DEFAULT 'daily',
ADD COLUMN `timezone` VARCHAR(100) DEFAULT 'UTC',
ADD COLUMN `dateFormat` VARCHAR(20) DEFAULT 'MM/DD/YYYY',
ADD COLUMN `timeFormat` VARCHAR(10) DEFAULT '12',
ADD COLUMN `language` VARCHAR(10) DEFAULT 'en',
ADD COLUMN `createdAt` DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3),
ADD COLUMN `updatedAt` DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3);

-- Update existing settings with default values
UPDATE `Settings` SET
  `emailNotifications` = true,
  `orderConfirmations` = true,
  `twoFactorAuth` = false,
  `autoBackup` = false,
  `backupFrequency` = 'daily',
  `timezone` = 'UTC',
  `dateFormat` = 'MM/DD/YYYY',
  `timeFormat` = '12',
  `language` = 'en'
WHERE `emailNotifications` IS NULL;
