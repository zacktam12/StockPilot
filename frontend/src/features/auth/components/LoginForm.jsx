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
  onInputBlur,
  onSubmit,
  onRememberMeChange,
  onForgotPasswordClick,
  errors,
  isLoading,
  isLocked,
  lockoutTime,
  showSuccess,
  maxLoginAttempts = 5,
  loginAttempts = 0,
}) {
  const { theme } = useTheme();

  return (
    <div className="space-y-6">
      <LoginNotice
        type="success"
        message="Login successful! Redirecting..."
        isVisible={showSuccess}
      />

      <LockoutMessage lockoutTime={lockoutTime} isVisible={isLocked} />

      {/* Show remaining attempts if not locked and there was an error */}
      {!isLocked &&
        errors?.general &&
        typeof maxLoginAttempts === "number" &&
        typeof loginAttempts === "number" &&
        loginAttempts > 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3 text-sm text-yellow-800 mb-4">
            {`You have ${maxLoginAttempts - loginAttempts} login attempt${
              maxLoginAttempts - loginAttempts === 1 ? "" : "s"
            } remaining.`}
          </div>
        )}

      <form onSubmit={onSubmit} className="space-y-6">
        <EmailInput
          value={formData.email}
          onChange={onInputChange}
          onBlur={onInputBlur}
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

    </div>
  );
}
