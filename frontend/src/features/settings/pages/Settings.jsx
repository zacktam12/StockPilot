import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-hot-toast";
import { showSuccess, showError, showWarning } from "../../../services/notificationService";
import {
  Building2,
  Settings as SettingsIcon,
} from "lucide-react";

// Redux actions
import {
  fetchSettings,
  updateSettings,
  clearError,
} from "../../../store/slices/settingsSlice";

// Components
import LoadingOverlay from "../../../components/shared/LoadingOverlay";
import SettingsHeader from "../components/SettingsHeader";
import SettingsSidebar from "../components/SettingsSidebar";
import SettingsContent from "../components/SettingsContent";

export default function SettingsPage() {
  const dispatch = useDispatch();
  const { settings, loading, error } = useSelector((state) => state.settings);
  const [activeTab, setActiveTab] = useState("system");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Local state for form data
  const [formData, setFormData] = useState({
    // Company Information
    appName: "",
    companyName: "",
    companyEmail: "",
    companyPhone: "",
    companyAddress: "",
    companyTaxId: "",
    companyWebsite: "",
    companyLogo: "",
    
    // System Settings
    theme: "light",
    currency: "USD",
    dateFormat: "MM/DD/YYYY",
    timeFormat: "12",
    language: "en",
    lowStockThreshold: 5,
    
    
  });

  // Validation errors
  const [validationErrors, setValidationErrors] = useState({});

  // Per-tab saving state
  const [saving, setSaving] = useState({
    company: false,
    system: false,
  });

  // Settings tabs configuration
  const settingsTabs = [
    {
      id: "company",
      label: "Company",
      icon: Building2,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      id: "system",
      label: "System",
      icon: SettingsIcon,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
  ];

  // Fetch settings on component mount
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

  // Clear errors on tab change
  useEffect(() => {
    if (error) {
      dispatch(clearError());
    }
  }, [activeTab, dispatch, error]);

  // Handle input changes with validation
  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
    
    // Real-time validation for numeric fields
    const numericFields = {
      lowStockThreshold: { min: 1, max: 1000, type: 'integer' },
    };
    
    if (numericFields[field]) {
      const config = numericFields[field];
      if (value) {
        const numValue = config.type === 'integer' ? parseInt(value) : parseFloat(value);
        
        if (isNaN(numValue)) {
          setValidationErrors(prev => ({
            ...prev,
            [field]: "Please enter a valid number"
          }));
        } else if (numValue < config.min) {
          setValidationErrors(prev => ({
            ...prev,
            [field]: `Value must be at least ${config.min}`
          }));
        } else if (numValue > config.max) {
          setValidationErrors(prev => ({
            ...prev,
            [field]: `Value must be at most ${config.max}`
          }));
        } else {
          setValidationErrors(prev => {
            const newErrors = { ...prev };
            delete newErrors[field];
            return newErrors;
          });
        }
      } else {
        setValidationErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors[field];
          return newErrors;
        });
      }
    }
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
      await dispatch(updateSettings({ endpoint: `/settings/${tab}`, data })).unwrap();
      showSuccess(
        'Settings Saved',
        `${tab.charAt(0).toUpperCase() + tab.slice(1)} settings have been saved successfully!`,
        4000
      );
    } catch (error) {
      showError(
        'Settings Save Failed',
        `Failed to save ${tab} settings. Please try again.`,
        5000
      );
    } finally {
      setSaving(prev => ({ ...prev, [tab]: false }));
    }
  };

  // Handle settings save based on active tab
  const handleSave = () => {
    switch (activeTab) {
      case 'company':
        saveSettings("company", {
          appName: formData.appName,
          companyName: formData.companyName,
          companyEmail: formData.companyEmail,
          companyPhone: formData.companyPhone,
          companyAddress: formData.companyAddress,
          companyTaxId: formData.companyTaxId,
          companyWebsite: formData.companyWebsite,
          // Note: companyLogo is handled separately by the upload API
        });
        break;
      case 'system':
        saveSettings("system", {
          theme: formData.theme,
          currency: formData.currency,
          dateFormat: formData.dateFormat,
          timeFormat: formData.timeFormat,
          language: formData.language,
          lowStockThreshold: parseInt(formData.lowStockThreshold),
        });
        break;
      default:
        showError("Unknown Category", "Unknown settings category selected.", 4000);
    }
  };

  // Handle refresh
  const handleRefresh = () => {
    dispatch(fetchSettings());
    showSuccess("Settings Refreshed", "Settings have been refreshed successfully.", 3000);
  };

  // Handle menu toggle
  const handleMenuToggle = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Handle sidebar close
  const handleSidebarClose = () => {
    setSidebarOpen(false);
  };

  // Show loading overlay
  if (loading) {
    return (
      <LoadingOverlay 
        title="Settings" 
        description="Loading your settings..." 
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <SettingsHeader
        activeTab={activeTab}
        onSave={handleSave}
        onRefresh={handleRefresh}
        onMenuToggle={handleMenuToggle}
        sidebarOpen={sidebarOpen}
        saving={saving[activeTab]}
        settingsTabs={settingsTabs}
      />

      <div className="flex h-screen lg:h-auto">
        {/* Sidebar */}
        <SettingsSidebar
          activeTab={activeTab}
          onTabChange={setActiveTab}
          sidebarOpen={sidebarOpen}
          onClose={handleSidebarClose}
          settingsTabs={settingsTabs}
        />

        {/* Main Content */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Content Area */}
          <div className="flex-1 overflow-auto">
            <SettingsContent
              activeTab={activeTab}
              formData={formData}
              onInputChange={handleInputChange}
              onToggle={handleToggle}
              saving={saving[activeTab]}
              error={error}
              errors={validationErrors}
            />
          </div>
        </div>
      </div>
    </div>
  );
}