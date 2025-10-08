import api from './api';

class SettingsService {
  // Get all settings
  async getSettings() {
    try {
      const response = await api.get('/settings');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch settings');
    }
  }

  // Update settings
  async updateSettings(settingsData) {
    try {
      const response = await api.put('/settings', settingsData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to update settings');
    }
  }

  // Update company settings
  async updateCompanySettings(companyData) {
    try {
      const response = await api.put('/settings/company', companyData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to update company settings');
    }
  }

  // Update system settings
  async updateSystemSettings(systemData) {
    try {
      const response = await api.put('/settings/system', systemData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to update system settings');
    }
  }

  // Update notification settings
  async updateNotificationSettings(notificationData) {
    try {
      const response = await api.put('/settings/notifications', notificationData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to update notification settings');
    }
  }

  // Update security settings
  async updateSecuritySettings(securityData) {
    try {
      const response = await api.put('/settings/security', securityData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to update security settings');
    }
  }

  // Update backup settings
  async updateBackupSettings(backupData) {
    try {
      const response = await api.put('/settings/backup', backupData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to update backup settings');
    }
  }

  // Upload company logo
  async uploadLogo(file) {
    try {
      const formData = new FormData();
      formData.append('logo', file);
      
      const response = await api.post('/settings/logo', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to upload logo');
    }
  }

  // Change password
  async changePassword(passwordData) {
    try {
      const response = await api.post('/settings/change-password', passwordData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to change password');
    }
  }

  // Download backup
  async downloadBackup() {
    try {
      const response = await api.get('/settings/backup/download', {
        responseType: 'blob',
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to download backup');
    }
  }

  // Reset settings to default
  async resetSettings() {
    try {
      const response = await api.post('/settings/reset');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to reset settings');
    }
  }

  // Test email configuration
  async testEmailConfig() {
    try {
      const response = await api.post('/settings/test-email');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to test email configuration');
    }
  }

  // Get system info
  async getSystemInfo() {
    try {
      const response = await api.get('/settings/system-info');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to get system info');
    }
  }
}

export default new SettingsService();
