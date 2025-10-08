import React from "react";
import { ChevronRight, CheckCircle, X } from "lucide-react";

const SettingsSidebar = ({
  activeTab,
  onTabChange,
  sidebarOpen,
  onClose,
  settingsTabs = []
}) => {
  return (
    <>
      {/* Sidebar */}
      <div className={`
        fixed lg:relative lg:translate-x-0 z-50 lg:z-auto
        w-80 lg:w-80 h-full lg:h-auto
        transform transition-transform duration-300 ease-in-out settings-sidebar
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="settings-sidebar-container h-full bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 shadow-xl lg:shadow-none settings-glass">
          {/* Mobile Close Button - Only on mobile */}
          <div className="lg:hidden flex justify-end p-4 border-b border-gray-200 dark:border-gray-700">
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors settings-transition"
            >
              <X className="h-5 w-5 text-gray-600 dark:text-gray-400" />
            </button>
          </div>

          {/* Settings Navigation */}
          <div className="settings-nav-container p-4 space-y-3">
            <nav className="space-y-3">
              {settingsTabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      onTabChange(tab.id);
                      onClose();
                    }}
                    className={`
                      w-full flex items-center justify-between p-4 rounded-xl transition-all duration-300 settings-nav-item settings-focus
                      ${isActive 
                        ? 'active text-blue-600 shadow-md transform scale-[1.02] border-none bg-white' 
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                      }
                    `}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`
                        p-3 rounded-xl transition-all duration-200
                        ${isActive 
                          ? 'bg-blue-100 shadow-lg' 
                          : `${tab.bgColor} dark:bg-gray-700 hover:shadow-md`
                        }
                      `}>
                        <Icon className={`
                          h-5 w-5 transition-colors duration-200
                          ${isActive 
                            ? 'text-blue-600' 
                            : `${tab.color} dark:text-gray-400`
                          }
                        `} />
                      </div>
                      <div className="text-left">
                        <span className={`font-semibold text-sm ${isActive ? 'text-blue-600' : ''}`}>
                          {tab.label}
                        </span>
                        <p className={`text-xs mt-1 ${isActive ? 'text-blue-600 opacity-80' : 'opacity-80'}`}>
                          {getTabDescription(tab.id)}
                        </p>
                      </div>
                    </div>
                    {isActive && (
                      <ChevronRight className="h-4 w-4 text-blue-600 animate-pulse" />
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Status Indicator - Fixed positioning */}
          <div className="settings-status-container p-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3 p-4 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800">
              <div className="flex items-center justify-center w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-full">
                <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm font-semibold text-green-800 dark:text-green-200">
                  Settings Synced
                </p>
                <p className="text-xs text-green-600 dark:text-green-400">
                  Last updated: Just now
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden settings-overlay"
          onClick={onClose}
        />
      )}
    </>
  );
};

// Helper function to get tab descriptions
const getTabDescription = (tabId) => {
  const descriptions = {
    company: "Branding & info",
    system: "Core settings",
    backup: "Data protection",
    users: "User accounts"
  };
  return descriptions[tabId] || "Settings";
};

export default SettingsSidebar;
