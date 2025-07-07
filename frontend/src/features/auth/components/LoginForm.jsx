"use client";

import Button from "../../../components/shared/Button";
import Spinner from "../../../components/shared/Spinner";
import EmailInput from "./EmailInput";
import PasswordInput from "./PasswordInput";
import LoginNotice from "./LoginNotice";
import LockoutMessage from "./LockoutMessage";
import { useTheme } from "../../../components/ThemeProvider";

export default function LoginForm({
  formData,
  onInputChange,
  onSubmit,
  onRememberMeChange,
  onForgotPasswordClick,
  errors,
  isLoading,
  isLocked,
  lockoutTime,
  showSuccess,
}) {
  const { theme } = useTheme();

  return (
    <div className="space-y-3 sm:space-y-4">
      <LoginNotice
        type="success"
        message="Login successful! Redirecting..."
        isVisible={showSuccess}
      />

      <LockoutMessage lockoutTime={lockoutTime} isVisible={isLocked} />

      <form onSubmit={onSubmit} className="space-y-3 sm:space-y-4">
        <EmailInput
          value={formData.email}
          onChange={onInputChange}
          error={errors.email}
          disabled={isLoading || isLocked}
        />

        <PasswordInput
          value={formData.password}
          onChange={onInputChange}
          error={errors.password}
          disabled={isLoading || isLocked}
        />

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="relative">
              <input
                id="rememberMe"
                type="checkbox"
                checked={formData.rememberMe}
                onChange={(e) => onRememberMeChange(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 focus:ring-2 transition-all duration-200"
                disabled={isLoading || isLocked}
              />
              <div className="absolute inset-0 rounded pointer-events-none ring-2 ring-transparent transition-all duration-200 group-hover:ring-blue-200"></div>
            </div>
            <label
              htmlFor="rememberMe"
              className={`text-sm font-medium cursor-pointer transition-colors duration-200 ${
                theme === "dark"
                  ? "text-gray-300 hover:text-gray-200"
                  : "text-gray-700 hover:text-gray-900"
              }`}
            >
              Remember me
            </label>
          </div>
          <button
            type="button"
            className="text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors duration-200 hover:underline"
            onClick={onForgotPasswordClick}
          >
            Forgot Password?
          </button>
        </div>

        <Button
          type="submit"
          className={`w-full h-10 sm:h-11 font-semibold rounded-xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl ${
            isLoading || isLocked
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white"
          }`}
          disabled={isLoading || isLocked}
        >
          {isLoading ? (
            <div className="flex items-center justify-center gap-2">
              <Spinner size="sm" />
              <span>Signing in...</span>
            </div>
          ) : (
            <span>Sign In</span>
          )}
        </Button>
      </form>

      {/* Compact Security Notice */}
      <div
        className={`mt-3 sm:mt-4 p-2.5 sm:p-3 rounded-lg border ${
          theme === "dark"
            ? "bg-gray-800/50 border-gray-700/50"
            : "bg-blue-50/50 border-blue-200/50"
        }`}
      >
        <div className="flex items-start gap-2">
          <div className="w-4 h-4 sm:w-5 sm:h-5 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
            <svg
              className="w-2 h-2 sm:w-2.5 sm:h-2.5 text-blue-600 dark:text-blue-400"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div>
            <p
              className={`text-xs font-medium ${
                theme === "dark" ? "text-blue-300" : "text-blue-700"
              }`}
            >
              Secure Connection
            </p>
            <p
              className={`text-xs ${
                theme === "dark" ? "text-gray-400" : "text-blue-600"
              } mt-0.5`}
            >
              Your data is encrypted and protected
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
