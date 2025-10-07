import React from 'react';
import { Package } from 'lucide-react';
import { useSelector } from 'react-redux';

const Logo = ({ 
  size = "default", 
  showText = true, 
  className = "",
  showStatus = false 
}) => {
  const settings = useSelector((state) => state.settings?.settings);
  const companyLogo = settings?.companyLogo;
  const appName = settings?.appName || "StockPilot";


  // Size configurations
  const sizeConfig = {
    small: {
      container: "w-8 h-8",
      icon: 16,
      text: "text-sm",
      spacing: "gap-2"
    },
    default: {
      container: "w-16 h-16",
      icon: 28,
      text: "text-xl",
      spacing: "gap-3"
    },
    large: {
      container: "w-20 h-20",
      icon: 36,
      text: "text-2xl",
      spacing: "gap-4"
    }
  };

  const config = sizeConfig[size] || sizeConfig.default;

  return (
    <div className={`flex items-center ${config.spacing} ${className}`}>
      {/* Logo Container */}
      <div className={`relative ${config.container} bg-white border-2 border-gray-200 dark:border-gray-600 rounded-2xl flex items-center justify-center shadow-lg ring-2 ring-white dark:ring-gray-800`}>
        {companyLogo ? (
          <img
            src={companyLogo.startsWith('http') ? companyLogo : `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}${companyLogo}`}
            alt={`${appName} Logo`}
            className="w-full h-full object-contain rounded-2xl"
            onError={(e) => {
              e.target.style.display = 'none';
            }}
          />
        ) : (
          <Package size={config.icon} className="text-gray-600 dark:text-gray-400" />
        )}
        
        {/* Status Indicator */}
        {showStatus && (
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white animate-pulse"></div>
        )}
      </div>

      {/* Company Name */}
      {showText && (
        <div>
          <h1 className={`font-bold text-gray-800 dark:text-white font-heading ${config.text}`}>
            {appName}
          </h1>
        </div>
      )}
    </div>
  );
};

export default Logo;
