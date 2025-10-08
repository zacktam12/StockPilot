import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../../../components/shared/Card";
import { BarsSpinner } from "../../../components/shared/Spinner";

const SettingsCard = ({
  title,
  description,
  icon: Icon,
  iconColor = "text-blue-500",
  children,
  onSave,
  saving = false,
  saveButtonText = "Save Settings",
  showSaveButton = true,
  className = "",
}) => {
  return (
    <div className={`relative ${className}`}>
      {saving && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/40 dark:bg-white/10 rounded-xl">
          <BarsSpinner />
        </div>
      )}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            {Icon && <Icon className={`h-5 w-5 ${iconColor}`} />}
            {title}
          </CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
        <CardContent className="space-y-6">
          {children}
        </CardContent>
        {showSaveButton && (
          <CardFooter>
            <button
              onClick={onSave}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            >
              {saving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Saving...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  {saveButtonText}
                </>
              )}
            </button>
          </CardFooter>
        )}
      </Card>
    </div>
  );
};

export default SettingsCard;
