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
    <div className="space-y-6">
      <LoginNotice
        type="success"
        message="Login successful! Redirecting..."
        isVisible={showSuccess}
      />

      <LockoutMessage lockoutTime={lockoutTime} isVisible={isLocked} />

      <form onSubmit={onSubmit} className="space-y-6">
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
            <input
              id="rememberMe"
              type="checkbox"
              checked={formData.rememberMe}
              onChange={(e) => onRememberMeChange(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-blue-800 focus:ring-blue-800"
              disabled={isLoading || isLocked}
            />
            <label
              htmlFor="rememberMe"
              className={`text-sm ${
                theme === "dark" ? "text-gray-300" : "text-gray-600"
              }`}
            >
              Remember me
            </label>
          </div>
          <button
            type="button"
            className="text-sm text-orange-400 hover:text-orange-300 font-medium"
            onClick={onForgotPasswordClick}
          >
            Forgot Password?
          </button>
        </div>

        <Button
          type="submit"
          className="w-full h-12 bg-blue-800 hover:bg-blue-600 text-white font-medium rounded-lg transition-colors"
          disabled={isLoading || isLocked}
        >
          {isLoading ? (
            <div className="flex items-center justify-center gap-2">
              <Spinner size="sm" />
              Signing in...
            </div>
          ) : (
            "Login"
          )}
        </Button>
      </form>
    </div>
  );
}
