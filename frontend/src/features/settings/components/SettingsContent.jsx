import React from "react";
import { 
  Building2, 
  Settings as SettingsIcon,
  AlertCircle,
  AlertTriangle,
  CheckCircle,
  Globe,
  Hash,
  Mail
} from "lucide-react";
import Input from "../../../components/shared/Input";
import NumericInput from "../../../components/shared/NumericInput";
import Button from "../../../components/shared/Button";
import { Switch } from "../../../components/shared/Switch";
import { BarsSpinner } from "../../../components/shared/Spinner";
import LogoUpload from "./LogoUpload";

const SettingsContent = ({
  activeTab,
  formData,
  onInputChange,
  onToggle,
  saving,
  error,
  errors = {}
}) => {
  // Show error display
  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6">
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full">
              <AlertCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <h3 className="font-semibold text-red-800 dark:text-red-200 text-lg">
                Error Loading Settings
              </h3>
              <p className="text-red-600 dark:text-red-300 mt-1">
                {error}
              </p>
              <p className="text-red-500 dark:text-red-400 text-sm mt-2">
                Please refresh the page or contact support if the issue persists.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="settings-card rounded-xl relative">
        {/* Loading Overlay */}
        {saving && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/80 dark:bg-gray-800/80 rounded-xl">
            <div className="flex items-center gap-3 p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
              <BarsSpinner />
              <span className="text-gray-700 dark:text-gray-300 font-medium">
                Saving settings...
              </span>
            </div>
          </div>
        )}

        <div className="p-8">
          {/* Company Settings */}
          {activeTab === "company" && (
            <div className="space-y-8">
              <div className="flex items-center gap-4 mb-6">
                <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                  <Building2 className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Company Information
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Configure your company details and branding
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="Application Name"
                  value={formData.appName}
                  onChange={(e) => onInputChange("appName", e.target.value)}
                  placeholder="StockPilot"
                  icon={<SettingsIcon size={16} />}
                  className="settings-input"
                />
                <Input
                  label="Company Name"
                  value={formData.companyName}
                  onChange={(e) => onInputChange("companyName", e.target.value)}
                  placeholder="Your Company Name"
                  icon={<Building2 size={16} />}
                  className="settings-input"
                />
                <Input
                  label="Company Email"
                  type="email"
                  value={formData.companyEmail}
                  onChange={(e) => onInputChange("companyEmail", e.target.value)}
                  placeholder="contact@yourcompany.com"
                  icon={<Mail size={16} />}
                  className="settings-input"
                />
                <Input
                  label="Company Phone"
                  value={formData.companyPhone}
                  onChange={(e) => onInputChange("companyPhone", e.target.value)}
                  placeholder="+1 (555) 123-4567"
                  icon={<Hash size={16} />}
                  className="settings-input"
                />
                <div className="md:col-span-2">
                  <Input
                    label="Company Address"
                    value={formData.companyAddress}
                    onChange={(e) => onInputChange("companyAddress", e.target.value)}
                    placeholder="123 Business St, Suite 100, City, State 12345"
                    icon={<Globe size={16} />}
                    className="settings-input"
                  />
                </div>
                <Input
                  label="Tax ID"
                  value={formData.companyTaxId}
                  onChange={(e) => onInputChange("companyTaxId", e.target.value)}
                  placeholder="12-3456789"
                  icon={<Hash size={16} />}
                  className="settings-input"
                />
                <Input
                  label="Website"
                  value={formData.companyWebsite}
                  onChange={(e) => onInputChange("companyWebsite", e.target.value)}
                  placeholder="https://yourcompany.com"
                  icon={<Globe size={16} />}
                  className="settings-input"
                />
              </div>

              {/* Logo Upload Section */}
              <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
                <LogoUpload
                  currentLogo={formData.companyLogo}
                  onLogoChange={(logoUrl) => onInputChange("companyLogo", logoUrl)}
                  onLogoRemove={() => onInputChange("companyLogo", "")}
                  disabled={saving}
                />
              </div>
            </div>
          )}

          {/* System Settings */}
          {activeTab === "system" && (
            <div className="space-y-8">
              <div className="flex items-center gap-4 mb-6">
                <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                  <SettingsIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                    System Configuration
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Configure core application settings and preferences
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Theme
                  </label>
                  <select
                    value={formData.theme}
                    onChange={(e) => onInputChange("theme", e.target.value)}
                    className="w-full settings-input px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="light">Light</option>
                    <option value="dark">Dark</option>
                    <option value="auto">Auto</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Currency
                  </label>
                  <select
                    value={formData.currency}
                    onChange={(e) => onInputChange("currency", e.target.value)}
                    className="w-full settings-input px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="GBP">GBP (£)</option>
                    <option value="CAD">CAD (C$)</option>
                    <option value="ETB">ETB (Br)</option>
                  </select>
                </div>
                <NumericInput
                  label="Low Stock Threshold"
                  name="lowStockThreshold"
                  value={formData.lowStockThreshold}
                  onChange={(e) => onInputChange("lowStockThreshold", e.target.value)}
                  placeholder="5"
                  min={1}
                  max={1000}
                  allowDecimal={false}
                  icon={<AlertTriangle size={16} />}
                  error={errors.lowStockThreshold}
                  className="settings-input"
                />
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default SettingsContent;
