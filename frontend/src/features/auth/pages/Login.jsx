"use client";

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Package, Star, Users, Shield, Zap, TrendingUp } from "lucide-react";
import Logo from "../../../components/shared/Logo";
import { showSuccess as showSuccessNotification, showError, showWarning } from "../../../services/notificationService";
import { authAPI, settingsAPI } from "../../../services/api";

import { useTheme } from "../../../components/ThemeProvider";
import LoginForm from "../components/LoginForm";
import ForgotPasswordModal from "../modals/ForgotPasswordModal";
import AccountRecoveryModal from "../modals/AccountRecoveryModal";
import useAuthCheck from "../../../hooks/useAuthCheck";
import { useSelector, useDispatch } from "react-redux";
import { setUser } from "../../../store/slices/authSlice";

export default function Login() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { theme } = useTheme();
  const { isLoading, isAuthenticated } = useAuthCheck();
  const settings = useSelector((state) => state.settings?.settings);
  const appName = settings?.appName || "StockPilot";
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });
  const [errors, setErrors] = useState({});
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [lockoutTime, setLockoutTime] = useState(0);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [showAccountRecovery, setShowAccountRecovery] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState("");
  const [publicStats, setPublicStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    uptimePercentage: 99.9,
    supportAvailable: true
  });
  const [statsLoading, setStatsLoading] = useState(true);

  const maxLoginAttempts =
    useSelector(
      (state) => state.settings.settings?.securitySettings?.loginAttempts
    ) || 5;

  const settingsLoading = useSelector((state) => state.settings.loading);

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

  // Fetch public statistics for the hero section
  useEffect(() => {
    const fetchPublicStats = async () => {
      setStatsLoading(true);
      try {
        const response = await settingsAPI.getPublicStats();
        setPublicStats(response.data.data);
      } catch (error) {
                // Keep default values if API fails - don't show error to user
        // This prevents the login page from blinking or showing errors
        setPublicStats({
          totalUsers: 0,
          activeUsers: 0,
          uptimePercentage: 99.9,
          supportAvailable: true
        });
      } finally {
        setStatsLoading(false);
      }
    };

    // Only fetch if not already authenticated to avoid unnecessary calls
    if (!isAuthenticated) {
      fetchPublicStats();
    } else {
      setStatsLoading(false);
    }
  }, [isAuthenticated]);

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
    if (!email) return { isValid: false, error: null };
    
    // Check for basic format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return { isValid: false, error: "Please enter a valid email address" };
    }
    
    // Check for common issues
    if (email.includes('..')) {
      return { isValid: false, error: "Email cannot contain consecutive dots" };
    }
    if (email.startsWith('.') || email.endsWith('.')) {
      return { isValid: false, error: "Email cannot start or end with a dot" };
    }
    if (email.includes(' ')) {
      return { isValid: false, error: "Email cannot contain spaces" };
    }
    
    const parts = email.split('@');
    if (parts.length !== 2) {
      return { isValid: false, error: "Invalid email format" };
    }
    
    const [localPart, domain] = parts;
    if (localPart.length === 0 || localPart.length > 64) {
      return { isValid: false, error: "Invalid email format" };
    }
    if (domain.length === 0 || domain.length > 255) {
      return { isValid: false, error: "Invalid email domain" };
    }
    if (!domain.includes('.')) {
      return { isValid: false, error: "Email domain must contain a dot" };
    }
    
    return { isValid: true, error: null };
  };

  const validatePassword = (password) => {
    if (!password) return { isValid: false, error: null };
    
    if (password.length < 6) {
      return { isValid: false, error: "Password must be at least 6 characters" };
    }
    if (password.length > 128) {
      return { isValid: false, error: "Password is too long (max 128 characters)" };
    }
    
    return { isValid: true, error: null };
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Validate email
    if (!formData.email) {
      newErrors.email = "Email is required";
    } else {
      const emailValidation = validateEmail(formData.email.trim());
      if (!emailValidation.isValid && emailValidation.error) {
        newErrors.email = emailValidation.error;
      }
    }
    
    // Validate password
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else {
      const passwordValidation = validatePassword(formData.password);
      if (!passwordValidation.isValid && passwordValidation.error) {
        newErrors.password = passwordValidation.error;
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Update form data with raw value (don't transform while typing)
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    // Real-time validation as user types (but don't transform yet)
    if (name === 'email' && value) {
      // Validate with trimmed/lowercased version but don't update the displayed value
      const normalizedEmail = value.trim().toLowerCase();
      const emailValidation = validateEmail(normalizedEmail);
      if (!emailValidation.isValid && emailValidation.error) {
        setErrors((prev) => ({ ...prev, email: emailValidation.error }));
      } else {
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors.email;
          return newErrors;
        });
      }
    } else if (name === 'password' && value) {
      const passwordValidation = validatePassword(value);
      if (!passwordValidation.isValid && passwordValidation.error) {
        setErrors((prev) => ({ ...prev, password: passwordValidation.error }));
      } else {
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors.password;
          return newErrors;
        });
      }
    } else {
      // Clear error if field is being edited
      if (errors[name]) {
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors[name];
          return newErrors;
        });
      }
    }
  };

  // Add blur handler for final sanitization
  const handleInputBlur = (e) => {
    const { name, value } = e.target;
    
    if (name === 'email') {
      // Sanitize email on blur (trim and lowercase)
      const sanitized = value.trim().toLowerCase();
      setFormData((prev) => ({ ...prev, email: sanitized }));
      
      // Validate the sanitized value
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
    }
  };

  const handleRememberMeChange = (checked) => {
    setFormData((prev) => ({ ...prev, rememberMe: checked }));
    if (checked) {
      localStorage.setItem("rememberedEmail", formData.email);
    } else {
      localStorage.removeItem("rememberedEmail");
    }
  };

  const handleOpenForgotPassword = (email = "") => {
    setForgotPasswordEmail(email);
    setShowAccountRecovery(false);
    setShowForgotPassword(true);
  };

  const handleOpenAccountRecovery = () => {
    setShowForgotPassword(false);
    setShowAccountRecovery(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isLocked) return;
    if (!validateForm()) return;

    setErrors({});

    try {
      // Always normalize email before sending to backend
      const normalizedEmail = formData.email.trim().toLowerCase();
      
      const response = await authAPI.login({
        email: normalizedEmail,
        password: formData.password,
      });

      const data = response.data;

      // Store token and user info
      if (formData.rememberMe) {
        localStorage.setItem("rememberedEmail", normalizedEmail);
      } else {
        localStorage.removeItem("rememberedEmail");
      }

      localStorage.setItem("authToken", data.token);
      localStorage.setItem("userRole", data.user.role);
      localStorage.setItem("userName", data.user.email);
      localStorage.setItem("userEmail", data.user.email);
      
      // Store additional profile data
      localStorage.setItem("firstName", data.user.firstName || "");
      localStorage.setItem("lastName", data.user.lastName || "");
      localStorage.setItem("phone", data.user.phone || "");
      localStorage.setItem("userAvatar", data.user.profilePicture || "");
      localStorage.setItem("userJoinDate", data.user.createdAt || new Date().toISOString());
      localStorage.setItem("userLastLogin", data.user.lastLoginAt || new Date().toISOString());

      // Update Redux auth state immediately
      dispatch(setUser({
        firstName: data.user.firstName || "",
        lastName: data.user.lastName || "",
        name: data.user.firstName && data.user.lastName 
          ? `${data.user.firstName} ${data.user.lastName}`.trim()
          : data.user.email,
        email: data.user.email,
        avatar: data.user.profilePicture || "",
        role: data.user.role,
        phone: data.user.phone || ""
      }));

      setShowSuccessMessage(true);
      showSuccessNotification(
        "Login Successful",
        `Welcome back, ${data.user.firstName || data.user.email}! Redirecting to dashboard...`,
        2000
      );
      
      // Navigate immediately with replace to prevent blink
      setTimeout(() => {
        switch (data.user.role) {
          case "admin":
            navigate("/dashboard", { replace: true });
            break;
          default:
            navigate("/", { replace: true });
        }
      }, 100);
    } catch (error) {
      // Extract error message from response
      const errorMessage = error.response?.data?.message || error.message || "Login failed";
      const errorStatus = error.response?.status;
      const validationErrors = error.response?.data?.errors;

      // Handle validation errors
      if (validationErrors && Array.isArray(validationErrors)) {
        const fieldErrors = {};
        validationErrors.forEach(err => {
          fieldErrors[err.field] = err.message;
        });
        setErrors(fieldErrors);
        showError(
          "Validation Error",
          "Please check your input and try again.",
          4000
        );
        return;
      }

      // Only increment attempts if credentials are actually invalid (401 or 404)
      const isAuthenticationError = (errorStatus === 401 || errorStatus === 404) &&
        (errorMessage.toLowerCase().includes("invalid credentials") ||
         errorMessage.toLowerCase().includes("user not found") ||
         errorMessage.toLowerCase().includes("invalid email"));

      if (isAuthenticationError) {
        const newAttempts = loginAttempts + 1;
        setLoginAttempts(newAttempts);

        if (newAttempts >= maxLoginAttempts) {
          setIsLocked(true);
          setLockoutTime(60);
          setErrors({
            general: `Too many failed attempts. Account locked for 60 seconds.`,
          });
          showError(
            "Account Locked",
            "Too many failed login attempts. Your account is locked for 60 seconds.",
            5000
          );
        } else {
          setErrors({
            general: `Invalid credentials. ${
              maxLoginAttempts - newAttempts
            } attempts remaining.`,
          });
          showError(
            "Invalid Credentials",
            `Invalid email or password. ${maxLoginAttempts - newAttempts} attempts remaining.`,
            4000
          );
        }
      } else {
        // Handle other errors (network, server, etc.)
        setErrors({
          general: errorMessage || "Login failed. Please try again.",
        });
        showError(
          "Login Failed",
          errorMessage || "Unable to log in. Please check your connection and try again.",
          4000
        );
      }
    }
  };

  const reduxAuth = useSelector((state) => state.auth.isAuthenticated);

  // Redirect if already authenticated (check both useAuthCheck and Redux)
  useEffect(() => {
    if ((!isLoading && isAuthenticated) || reduxAuth) {
      if (window.location.pathname !== "/dashboard") {
        navigate("/dashboard", { replace: true });
      }
    }
  }, [isLoading, isAuthenticated, reduxAuth, navigate]);

  // Prevent rendering login form if already authenticated
  if ((!isLoading && isAuthenticated) || reduxAuth) {
    return null;
  }

  if (settingsLoading) {
    return (
      <div className="flex items-center justify-center h-screen text-lg">
        Loading settings...
      </div>
    );
  }

  return (
    <div
      className={`h-screen flex flex-col overflow-hidden ${
        theme === "dark"
          ? "bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900"
          : "bg-gradient-to-br from-gray-50 via-white to-blue-50"
      }`}
    >
      {/* Enhanced Header */}
      <header className="flex-shrink-0 relative z-10">
        <div
          className={`flex items-center justify-between px-6 py-4 ${
            theme === "dark"
              ? "bg-gray-900/95 backdrop-blur-md border-b border-gray-700/50"
              : "bg-white/95 backdrop-blur-md border-b border-gray-200/50"
          }`}
        >
          <div className="flex items-center gap-3">
            <Logo size="small" showText={false} showStatus={true} />
            <div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent dark:from-blue-400 dark:to-blue-200">
                {appName}
              </span>
              <div className="text-sm text-gray-600 dark:text-gray-400 font-medium hidden sm:block">
                Business Management Platform
              </div>
            </div>
          </div>

          {/* Enhanced Status Indicator */}
          <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 dark:bg-green-900/20 rounded-full border border-green-200 dark:border-green-800">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-semibold text-green-700 dark:text-green-400">
              System Online
            </span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex min-h-0 overflow-y-auto">
        {/* Left Side - Enhanced Login Form */}
        <div className="flex-1 flex items-center justify-center p-4 sm:p-6 min-h-full">
          <div className="w-full max-w-md my-8">
            {/* Enhanced Form Container */}
            <div
              className={`relative p-6 sm:p-8 rounded-3xl shadow-2xl ${
                theme === "dark"
                  ? "bg-gray-800/95 backdrop-blur-md border border-gray-700/50"
                  : "bg-white/95 backdrop-blur-md border border-gray-200/50"
              }`}
            >
              {/* Enhanced Decorative Elements */}
              <div className="absolute -top-3 -right-3 w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full opacity-30 animate-pulse"></div>
              <div className="absolute -bottom-3 -left-3 w-6 h-6 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full opacity-30 animate-pulse delay-1000"></div>
              <div className="absolute top-1/2 -right-2 w-4 h-4 bg-gradient-to-br from-green-500 to-green-600 rounded-full opacity-20 animate-pulse delay-500"></div>

              <div className="relative z-10">
                {/* Enhanced Header */}
                <div className="text-center mb-6">
                  <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mx-auto mb-3 shadow-lg ring-2 ring-blue-100 dark:ring-blue-900/30">
                    <Shield className="h-7 w-7 text-white" />
                  </div>
                  <h1
                    className={`text-2xl font-bold mb-1 ${
                      theme === "dark" ? "text-white" : "text-gray-900"
                    }`}
                  >
                    Welcome Back
                  </h1>
                  <p
                    className={`text-sm ${
                      theme === "dark" ? "text-gray-400" : "text-gray-600"
                    }`}
                  >
                    Sign in to access your dashboard
                  </p>
                </div>

                {/* Login Form */}
                <LoginForm
                  formData={formData}
                  onInputChange={handleInputChange}
                  onInputBlur={handleInputBlur}
                  onSubmit={handleSubmit}
                  onRememberMeChange={handleRememberMeChange}
                  onForgotPasswordClick={() => handleOpenForgotPassword()}
                  errors={errors}
                  isLoading={isLoading}
                  isLocked={isLocked}
                  lockoutTime={lockoutTime}
                  showSuccess={showSuccessMessage}
                  maxLoginAttempts={maxLoginAttempts}
                  loginAttempts={loginAttempts}
                />

                {/* Enhanced Footer */}
                <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                      <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse delay-300"></div>
                      <div className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-pulse delay-700"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Enhanced Hero Section */}
        <div className="hidden lg:flex flex-1 relative overflow-hidden">
          {/* Enhanced Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900">
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1551434678-e076c223a692?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80')] bg-cover bg-center opacity-70"></div>
            <div className="absolute inset-0 bg-gradient-to-br from-blue-900/50 via-blue-800/70 to-indigo-900/90"></div>
          </div>

          {/* Enhanced Animated Background Elements */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-20 left-20 w-32 h-32 bg-blue-500/20 rounded-full blur-2xl animate-pulse"></div>
            <div className="absolute bottom-20 right-20 w-40 h-40 bg-purple-500/20 rounded-full blur-2xl animate-pulse delay-1000"></div>
            <div className="absolute top-1/2 left-1/3 w-28 h-28 bg-indigo-500/20 rounded-full blur-2xl animate-pulse delay-500"></div>
            <div className="absolute top-1/4 right-1/4 w-24 h-24 bg-green-500/15 rounded-full blur-xl animate-pulse delay-700"></div>
          </div>

          {/* Enhanced Content */}
          <div className="relative z-10 flex items-center justify-center w-full">
            <div className="text-center max-w-lg mx-auto px-6 py-8">
              {/* Enhanced Icon */}
              <div className="mb-6 relative">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-xl ring-2 ring-blue-400/30">
                  <Star className="h-8 w-8 text-white" />
                </div>
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg">
                  <Zap className="h-3 w-3 text-white" />
                </div>
                <div className="absolute -bottom-2 -left-2 w-5 h-5 bg-gradient-to-br from-green-400 to-green-500 rounded-full flex items-center justify-center shadow-lg">
                  <TrendingUp className="h-2.5 w-2.5 text-white" />
                </div>
              </div>

              {/* Enhanced Text */}
              <h2 className="text-3xl font-bold mb-3 text-white drop-shadow-2xl">
                <span className="bg-gradient-to-r from-blue-300 to-blue-100 bg-clip-text text-transparent">
                  Smart Inventory
                </span>
                <br />
                <span className="text-white">Management</span>
              </h2>

              <p className="text-base font-medium text-blue-100 mb-6 leading-relaxed">
                Streamline your warehouse operations with advanced tracking and
                analytics platform.
              </p>

              {/* Enhanced Stats */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="text-center">
                  <div className="text-xl font-bold text-white mb-1">
                    {statsLoading ? '...' : (publicStats.totalUsers > 0 ? `${publicStats.totalUsers}+` : 'New')}
                  </div>
                  <div className="text-xs text-blue-200 font-medium">
                    {statsLoading ? 'Loading...' : (publicStats.totalUsers > 0 ? 'Users' : 'Platform')}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold text-white mb-1">
                    {statsLoading ? '...' : `${publicStats.uptimePercentage}%`}
                  </div>
                  <div className="text-xs text-blue-200 font-medium">Uptime</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold text-white mb-1">
                    {statsLoading ? '...' : (publicStats.supportAvailable ? '24/7' : 'Limited')}
                  </div>
                  <div className="text-xs text-blue-200 font-medium">Support</div>
                </div>
              </div>

              {/* Enhanced User Avatars */}
              <div className="flex items-center justify-center gap-2 mb-3">
                <div className="flex -space-x-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-blue-700 border-2 border-blue-900 flex items-center justify-center shadow-lg">
                    <Users className="h-4 w-4 text-white" />
                  </div>
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-500 to-green-600 border-2 border-blue-900 flex items-center justify-center shadow-lg">
                    <span className="text-xs font-bold text-white">12</span>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 border-2 border-blue-900 flex items-center justify-center shadow-lg"></div>
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-500 to-pink-600 border-2 border-blue-900 flex items-center justify-center shadow-lg"></div>
                </div>
              </div>

              <p className="text-blue-200 text-xs font-medium">
                {statsLoading ? 'Loading...' : (publicStats.totalUsers > 0 ? 
                  `Join ${publicStats.totalUsers}+ businesses managing inventory efficiently` :
                  'Be among the first to streamline your inventory management'
                )}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Footer */}
      <footer className="flex-shrink-0 relative z-10">
        <div
          className={`${
            theme === "dark"
              ? "bg-gray-900/95 backdrop-blur-md border-t border-gray-800/50"
              : "bg-gray-900/95 backdrop-blur-md border-t border-gray-800/50"
          } py-4 sm:py-6`}
        >
          <div className="container mx-auto px-6 sm:px-8 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Logo size="small" showText={false} showStatus={false} />
              <div>
                <span className="text-base sm:text-lg font-bold text-white">
                  {appName.split(' ')[0]}<span className="text-blue-400">{appName.split(' ').slice(1).join(' ')}</span>
                </span>
                <div className="text-sm text-gray-400 hidden sm:block">
                  v2.1.0
                </div>
              </div>
            </div>


            <div className="flex items-center gap-3">
              {/* LinkedIn Icon */}
              <a
                href="https://www.linkedin.com/in/zekariastamiru"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors duration-200 p-2 rounded-lg hover:bg-gray-800/50"
                title="Connect on LinkedIn"
              >
                <svg
                  className="h-5 w-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
              </a>
              
              {/* Email Icon */}
              <a
                href="mailto:zekariastamiru12@gmail.com"
                className="text-gray-400 hover:text-white transition-colors duration-200 p-2 rounded-lg hover:bg-gray-800/50"
                title="Send Email"
              >
                <svg
                  className="h-5 w-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
                </svg>
              </a>
              
              {/* GitHub Icon */}
              <a
                href="https://github.com/zacktam12"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors duration-200 p-2 rounded-lg hover:bg-gray-800/50"
                title="View GitHub Profile"
              >
                <svg
                  className="h-5 w-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
              </a>
            </div>
          </div>
        </div>
      </footer>

      {/* Forgot Password Modal */}
      {showForgotPassword && (
        <ForgotPasswordModal
          onClose={() => setShowForgotPassword(false)}
          onOpenAccountRecovery={handleOpenAccountRecovery}
          initialEmail={forgotPasswordEmail}
        />
      )}

      {/* Account Recovery Modal */}
      {showAccountRecovery && (
        <AccountRecoveryModal
          onClose={() => setShowAccountRecovery(false)}
          onOpenForgotPassword={handleOpenForgotPassword}
        />
      )}
    </div>
  );
}
