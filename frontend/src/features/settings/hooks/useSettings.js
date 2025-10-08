import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-hot-toast";
import { showSuccess, showError } from "../../../services/notificationService";
import {
  fetchSettings,
  updateSettings,
  clearError,
} from "../../../store/slices/settingsSlice";

export const useSettings = () => {
  const dispatch = useDispatch();
  const { settings, loading, error } = useSelector((state) => state.settings);
  const [saving, setSaving] = useState({});
  const [formData, setFormData] = useState({});

  // Fetch settings on mount
  useEffect(() => {
    dispatch(fetchSettings());
  }, [dispatch]);

  // Update form data when settings are loaded
  useEffect(() => {
    if (settings) {
      setFormData(prev => ({
        ...prev,
        ...settings,
      }));
    }
  }, [settings]);

  // Handle input changes
  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  // Handle toggle switches
  const handleToggle = (field) => {
    setFormData(prev => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  // Save settings for specific tabs
  const saveSettings = async (tab, data) => {
    setSaving(prev => ({ ...prev, [tab]: true }));
    
    try {
      await dispatch(updateSettings(data)).unwrap();
      showSuccess(
        'Settings Saved',
        `${tab.charAt(0).toUpperCase() + tab.slice(1)} settings have been saved successfully!`,
        4000
      );
      return true;
    } catch (error) {
      showError(
        'Settings Save Failed',
        `Failed to save ${tab} settings. Please try again.`,
        5000
      );
      return false;
    } finally {
      setSaving(prev => ({ ...prev, [tab]: false }));
    }
  };

  // Handle company settings save
  const handleCompanySave = () => {
    const companyData = {
      appName: formData.appName,
      companyName: formData.companyName,
      companyEmail: formData.companyEmail,
      companyPhone: formData.companyPhone,
      companyAddress: formData.companyAddress,
      companyTaxId: formData.companyTaxId,
      companyWebsite: formData.companyWebsite,
      companyLogo: formData.companyLogo,
    };
    return saveSettings("company", companyData);
  };

  // Handle system settings save
  const handleSystemSave = () => {
    const systemData = {
      theme: formData.theme,
      currency: formData.currency,
      dateFormat: formData.dateFormat,
      timeFormat: formData.timeFormat,
      language: formData.language,
      taxRate: parseFloat(formData.taxRate),
      lowStockThreshold: parseInt(formData.lowStockThreshold),
    };
    return saveSettings("system", systemData);
  };


  // Handle security settings save
  const handleSecuritySave = () => {
    const securityData = {
      twoFactorAuth: formData.twoFactorAuth,
      passwordExpiry: parseInt(formData.passwordExpiry),
      sessionTimeout: parseInt(formData.sessionTimeout),
      loginAttempts: parseInt(formData.loginAttempts),
    };
    return saveSettings("security", securityData);
  };

  // Handle backup settings save
  const handleBackupSave = () => {
    const backupData = {
      autoBackup: formData.autoBackup,
      backupFrequency: formData.backupFrequency,
    };
    return saveSettings("backup", backupData);
  };

  // Refresh settings
  const refreshSettings = () => {
    dispatch(fetchSettings());
  };

  // Clear errors
  const clearErrors = () => {
    dispatch(clearError());
  };

  // Check if settings have been modified
  const hasChanges = (tab) => {
    if (!settings) return false;
    
    const tabFields = {
      company: ['appName', 'companyName', 'companyEmail', 'companyPhone', 'companyAddress', 'companyTaxId', 'companyWebsite', 'companyLogo'],
      system: ['theme', 'currency', 'dateFormat', 'timeFormat', 'language', 'taxRate', 'lowStockThreshold'],
      security: ['twoFactorAuth', 'passwordExpiry', 'sessionTimeout', 'loginAttempts'],
      backup: ['autoBackup', 'backupFrequency'],
    };

    const fields = tabFields[tab] || [];
    return fields.some(field => formData[field] !== settings[field]);
  };

  return {
    // State
    settings,
    formData,
    loading,
    error,
    saving,
    
    // Actions
    handleInputChange,
    handleToggle,
    handleCompanySave,
    handleSystemSave,
    handleNotificationSave,
    handleSecuritySave,
    handleBackupSave,
    refreshSettings,
    clearErrors,
    
    // Utilities
    hasChanges,
  };
};
