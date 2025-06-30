"use client";

import { useState, useEffect, useRef } from "react";
import { ArrowLeft, Mail, X } from "lucide-react";
import Button from "../../../components/shared/Button";
import Input from "../../../components/shared/Input";
import Card from "../../../components/shared/Card";
import Spinner from "../../../components/shared/Spinner";
import { useTheme } from "../../../components/ThemeProvider";
import LoginNotice from "../components/LoginNotice";
import { authAPI } from "../../../services/api";
import { useOutsideClick } from "../../../hooks/useOutsideClick";

export default function ForgotPasswordModal({
  onClose,
  onOpenAccountRecovery,
  initialEmail = "",
}) {
  const { theme } = useTheme();
  const [email, setEmail] = useState(initialEmail);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [code, setCode] = useState("");
  const [isCodeSent, setIsCodeSent] = useState(false);
  const [isCodeVerified, setIsCodeVerified] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [resetSuccess, setResetSuccess] = useState(false);

  // Set initial email if provided
  useEffect(() => {
    if (initialEmail) {
      setEmail(initialEmail);
    }
  }, [initialEmail]);

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateEmail(email)) {
      setError("Please enter a valid email address.");
      return;
    }
    setIsLoading(true);
    setError("");
    try {
      // Call backend API to send password reset code
      const response = await authAPI.forgotPassword(email);
      if (response && response.data && response.data.success) {
        setIsCodeSent(true);
      } else {
        setError(
          response?.data?.message ||
            response?.message ||
            "No user found with this email."
        );
      }
    } catch (error) {
      setError(
        error?.response?.data?.message ||
          error?.response?.message ||
          error?.message ||
          "System error occurred. Please try again or contact your administrator."
      );
    } finally {
      setIsLoading(false);
    }
  };

  // 2. Handle code verification
  const handleVerifyCode = (e) => {
    e.preventDefault();
    setError("");
    if (code.length !== 6 || !/^[0-9]{6}$/.test(code)) {
      setError("Please enter a valid 6-digit code.");
      return;
    }
    setIsCodeVerified(true);
  };

  // 3. Handle new password submission
  const handleSetNewPassword = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    try {
      const response = await authAPI.resetPasswordWithCode(
        email,
        code,
        newPassword
      );
      if (response && response.data && response.data.success) {
        setResetSuccess(true);
      } else {
        setError(response?.data?.message || "Failed to reset password.");
      }
    } catch (error) {
      setError(error?.response?.data?.message || "Failed to reset password.");
    } finally {
      setIsLoading(false);
    }
  };

  // Add outside click functionality
  const modalRef = useRef(null);
  useOutsideClick(modalRef, () => {
    if (onClose) onClose();
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-lg">
      <div ref={modalRef} className="w-full max-w-md mx-4">
        <Card
          className={
            theme === "dark"
              ? "bg-slate-800/50 border-slate-700 backdrop-blur-lg"
              : "bg-white border-gray-200"
          }
        >
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <button
                  onClick={onClose}
                  className={`p-2 rounded-lg transition-colors ${
                    theme === "dark"
                      ? "text-slate-400 hover:text-white hover:bg-slate-700"
                      : "text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  <ArrowLeft className="h-5 w-5" />
                </button>
                <div>
                  <h2
                    className={`text-xl text-center font-semibold ${
                      theme === "dark" ? "text-white" : "text-gray-900"
                    }`}
                  >
                    Reset Password
                  </h2>
                  {!isCodeSent && !isCodeVerified && !resetSuccess && (
                    <p
                      className={`text-sm text-center ${
                        theme === "dark" ? "text-slate-400" : "text-gray-600"
                      }`}
                    >
                      Enter your email to receive a secure reset link
                    </p>
                  )}
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-1 text-gray-400 hover:text-gray-600 rounded"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-6">
              {resetSuccess ? (
                <LoginNotice
                  type="success"
                  message="Password reset successfully! You can now log in with your new password."
                  isVisible={true}
                />
              ) : isCodeVerified ? (
                <form onSubmit={handleSetNewPassword} className="space-y-4">
                  <LoginNotice
                    type="error"
                    message={error}
                    isVisible={!!error}
                  />
                  <label className="text-sm font-medium">New Password</label>
                  <Input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                  />
                  <Button
                    type="submit"
                    className="w-full h-12 bg-blue-800 hover:bg-blue-600 text-white font-medium rounded-lg"
                    disabled={isLoading || !newPassword}
                  >
                    {isLoading ? <Spinner size="sm" /> : "Set New Password"}
                  </Button>
                </form>
              ) : isCodeSent ? (
                <form onSubmit={handleVerifyCode} className="space-y-4">
                  <LoginNotice
                    type="success"
                    message="Reset code sent! Check your email for the secure 6 digit password reset code."
                    isVisible={true}
                  />
                  <LoginNotice
                    type="error"
                    message={error}
                    isVisible={!!error}
                  />
                  <label className="text-sm font-medium">
                    Enter 6-digit Code
                  </label>
                  <Input
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    maxLength={6}
                    required
                  />
                  <Button
                    type="submit"
                    className="w-full h-12 bg-blue-800 hover:bg-blue-600 text-white font-medium rounded-lg"
                    disabled={isLoading || code.length !== 6}
                  >
                    {isLoading ? <Spinner size="sm" /> : "Verify"}
                  </Button>
                </form>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <label
                      htmlFor="email"
                      className={`text-sm font-medium ${
                        theme === "dark" ? "text-slate-200" : "text-gray-700"
                      }`}
                    >
                      Work Email Address
                    </label>
                    <div className="relative">
                      <Mail
                        className={`absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 ${
                          theme === "dark" ? "text-slate-400" : "text-gray-400"
                        }`}
                      />
                      <Input
                        id="email"
                        type="email"
                        placeholder="Enter your work email"
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          setError("");
                        }}
                        className={`pl-10 h-12 ${
                          theme === "dark"
                            ? "bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400"
                            : "bg-yellow-50 border-gray-300 text-gray-900 placeholder:text-gray-500"
                        } focus:ring-2 focus:ring-blue-800 focus:border-blue-800`}
                        required
                        disabled={isLoading}
                      />
                    </div>
                  </div>

                  <LoginNotice
                    type="error"
                    message={error}
                    isVisible={!!error}
                  />

                  <Button
                    type="submit"
                    className="w-full h-12 bg-blue-800 hover:bg-blue-600 text-white font-medium rounded-lg"
                    disabled={isLoading || !email}
                  >
                    {isLoading ? (
                      <div className="flex items-center justify-center gap-2">
                        <Spinner size="sm" />
                        Verifying...
                      </div>
                    ) : (
                      "Send Reset Link"
                    )}
                  </Button>
                </form>
              )}

              <div
                className={`text-center text-sm space-y-2 ${
                  theme === "dark" ? "text-slate-400" : "text-gray-600"
                }`}
              >
                <p>
                  Remember your password?{" "}
                  <button
                    onClick={onClose}
                    className="text-orange-400 hover:text-orange-200 font-medium"
                  >
                    Back to login
                  </button>
                </p>
                {onOpenAccountRecovery && (
                  <p>
                    Can't access your account?{" "}
                    <button
                      type="button"
                      onClick={onOpenAccountRecovery}
                      className="text-orange-400 hover:text-orange-200 font-medium"
                    >
                      Try account recovery
                    </button>
                  </p>
                )}
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
// Forgot
