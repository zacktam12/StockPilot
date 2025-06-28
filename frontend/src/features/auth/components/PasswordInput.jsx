"use client";

import { useState } from "react";
import { Eye, EyeOff, AlertCircle } from "lucide-react";
import Input from "../../../components/shared/Input";
import { useTheme } from "../../../components/ThemeProvider";

export default function PasswordInput({
  value,
  onChange,
  error,
  disabled = false,
}) {
  const [showPassword, setShowPassword] = useState(false);
  const { theme } = useTheme();

  return (
    <div className="space-y-0.5">
      <label
        htmlFor="password"
        className={`text-sm font-medium ${
          theme === "dark" ? "text-gray-200" : "text-gray-700"
        }`}
      >
        Password
      </label>
      <div className="relative">
        <Input
          id="password"
          name="password"
          type={showPassword ? "text" : "password"}
          placeholder="Enter your password"
          value={value}
          onChange={onChange}
          className={`w-full h-12 px-4 pr-12 text-sm rounded-lg border-0 ${
            theme === "dark"
              ? "bg-gray-700 text-white placeholder:text-gray-400"
              : "bg-yellow-50 text-gray-900 placeholder:text-gray-500"
          } focus:ring-2 focus:ring-blue-500 focus:outline-none`}
          disabled={disabled}
        />
        <button
          type="button"
          className={`absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded ${
            theme === "dark"
              ? "text-gray-400 hover:text-gray-200"
              : "text-gray-500 hover:text-gray-700"
          }`}
          onClick={() => setShowPassword(!showPassword)}
          disabled={disabled}
        >
          {showPassword ? (
            <EyeOff className="h-5 w-5" />
          ) : (
            <Eye className="h-5 w-5" />
          )}
        </button>
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
