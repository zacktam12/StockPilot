# StockPilot Settings Module

## Overview

The Settings module provides comprehensive configuration management for the StockPilot application. It includes company information, system preferences, security settings, notification management, and backup functionality.

## Features

### 🏢 Company Settings
- Application name configuration
- Company information (name, email, phone, address)
- Tax ID and website
- Company logo upload and management

### ⚙️ System Settings
- Theme selection (Light/Dark/Auto)
- Regional settings (currency, date/time format)
- Language selection
- Tax rate configuration
- Low stock threshold management

### 🔔 Notification Settings
- Email notification preferences
- Low stock alerts
- Sales reports
- Order confirmations
- System updates
- New customer alerts

### 🔒 Security Settings
- Two-factor authentication
- Password expiry configuration
- Session timeout settings
- Login attempt limits
- Password change functionality

### 💾 Backup & Data Management
- Automated backup scheduling
- Manual backup download
- Settings reset functionality
- System maintenance tools

## Architecture

### Frontend Structure
```
src/features/settings/
├── pages/
│   └── Settings.jsx          # Main settings page
├── components/
│   ├── SettingsCard.jsx      # Reusable settings card
│   ├── SettingsToggle.jsx    # Toggle switch component
│   └── SettingsSelect.jsx    # Select dropdown component
├── hooks/
│   └── useSettings.js        # Settings state management hook
└── README.md                 # This documentation
```

### Backend Structure
```
backend/src/
├── routes/
│   └── settings.routes.js    # Settings API routes
├── controller/
│   └── settings.controller.js # Settings controller
├── services/
│   └── settings.service.js   # Settings business logic
├── validators/
│   └── settings.validator.js # Input validation
└── prisma/
    └── schema.prisma         # Database schema
```

## API Endpoints

### Settings Management
- `GET /api/settings` - Get all settings
- `PUT /api/settings` - Update all settings
- `PUT /api/settings/company` - Update company settings
- `PUT /api/settings/system` - Update system settings
- `PUT /api/settings/notifications` - Update notification settings
- `PUT /api/settings/security` - Update security settings
- `PUT /api/settings/backup` - Update backup settings

### File Operations
- `POST /api/settings/logo` - Upload company logo
- `GET /api/settings/backup/download` - Download backup

### System Operations
- `POST /api/settings/change-password` - Change user password
- `POST /api/settings/reset` - Reset settings to default
- `POST /api/settings/test-email` - Test email configuration
- `GET /api/settings/system-info` - Get system information

## Usage

### Basic Settings Usage
```javascript
import { useSettings } from './hooks/useSettings';

const MyComponent = () => {
  const {
    settings,
    formData,
    loading,
    error,
    handleInputChange,
    handleToggle,
    handleCompanySave
  } = useSettings();

  return (
    <div>
      <input
        value={formData.companyName}
        onChange={(e) => handleInputChange('companyName', e.target.value)}
      />
      <button onClick={handleCompanySave}>
        Save Company Settings
      </button>
    </div>
  );
};
```

### Using Settings Components
```javascript
import SettingsCard from './components/SettingsCard';
import SettingsToggle from './components/SettingsToggle';
import { Building2 } from 'lucide-react';

const CompanySettings = () => {
  return (
    <SettingsCard
      title="Company Information"
      description="Configure your company details"
      icon={Building2}
      iconColor="text-blue-500"
      onSave={handleSave}
      saving={saving}
    >
      <SettingsToggle
        label="Email Notifications"
        description="Receive notifications via email"
        checked={emailNotifications}
        onChange={() => handleToggle('emailNotifications')}
      />
    </SettingsCard>
  );
};
```

## Database Schema

The Settings table includes the following fields:

```sql
CREATE TABLE Settings (
  id                VARCHAR(36) PRIMARY KEY,
  appName           VARCHAR(100) DEFAULT 'StockPilot',
  theme             VARCHAR(20) DEFAULT 'light',
  lowStockThreshold INT DEFAULT 5,
  currency          VARCHAR(10) DEFAULT 'USD',
  taxRate           FLOAT DEFAULT 0,
  
  -- Company Information
  companyName       VARCHAR(200),
  companyEmail      VARCHAR(255),
  companyPhone      VARCHAR(50),
  companyAddress    VARCHAR(500),
  companyTaxId      VARCHAR(50),
  companyLogo       VARCHAR(500),
  companyWebsite    VARCHAR(255),
  
  -- Notifications
  emailNotifications BOOLEAN DEFAULT true,
  lowStockAlerts     BOOLEAN DEFAULT true,
  salesReports       BOOLEAN DEFAULT true,
  newCustomerAlerts  BOOLEAN DEFAULT false,
  systemUpdates      BOOLEAN DEFAULT true,
  orderConfirmations BOOLEAN DEFAULT true,
  
  -- Security
  twoFactorAuth      BOOLEAN DEFAULT false,
  passwordExpiry     INT DEFAULT 90,
  sessionTimeout     INT DEFAULT 30,
  loginAttempts      INT DEFAULT 5,
  
  -- Additional Settings
  dateFormat         VARCHAR(20) DEFAULT 'MM/DD/YYYY',
  timeFormat         VARCHAR(10) DEFAULT '12',
  language           VARCHAR(10) DEFAULT 'en',
  autoBackup         BOOLEAN DEFAULT false,
  backupFrequency    VARCHAR(20) DEFAULT 'daily',
  
  createdAt          DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt          DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

## State Management

Settings use Redux for state management with the following structure:

```javascript
// Redux State
{
  settings: {
    settings: {
      // All settings fields
    },
    loading: false,
    error: null,
    lastUpdated: null
  }
}

// Actions
- fetchSettings()      // Load settings from API
- updateSettings()     // Update settings via API
- clearError()         // Clear error state
- updateLocalSetting() // Update local state
```

## Validation

All settings inputs are validated using Joi schemas:

- **Company fields**: Email validation, URL validation, length limits
- **System fields**: Enum validation for themes, currencies
- **Security fields**: Range validation for timeouts and limits
- **File uploads**: Image type validation, size limits (5MB)

## Error Handling

The settings module includes comprehensive error handling:

- **API Errors**: Network failures, server errors
- **Validation Errors**: Input validation failures
- **File Upload Errors**: File type, size validation
- **User Feedback**: Toast notifications for success/error states

## Security

- **Authentication**: All settings endpoints require authentication
- **Authorization**: Admin-only access for most settings
- **Input Validation**: Comprehensive input sanitization
- **File Upload Security**: File type and size restrictions

## Performance

- **Optimistic Updates**: Immediate UI feedback
- **Debounced Saves**: Prevent excessive API calls
- **Caching**: Settings cached in Redux store
- **Lazy Loading**: Components loaded on demand

## Testing

The settings module includes:

- **Unit Tests**: Component and hook testing
- **Integration Tests**: API integration testing
- **E2E Tests**: Full user workflow testing

## Future Enhancements

- **Audit Logging**: Track settings changes
- **Bulk Import/Export**: Settings migration tools
- **Role-based Settings**: Different settings per user role
- **Advanced Backup**: Incremental backup support
- **Settings Templates**: Pre-configured setting profiles

## Contributing

When adding new settings:

1. Update the database schema
2. Add validation rules
3. Create API endpoints
4. Update the frontend components
5. Add tests
6. Update documentation

## Support

For issues or questions regarding the settings module, please refer to the main StockPilot documentation or contact the development team.
