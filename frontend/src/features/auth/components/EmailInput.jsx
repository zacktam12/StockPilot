"use client";

import { AlertCircle, Mail } from "lucide-react";
import Input from "../../../components/shared/Input";
import { useTheme } from "../../../components/ThemeProvider";

export default function EmailInput({
  value,
  onChange,
  onBlur,
  error,
  disabled = false,
}) {
  const { theme } = useTheme();

  return (
    <div className="space-y-2">
      <label
        htmlFor="email"
        className={`text-sm font-semibold ${
          theme === "dark" ? "text-gray-200" : "text-gray-700"
        }`}
      >
        Email Address
      </label>
      <div className="relative group">
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 z-10">
          <Mail
            className={`h-4 w-4 ${
              theme === "dark" ? "text-gray-400" : "text-gray-500"
            }`}
          />
        </div>
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="Enter your email address"
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          className={`w-full h-12 pl-[52px] pr-4 text-sm rounded-xl border ${
            theme === "dark"
              ? "bg-gray-700/50 text-white placeholder:text-gray-300 border-gray-600 focus:border-gray-600 focus:bg-gray-700/50"
              : "bg-gray-50 text-gray-900 placeholder:text-gray-400 border-gray-200 focus:border-gray-200 focus:bg-gray-50"
          } focus:outline-none`}
          disabled={disabled}
        />
        {error && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <AlertCircle className="h-4 w-4 text-red-500" />
          </div>
        )}
      </div>
      {error && (
        <div className="flex items-center gap-2 text-sm text-red-500 animate-in slide-in-from-top-1 duration-200">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
