import React from "react";
import { Save, RefreshCw, Menu, X } from "lucide-react";
import Button from "../../../components/shared/Button";

const SettingsHeader = ({
  activeTab,
  onSave,
  onRefresh,
  onMenuToggle,
  sidebarOpen,
  saving = false,
  settingsTabs = []
}) => {
  const currentTab = settingsTabs.find(tab => tab.id === activeTab);

  return (
    <>
      {/* Mobile Header */}
      <div className="lg:hidden bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={onMenuToggle}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors settings-transition"
            >
              {sidebarOpen ? (
                <X className="h-5 w-5 text-gray-600 dark:text-gray-400" />
              ) : (
                <Menu className="h-5 w-5 text-gray-600 dark:text-gray-400" />
              )}
            </button>
            <div>
              <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
                Settings
              </h1>
              {currentTab && (
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {currentTab.label}
                </p>
              )}
            </div>
          </div>
          <Button
            variant="primary"
            size="md"
            onClick={onSave}
            isLoading={saving}
            className="px-4 py-3 rounded-lg flex items-center justify-center focus:outline-none focus:ring-0 focus:shadow-none active:shadow-none"
            style={{
              backgroundColor: '#3b82f6',
              borderColor: '#3b82f6',
              color: '#ffffff',
              transition: 'background-color 0.2s ease',
              transform: 'none',
              boxShadow: 'none',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#2563eb';
              e.currentTarget.style.borderColor = '#2563eb';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#3b82f6';
              e.currentTarget.style.borderColor = '#3b82f6';
            }}
          >
            <Save className="h-4 w-4" />
            Save
          </Button>
        </div>
      </div>

      {/* Desktop Header */}
      <div className="hidden lg:flex items-center justify-between p-6 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="flex items-center gap-4">
          {currentTab && (
            <div className={`
              p-3 rounded-xl
              ${currentTab.bgColor} dark:bg-gray-700
            `}>
              {React.createElement(currentTab.icon, {
                className: `${currentTab.color} dark:text-gray-300 h-6 w-6`
              })}
            </div>
          )}
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {currentTab?.label} Settings
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Configure your {currentTab?.label.toLowerCase()} preferences and system behavior
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="md"
            onClick={onRefresh}
            className="px-4 py-3 rounded-lg border-blue-300 !text-blue-600 hover:bg-blue-50 hover:border-blue-400 hover:!text-blue-700 transition-colors flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
          <Button
            variant="primary"
            size="md"
            onClick={onSave}
            isLoading={saving}
            className="px-4 py-3 rounded-lg flex items-center justify-center focus:outline-none focus:ring-0 focus:shadow-none active:shadow-none"
            style={{
              backgroundColor: '#3b82f6',
              borderColor: '#3b82f6',
              color: '#ffffff',
              transition: 'background-color 0.2s ease',
              transform: 'none',
              boxShadow: 'none',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#2563eb';
              e.currentTarget.style.borderColor = '#2563eb';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#3b82f6';
              e.currentTarget.style.borderColor = '#3b82f6';
            }}
          >
            <Save className="h-4 w-4" />
            Save Changes
          </Button>
        </div>
      </div>
    </>
  );
};

export default SettingsHeader;
