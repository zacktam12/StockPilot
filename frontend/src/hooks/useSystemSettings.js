import { useSelector } from 'react-redux';

/**
 * Custom hook for accessing system settings
 * Provides easy access to all system core settings with fallback values
 */
export const useSystemSettings = () => {
  const settings = useSelector((state) => state.settings?.settings);

  return {
    // Theme settings
    theme: settings?.theme || 'light',
    
    // Regional settings
    currency: settings?.currency || 'USD',
    dateFormat: settings?.dateFormat || 'MM/DD/YYYY',
    timeFormat: settings?.timeFormat || '12',
    language: settings?.language || 'en',
    
    // Business settings
    taxRate: settings?.taxRate || 0,
    lowStockThreshold: settings?.lowStockThreshold || 5,
    
    // Notification settings
    lowStockAlerts: settings?.lowStockAlerts ?? true,
    salesReports: settings?.salesReports ?? true,
    emailNotifications: settings?.emailNotifications ?? true,
    orderConfirmations: settings?.orderConfirmations ?? true,
    systemUpdates: settings?.systemUpdates ?? true,
    newCustomerAlerts: settings?.newCustomerAlerts ?? false,
    
    // Security settings
    passwordExpiry: settings?.passwordExpiry || 90,
    sessionTimeout: settings?.sessionTimeout || 30,
    loginAttempts: settings?.loginAttempts || 5,
    twoFactorAuth: settings?.twoFactorAuth ?? false,
    
    // Backup settings
    autoBackup: settings?.autoBackup ?? false,
    backupFrequency: settings?.backupFrequency || 'daily',
    
    // Company settings
    appName: settings?.appName || 'StockPilot',
    companyName: settings?.companyName || '',
    companyEmail: settings?.companyEmail || '',
    companyPhone: settings?.companyPhone || '',
    companyAddress: settings?.companyAddress || '',
    companyTaxId: settings?.companyTaxId || '',
    companyWebsite: settings?.companyWebsite || '',
    companyLogo: settings?.companyLogo || '',
  };
};

export default useSystemSettings;
