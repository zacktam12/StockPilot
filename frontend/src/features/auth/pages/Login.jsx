// src/features/auth/pages/Login.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { API_ENDPOINTS } from "@/utils/constants";
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  AlertCircle,
  CheckCircle2,
  HelpCircle,
} from "lucide-react";
import Button from "../../../components/shared/Button";
import Input from "../../../components/shared/Input";
import Card from "../../../components/shared/Card";
import Spinner from "../../../components/shared/spinner";
import { useTheme } from "../../../components/ThemeProvider";
import.meta.env;
import ForgotPassword from "../components/ForgotPassword";
import AccountRecovery from "../components/AccountRecovery";

// Backend API configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
const LOGIN_ENDPOINT = `${API_BASE_URL}/api/auth/login`;

export default function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [lockoutTime, setLockoutTime] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [showAccountRecovery, setShowAccountRecovery] = useState(false);

  const { theme } = useTheme();

  useEffect(() => {
    const savedEmail = localStorage.getItem("rememberedEmail");
    if (savedEmail) {
      setFormData((prev) => ({
        ...prev,
        email: savedEmail,
        rememberMe: true,
      }));
    }
  }, []);

  useEffect(() => {
    let timer;
    if (isLocked && lockoutTime > 0) {
      timer = setInterval(() => {
        setLockoutTime((prev) => {
          if (prev <= 1) {
            setIsLocked(false);
            setLoginAttempts(0);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isLocked, lockoutTime]);

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!validateEmail(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }
    if (!formData.password) {
      newErrors.password = "Password is required";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleCheckboxChange = (checked) => {
    setFormData((prev) => ({ ...prev, rememberMe: checked }));
    if (checked) {
      localStorage.setItem("rememberedEmail", formData.email);
    } else {
      localStorage.removeItem("rememberedEmail");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isLocked) return;
    if (!validateForm()) return;

    setIsLoading(true);
    setErrors({});

    try {
      const response = await fetch(LOGIN_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Login failed");
      }

      // Store token and user info from backend response
      if (formData.rememberMe) {
        localStorage.setItem("rememberedEmail", formData.email);
      } else {
        localStorage.removeItem("rememberedEmail");
      }

      localStorage.setItem("authToken", data.token);
      localStorage.setItem("userRole", data.user.role);
      localStorage.setItem("userName", data.user.name);
      localStorage.setItem("userEmail", data.user.email);

      setShowSuccess(true);
      setTimeout(() => {
        // Navigate based on user role from backend response
        switch (data.user.role) {
          case "admin":
            navigate("/");
            break;
          case "staff":
            navigate("/staff/dashboard");
            break;
          default:
            navigate("/dashboard");
        }
      }, 1000);
    } catch (error) {
      const newAttempts = loginAttempts + 1;
      setLoginAttempts(newAttempts);

      // Inform backend of failed login attempt if needed
      await fetch(
        import.meta.env.VITE_API_BASE_URL + API_ENDPOINTS.AUTH.LOGIN_FAILED,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: formData.email,
            attemptNumber: newAttempts,
          }),
        }
      );

      if (newAttempts >= 5) {
        setIsLocked(true);
        setLockoutTime(60);
        setErrors({
          general:
            "Too many failed attempts. Account locked for 60 seconds. Contact your administrator if you continue having issues.",
        });
      } else {
        setErrors({
          general: `Invalid credentials. ${
            5 - newAttempts
          } attempts remaining.`,
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className={`relative z-50 min-h-screen flex items-center justify-center ${
        theme === "dark" ? "bg-gray-900" : "bg-gray-100"
      }`}
    >
      {/* Forgot Password Modal */}
      {showForgotPassword && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/70 dark:bg-black/60 backdrop-blur-sm">
          <div className="relative w-full max-w-md">
            <button
              className="absolute top-2 right-2 z-10 text-gray-800 dark:text-white bg-black/40 dark:bg-white/10 rounded-full p-1"
              onClick={() => setShowForgotPassword(false)}
              aria-label="Close"
            >
              ×
            </button>
            <ForgotPassword
              onOpenAccountRecovery={() => {
                setShowForgotPassword(false);
                setShowAccountRecovery(true);
              }}
            />
          </div>
        </div>
      )}
      {/* Account Recovery Modal */}
      {showAccountRecovery && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/70 dark:bg-black/60 backdrop-blur-sm">
          <div className="relative w-full max-w-md">
            <button
              className="absolute top-2 right-2 z-10 text-gray-800 dark:text-white bg-black/40 dark:bg-white/10 rounded-full p-1"
              onClick={() => setShowAccountRecovery(false)}
              aria-label="Close"
            >
              ×
            </button>
            <AccountRecovery />
          </div>
        </div>
      )}
      <div
        className={`w-full max-w-md mx-4 ${
          theme === "dark" ? "bg-gray-800" : "bg-white"
        }`}
      >
        <div className="p-6">
          <h2
            className={`text-2xl font-bold text-center mb-6 ${
              theme === "dark" ? "text-white" : "text-gray-800"
            }`}
          >
            Inventory Management System
          </h2>

          {showSuccess && (
            <div
              className={`flex items-center justify-center mb-4 ${
                theme === "dark" ? "text-green-400" : "text-green-600"
              }`}
            >
              <CheckCircle2 className="w-6 h-6 mr-2" />
              <span>Login successful!</span>
            </div>
          )}

          {errors.general && (
            <div
              className={`flex items-center justify-center mb-4 ${
                theme === "dark" ? "text-red-400" : "text-red-600"
              }`}
            >
              <AlertCircle className="w-6 h-6 mr-2" />
              <span>{errors.general}</span>
            </div>
          )}

          <Card>
            <div className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
              <div className="space-y-1 pb-3 p-4">
                <h2 className="text-lg text-center text-white font-semibold">
                  Staff Login
                </h2>
                <p className="text-center text-slate-400 text-xs">
                  Enter your credentials provided by administrator
                </p>
              </div>

              <div className="space-y-3 px-4 pb-3">
                {showSuccess && (
                  <div className="border border-green-500 bg-green-500/10 rounded-md p-2 flex items-center gap-2">
                    <CheckCircle2 className="h-3 w-3 text-green-500" />
                    <span className="text-green-400 text-xs">
                      Login successful! Redirecting...
                    </span>
                  </div>
                )}
                {/* 
                {errors.general && (
                  <div className="border border-red-500 bg-red-500/10 rounded-md p-2 flex items-center gap-2">
                    <AlertCircle className="h-3 w-3 text-red-500" />
                    <span className="text-red-400 text-xs">
                      {errors.general}
                    </span>
                  </div>
                )} */}

                {isLocked && (
                  <div className="border border-yellow-500 bg-yellow-500/10 rounded-md p-2 flex items-center gap-2">
                    <AlertCircle className="h-3 w-3 text-yellow-500" />
                    <span className="text-yellow-400 text-xs">
                      Account locked. Try again in {lockoutTime} seconds.
                    </span>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-3">
                  <div className="space-y-1">
                    <label
                      htmlFor="email"
                      className={`text-xs block ${
                        theme === "dark" ? "text-slate-200" : "text-gray-700"
                      }`}
                    >
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-2 top-2 h-3 w-3 text-slate-400" />
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="Enter your work email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className={`pl-7 h-8 text-sm ${
                          theme === "dark"
                            ? "bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400"
                            : "bg-gray-100 border-gray-300 text-gray-800 placeholder:text-gray-400"
                        } focus:border-blue-500`}
                        disabled={isLoading || isLocked}
                      />
                    </div>
                    {errors.email && (
                      <p className="text-xs text-red-400 flex items-center gap-1">
                        <AlertCircle className="h-2 w-2" />
                        {errors.email}
                      </p>
                    )}
                  </div>

                  <div className="space-y-1">
                    <label
                      htmlFor="password"
                      className={`text-xs block ${
                        theme === "dark" ? "text-slate-200" : "text-gray-700"
                      }`}
                    >
                      Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-2 top-2 h-3 w-3 text-slate-400" />
                      <Input
                        id="password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        value={formData.password}
                        onChange={handleInputChange}
                        className={`pl-7 pr-8 h-8 text-sm ${
                          theme === "dark"
                            ? "bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400"
                            : "bg-gray-100 border-gray-300 text-gray-800 placeholder:text-gray-400"
                        } focus:border-blue-500`}
                        disabled={isLoading || isLocked}
                      />
                      <button
                        type="button"
                        className="absolute right-0 top-0 h-8 w-8 p-0 text-slate-400 hover:text-white bg-transparent border-none cursor-pointer flex items-center justify-center"
                        onClick={() => setShowPassword(!showPassword)}
                        disabled={isLoading || isLocked}
                      >
                        {showPassword ? (
                          <EyeOff className="h-3 w-3" />
                        ) : (
                          <Eye className="h-3 w-3" />
                        )}
                      </button>
                    </div>
                    {errors.password && (
                      <p className="text-xs text-red-400 flex items-center gap-1">
                        <AlertCircle className="h-2 w-2" />
                        {errors.password}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-1">
                      <input
                        id="rememberMe"
                        type="checkbox"
                        checked={formData.rememberMe}
                        onChange={(e) => handleCheckboxChange(e.target.checked)}
                        className={`h-3 w-3 rounded ${
                          theme === "dark"
                            ? "border-slate-600 bg-slate-700 text-blue-600"
                            : "border-gray-300 bg-gray-100 text-blue-600"
                        } focus:ring-blue-500`}
                        disabled={isLoading || isLocked}
                      />
                      <label
                        htmlFor="rememberMe"
                        className={`text-xs cursor-pointer ${
                          theme === "dark" ? "text-slate-300" : "text-gray-700"
                        }`}
                      >
                        Remember me
                      </label>
                    </div>
                    <button
                      type="button"
                      className="text-xs text-blue-400 hover:text-blue-300 bg-transparent border-none p-0"
                      onClick={() => setShowForgotPassword(true)}
                    >
                      Forgot password?
                    </button>
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium h-8 text-sm"
                    disabled={isLoading || isLocked}
                  >
                    {isLoading ? (
                      <div className="flex items-center justify-center gap-1">
                        <Spinner size="sm" />
                        Signing in...
                      </div>
                    ) : (
                      "Sign In"
                    )}
                  </Button>
                </form>
              </div>

              <div className="px-4 pt-0 pb-3 space-y-2">
                <div
                  className={`text-center text-xs w-full ${
                    theme === "dark" ? "text-slate-400" : "text-gray-500"
                  }`}
                >
                  Need access? Contact your system administrator
                </div>

                <div className="w-full text-center">
                  <button
                    type="button"
                    className="inline-flex items-center gap-1 text-xs text-orange-400 hover:text-orange-300 bg-transparent border-none p-0"
                    onClick={() => setShowAccountRecovery(true)}
                  >
                    <HelpCircle className="h-3 w-3" />
                    Can't access your account?
                  </button>
                </div>
              </div>
            </div>
          </Card>

          <div
            className={`text-center text-xs ${
              theme === "dark" ? "text-slate-500" : "text-gray-400"
            }`}
          >
            <p>🔒 Secure inventory system</p>
          </div>
        </div>
      </div>
    </div>
  );
}
//
