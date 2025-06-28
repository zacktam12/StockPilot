"use client";

import { AlertCircle } from "lucide-react";
import Input from "../../../components/shared/Input";
import { useTheme } from "../../../components/ThemeProvider";

export default function EmailInput({
  value,
  onChange,
  error,
  disabled = false,
}) {
  const { theme } = useTheme();

  return (
    <div className="space-y-0.5">
      <label
        htmlFor="email"
        className={`text-sm font-medium ${
          theme === "dark" ? "text-gray-200" : "text-gray-700"
        }`}
      >
        Email
      </label>
      <div className="relative">
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="Enter your email address"
          value={value}
          onChange={onChange}
          className={`w-full h-12 px-4 text-sm rounded-lg border-0 ${
            theme === "dark"
              ? "bg-gray-700 text-white placeholder:text-gray-400"
              : "bg-yellow-50 text-gray-900 placeholder:text-gray-500"
          } focus:ring-2 focus:ring-blue-500 focus:outline-none`}
          disabled={disabled}
        />
      </div>
      {error && (
        <p className="text-sm text-red-500 flex items-center gap-1">
          <AlertCircle className="h-4 w-4" />
          {error}
        </p>
      )}
    </div>
  );
}
