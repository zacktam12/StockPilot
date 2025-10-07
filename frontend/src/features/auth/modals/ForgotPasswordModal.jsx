"use client";

import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Mail, X } from "lucide-react";
import Button from "../../../components/shared/Button";
import Input from "../../../components/shared/Input";
import Card from "../../../components/shared/Card";
import Spinner from "../../../components/shared/Spinner";
import { useTheme } from "../../../components/ThemeProvider";
import LoginNotice from "../components/LoginNotice";
import { authAPI } from "../../../services/api";
import { useOutsideClick } from "../../../hooks/useOutsideClick";
import { showSuccess as showSuccessNotification } from "../../../services/notificationService";
import { 
  validateEmail, 
  validatePassword, 
  validatePasswordMatch,
  validateResetCode,
  sanitizeResetCode,
  sanitizeEmail 
} from "../../../utils/authValidation";

export default function ForgotPasswordModal({
  onClose,
  onOpenAccountRecovery,
  initialEmail = "",
}) {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const [email, setEmail] = useState(initialEmail);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [errors, setErrors] = useState({});
  const [code, setCode] = useState("");
  const [isCodeSent, setIsCodeSent] = useState(false);
  const [isCodeVerified, setIsCodeVerified] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [resetSuccess, setResetSuccess] = useState(false);

  // Set initial email if provided
  useEffect(() => {
    if (initialEmail) {
      setEmail(initialEmail);
    }
  }, [initialEmail]);

  // Email change handler with real-time validation
  const handleEmailChange = (e) => {
    const value = e.target.value;
    setEmail(value);
    setError("");
    
    // Real-time validation
    if (value) {
      const emailValidation = validateEmail(value);
      if (!emailValidation.isValid && emailValidation.error) {
        setErrors((prev) => ({ ...prev, email: emailValidation.error }));
      } else {
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors.email;
          return newErrors;
        });
      }
    } else {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.email;
        return newErrors;
      });
    }
  };

  // Email blur handler for sanitization
  const handleEmailBlur = () => {
    const sanitized = sanitizeEmail(email);
    setEmail(sanitized);
    
    if (sanitized) {
      const emailValidation = validateEmail(sanitized);
      if (!emailValidation.isValid && emailValidation.error) {
        setErrors((prev) => ({ ...prev, email: emailValidation.error }));
      } else {
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors.email;
          return newErrors;
        });
      }
    }
  };

  // Code change handler with sanitization
  const handleCodeChange = (e) => {
    const value = e.target.value;
    const sanitized = sanitizeResetCode(value);
    setCode(sanitized);
    setError("");
    
    // Real-time validation
    if (sanitized) {
      const codeValidation = validateResetCode(sanitized);
      if (!codeValidation.isValid && codeValidation.error) {
        setErrors((prev) => ({ ...prev, code: codeValidation.error }));
      } else {
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors.code;
          return newErrors;
        });
      }
    }
  };

  // Password change handler with real-time validation
  const handlePasswordChange = (e) => {
    const value = e.target.value;
    setNewPassword(value);
    setPasswordError("");
    setError("");
    
    // Real-time validation
    if (value) {
      const passwordValidation = validatePassword(value);
      if (!passwordValidation.isValid && passwordValidation.error) {
        setErrors((prev) => ({ ...prev, newPassword: passwordValidation.error }));
        setPasswordError(passwordValidation.error);
      } else {
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors.newPassword;
          return newErrors;
        });
        setPasswordError("");
      }
    }
    
    // Check password match if confirm password is already filled
    if (confirmPassword) {
      const matchValidation = validatePasswordMatch(value, confirmPassword);
      if (!matchValidation.isValid && matchValidation.error) {
        setErrors((prev) => ({ ...prev, confirmPassword: matchValidation.error }));
      } else {
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors.confirmPassword;
          return newErrors;
        });
      }
    }
  };

  // Confirm password change handler with real-time validation
  const handleConfirmPasswordChange = (e) => {
    const value = e.target.value;
    setConfirmPassword(value);
    setError("");
    
    // Real-time validation for password match
    if (value) {
      const matchValidation = validatePasswordMatch(newPassword, value);
      if (!matchValidation.isValid && matchValidation.error) {
        setErrors((prev) => ({ ...prev, confirmPassword: matchValidation.error }));
      } else {
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors.confirmPassword;
          return newErrors;
        });
      }
    }
  };

  // Note: Auto-close is now handled in handleSetNewPassword after login

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate email
    const emailValidation = validateEmail(email);
    if (!emailValidation.isValid) {
      setError(emailValidation.error || "Please enter a valid email address.");
      setErrors({ email: emailValidation.error || "Please enter a valid email address." });
      return;
    }
    
    setIsLoading(true);
    setError("");
    setErrors({});
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
      const errorMessage = error.response?.data?.message || error.message || "System error occurred. Please try again or contact your administrator.";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // 2. Handle code verification with backend
  const handleVerifyCode = async (e) => {
    e.preventDefault();
    setError("");
    setErrors({});
    
    // Validate code
    const codeValidation = validateResetCode(code);
    if (!codeValidation.isValid) {
      setError(codeValidation.error || "Please enter a valid 6-digit code.");
      setErrors({ code: codeValidation.error || "Please enter a valid 6-digit code." });
      return;
    }

    setIsLoading(true);
    try {
      // Verify code with backend before proceeding
      const response = await authAPI.verifyResetCode(email, code);
      if (response && response.data && response.data.success) {
        setIsCodeVerified(true);
      } else {
        setError(response?.data?.message || "Invalid or expired code");
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || "Invalid or expired code. Please try again.";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // 3. Handle new password submission and auto-login
  const handleSetNewPassword = async (e) => {
    e.preventDefault();
    setError("");
    setPasswordError("");
    setErrors({});

    // Validate password
    const passwordValidation = validatePassword(newPassword);
    if (!passwordValidation.isValid) {
      const errorMsg = passwordValidation.error || "Invalid password";
      setPasswordError(errorMsg);
      setError(errorMsg);
      setErrors({ newPassword: errorMsg });
      return;
    }

    // Check if passwords match
    const matchValidation = validatePasswordMatch(newPassword, confirmPassword);
    if (!matchValidation.isValid) {
      const errorMsg = matchValidation.error || "Passwords do not match";
      setError(errorMsg);
      setErrors({ confirmPassword: errorMsg });
      return;
    }

    setIsLoading(true);
    try {
      const response = await authAPI.resetPasswordWithCode(
        email,
        code,
        newPassword
      );
      
      if (response && response.data && response.data.success) {
        const data = response.data;
        
        // Store authentication token and user data
        localStorage.setItem("authToken", data.token);
        localStorage.setItem("userRole", data.user.role);
        localStorage.setItem("userName", data.user.email);
        localStorage.setItem("userEmail", data.user.email);
        localStorage.setItem("firstName", data.user.firstName || "");
        localStorage.setItem("lastName", data.user.lastName || "");
        localStorage.setItem("phone", data.user.phone || "");
        localStorage.setItem("userAvatar", data.user.profilePicture || "");
        localStorage.setItem("employeeId", data.user.employeeId || "");
        localStorage.setItem("userJoinDate", data.user.createdAt || new Date().toISOString());
        localStorage.setItem("userLastLogin", data.user.lastLoginAt || new Date().toISOString());
        
        // Show success state briefly
        setResetSuccess(true);
        
        // Show success notification
        showSuccessNotification(
          "Password Reset Successful",
          `Welcome back, ${data.user.firstName || data.user.email}! Logging you in...`,
          2000
        );
        
        // Close modal and navigate to dashboard after short delay
        setTimeout(() => {
          onClose();
          switch (data.user.role) {
            case "admin":
              navigate("/dashboard");
              break;
            default:
              navigate("/");
          }
        }, 1500);
      } else {
        const errorMessage = response?.data?.message || "Failed to reset password.";
        setError(errorMessage);
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || "Failed to reset password. Please try again.";
      setError(errorMessage);
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div ref={modalRef} className="w-full max-w-lg mx-4">
        <Card
          className={
            theme === "dark"
              ? "bg-gray-800/95 border-gray-700 shadow-2xl"
              : "bg-white/95 border-gray-200 shadow-2xl"
          }
        >
          <div className="p-8">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <button
                  onClick={onClose}
                  className={`p-3 rounded-2xl transition-all duration-200 ${
                    theme === "dark"
                      ? "text-gray-400 hover:text-white hover:bg-gray-700/50"
                      : "text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  <ArrowLeft className="h-6 w-6" />
                </button>
                <div>
                  <h2
                    className={`text-2xl font-bold ${
                      theme === "dark" ? "text-white" : "text-gray-900"
                    }`}
                  >
                    Reset Password
                  </h2>
                  {!isCodeSent && !isCodeVerified && !resetSuccess && (
                    <p
                      className={`text-base ${
                        theme === "dark" ? "text-gray-400" : "text-gray-600"
                      }`}
                    >
                      Enter your email to receive a secure reset link
                    </p>
                  )}
                </div>
              </div>
              <button
                onClick={onClose}
                className={`p-2 rounded-xl transition-all duration-200 ${
                  theme === "dark"
                    ? "text-gray-400 hover:text-white hover:bg-gray-700/50"
                    : "text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                }`}
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-8">
              {resetSuccess ? (
                <div className="space-y-4 text-center">
                  <LoginNotice
                    type="success"
                    message="Password reset successful! Logging you in..."
                    isVisible={true}
                  />
                  <div className={`flex items-center justify-center gap-2 ${
                    theme === "dark" ? "text-gray-300" : "text-gray-600"
                  }`}>
                    <Spinner size="sm" />
                    <span className="text-sm">Redirecting to dashboard...</span>
                  </div>
                </div>
              ) : isCodeVerified ? (
                <form onSubmit={handleSetNewPassword} className="space-y-6">
                  <LoginNotice
                    type="error"
                    message={error}
                    isVisible={!!error}
                  />
                  
                  {/* Password Requirements */}
                  <div className={`p-4 rounded-xl border ${
                    theme === "dark" 
                      ? "bg-blue-900/20 border-blue-800" 
                      : "bg-blue-50 border-blue-200"
                  }`}>
                    <p className={`text-sm font-semibold mb-2 ${
                      theme === "dark" ? "text-blue-300" : "text-blue-800"
                    }`}>
                      Password Requirements:
                    </p>
                    <ul className={`text-xs space-y-1 ${
                      theme === "dark" ? "text-blue-400" : "text-blue-700"
                    }`}>
                      <li>• At least 8 characters long</li>
                      <li>• One lowercase letter</li>
                      <li>• One uppercase letter</li>
                      <li>• One number</li>
                      <li>• One special character (@$!%*?&)</li>
                    </ul>
                  </div>

                  <div className="space-y-3">
                    <label className={`text-base font-semibold ${
                      theme === "dark" ? "text-gray-200" : "text-gray-700"
                    }`}>
                      New Password
                    </label>
                    <Input
                      type="password"
                      placeholder="Enter your new password"
                      value={newPassword}
                      onChange={handlePasswordChange}
                      className={`h-14 text-base rounded-2xl border-2 ${
                        errors.newPassword
                          ? "border-red-300 focus:border-red-500"
                          : theme === "dark"
                          ? "bg-gray-700/50 text-white placeholder:text-gray-300 border-gray-600 focus:border-gray-600 focus:bg-gray-700/50"
                          : "bg-gray-50 text-gray-900 placeholder:text-gray-400 border-gray-200 focus:border-gray-200 focus:bg-gray-50"
                      } focus:outline-none`}
                      required
                    />
                    {errors.newPassword && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                        {errors.newPassword}
                      </p>
                    )}
                  </div>

                  <div className="space-y-3">
                    <label className={`text-base font-semibold ${
                      theme === "dark" ? "text-gray-200" : "text-gray-700"
                    }`}>
                      Confirm Password
                    </label>
                    <Input
                      type="password"
                      placeholder="Confirm your new password"
                      value={confirmPassword}
                      onChange={handleConfirmPasswordChange}
                      className={`h-14 text-base rounded-2xl border-2 ${
                        errors.confirmPassword
                          ? "border-red-300 focus:border-red-500"
                          : theme === "dark"
                          ? "bg-gray-700/50 text-white placeholder:text-gray-300 border-gray-600 focus:border-gray-600 focus:bg-gray-700/50"
                          : "bg-gray-50 text-gray-900 placeholder:text-gray-400 border-gray-200 focus:border-gray-200 focus:bg-gray-50"
                      } focus:outline-none`}
                      required
                    />
                    {errors.confirmPassword && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                        {errors.confirmPassword}
                      </p>
                    )}
                  </div>

                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    className="w-full"
                    disabled={isLoading || !newPassword || !confirmPassword}
                  >
                    {isLoading ? <Spinner size="sm" /> : "Set New Password"}
                  </Button>
                </form>
              ) : isCodeSent ? (
                <form onSubmit={handleVerifyCode} className="space-y-6">
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
                  <div className="space-y-3">
                    <label className={`text-base font-semibold ${
                      theme === "dark" ? "text-gray-200" : "text-gray-700"
                    }`}>
                      Enter 6-digit Code
                    </label>
                    <Input
                      type="text"
                      placeholder="Enter 6-digit code"
                      value={code}
                      onChange={handleCodeChange}
                      maxLength={6}
                      className={`h-14 text-base rounded-2xl border-2 ${
                        errors.code
                          ? "border-red-300 focus:border-red-500"
                          : theme === "dark"
                          ? "bg-gray-700/50 text-white placeholder:text-gray-300 border-gray-600 focus:border-gray-600 focus:bg-gray-700/50"
                          : "bg-gray-50 text-gray-900 placeholder:text-gray-400 border-gray-200 focus:border-gray-200 focus:bg-gray-50"
                      } focus:outline-none`}
                      required
                    />
                    {errors.code && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                        {errors.code}
                      </p>
                    )}
                  </div>
                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    className="w-full"
                    disabled={isLoading || code.length !== 6}
                  >
                    {isLoading ? <Spinner size="sm" /> : "Verify Code"}
                  </Button>
                </form>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-3">
                    <label
                      htmlFor="email"
                      className={`text-base font-semibold ${
                        theme === "dark" ? "text-gray-200" : "text-gray-700"
                      }`}
                    >
                      Work Email Address
                    </label>
                    <div className="relative">
                      <Mail
                        className={`absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 ${
                          theme === "dark" ? "text-gray-400" : "text-gray-500"
                        }`}
                      />
                      <Input
                        id="email"
                        type="email"
                        placeholder="Enter your work email"
                        value={email}
                        onChange={handleEmailChange}
                        onBlur={handleEmailBlur}
                        className={`pl-12 h-14 text-base rounded-2xl border-2 ${
                          errors.email 
                            ? "border-red-300 focus:border-red-500"
                            : theme === "dark"
                            ? "bg-gray-700/50 text-white placeholder:text-gray-300 border-gray-600 focus:border-gray-600 focus:bg-gray-700/50"
                            : "bg-gray-50 text-gray-900 placeholder:text-gray-400 border-gray-200 focus:border-gray-200 focus:bg-gray-50"
                        } focus:outline-none`}
                        required
                        disabled={isLoading}
                      />
                      {errors.email && (
                        <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                          {errors.email}
                        </p>
                      )}
                    </div>
                  </div>

                  <LoginNotice
                    type="error"
                    message={error}
                    isVisible={!!error}
                  />

                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    className="w-full"
                    disabled={isLoading || !email}
                  >
                    {isLoading ? (
                      <div className="flex items-center justify-center gap-2">
                        <Spinner size="sm" />
                        Sending Reset Link...
                      </div>
                    ) : (
                      "Send Reset Link"
                    )}
                  </Button>
                </form>
              )}

              <div
                className={`text-center text-base space-y-3 ${
                  theme === "dark" ? "text-gray-400" : "text-gray-600"
                }`}
              >
                <p>
                  Remember your password?{" "}
                  <button
                    onClick={onClose}
                    className="text-blue-600 hover:text-blue-500 font-semibold transition-colors duration-200"
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
                      className="text-blue-600 hover:text-blue-500 font-semibold transition-colors duration-200"
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
