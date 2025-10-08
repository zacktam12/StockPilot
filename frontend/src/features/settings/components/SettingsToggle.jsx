import React from "react";
import { Switch } from "../../../components/shared/Switch";

const SettingsToggle = ({
  label,
  description,
  checked,
  onChange,
  icon: Icon,
  disabled = false,
  className = "",
}) => {
  return (
    <div className={`flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg ${className}`}>
      <div className="flex items-start gap-3">
        {Icon && (
          <div className="mt-1">
            <Icon className="h-5 w-5 text-gray-500 dark:text-gray-400" />
          </div>
        )}
        <div>
          <h4 className={`font-medium ${disabled ? 'text-gray-400 dark:text-gray-600' : 'text-gray-900 dark:text-white'}`}>
            {label}
          </h4>
          {description && (
            <p className={`text-sm ${disabled ? 'text-gray-400 dark:text-gray-600' : 'text-gray-600 dark:text-gray-400'}`}>
              {description}
            </p>
          )}
        </div>
      </div>
      <Switch
        checked={checked}
        onCheckedChange={onChange}
        disabled={disabled}
      />
    </div>
  );
};

export default SettingsToggle;
