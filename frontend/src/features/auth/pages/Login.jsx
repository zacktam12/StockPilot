"use client";

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Package, Star, Users } from "lucide-react";
import { toast, Toaster } from "react-hot-toast";

import { useTheme } from "../../../components/ThemeProvider";
import LoginForm from "../components/LoginForm";
import ForgotPasswordModal from "../modals/ForgotPasswordModal";
import AccountRecoveryModal from "../modals/AccountRecoveryModal";
import useAuthCheck from "../../../hooks/useAuthCheck";

// Backend API configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
const LOGIN_ENDPOINT = `${API_BASE_URL}/api/auth/login`;

export default function Login() {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const { isLoading, isAuthenticated } = useAuthCheck();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });
  const [errors, setErrors] = useState({});
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [lockoutTime, setLockoutTime] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [showAccountRecovery, setShowAccountRecovery] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState("");

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
      const response = await fetch(LOGIN_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: normalizedEmail,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Only show backend error if present, otherwise fallback
        throw new Error(data.message || "Login failed");
      }

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

      setShowSuccess(true);
      toast.success("Login successful! Redirecting...");
      setTimeout(() => {
        switch (data.user.role) {
          case "admin":
            navigate("/dashboard");
            break;
          default:
            navigate("/");
        }
      }, 200);
    } catch (error) {
      // Only increment attempts if credentials are actually invalid
      if (
        error.message &&
        (error.message.toLowerCase().includes("invalid credentials") ||
          error.message.toLowerCase().includes("user not found"))
      ) {
        const newAttempts = loginAttempts + 1;
        setLoginAttempts(newAttempts);

        if (newAttempts >= 5) {
          setIsLocked(true);
          setLockoutTime(60);
          setErrors({
            general: "Too many failed attempts. Account locked for 60 seconds.",
          });
          toast.error(
            "Too many failed attempts. Account locked for 60 seconds."
          );
        } else {
          setErrors({
            general: `Invalid credentials. ${
              5 - newAttempts
            } attempts remaining.`,
          });
          toast.error(
            `Invalid credentials. ${5 - newAttempts} attempts remaining.`
          );
        }
      } else {
        setErrors({
          general: error.message || "Login failed. Please try again.",
        });
        toast.error(error.message || "Login failed. Please try again.");
      }
    }
  };

  // Redirect if already authenticated
  if (!isLoading && isAuthenticated) {
    navigate("/dashboard", { replace: true });
    return null;
  }

  return (
    <div
      className={`min-h-screen flex flex-col ${
        theme === "dark" ? "bg-gray-900" : "bg-white"
      }`}
      style={{ height: "100vh", overflow: "hidden" }}
    >
      <Toaster
        position="top-center"
        reverseOrder={false}
        toastOptions={{
          style: {
            fontFamily: "inherit",
            borderRadius: "8px",
            fontWeight: 500,
          },
          success: {
            style: {
              color: "#16a34a", // Tailwind green-600
              background: "#f0fdf4", // Tailwind green-50
              border: "1px solid #bbf7d0", // Tailwind green-200
            },
            iconTheme: {
              primary: "#16a34a",
              secondary: "#f0fdf4",
            },
          },
          error: {
            style: {
              color: "#dc2626", // Tailwind red-600
              background: "#fef2f2", // Tailwind red-50
              border: "1px solid #fecaca", // Tailwind red-200
            },
            iconTheme: {
              primary: "#dc2626",
              secondary: "#fef2f2",
            },
          },
        }}
      />
      {/* Header */}
      <header
        className={`flex items-center justify-between p-6 ${
          theme === "dark" ? "bg-gray-800 text-white" : "bg-gray-900 text-white"
        }`}
      >
        <div className="flex items-center gap-2">
          <Package className="h-8 w-8 text-blue-800" />
          <span className="text-2xl font-bold">
            Stock<span className="text-blue-800">Pilot</span>
          </span>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex min-h-0">
        {/* Left Side - Login Form */}
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="w-full max-w-xs">
            <div className="mb-6">
              <h1
                className={`text-3xl text-center font-bold mb-2 ${
                  theme === "dark" ? "text-white" : "text-gray-900"
                }`}
              >
                Login
              </h1>
              <p
                className={`text-base text-center ${
                  theme === "dark" ? "text-gray-400" : "text-gray-800"
                }`}
              >
                Access your inventory management system
              </p>
            </div>
            {/* Forgot */}
            <LoginForm
              formData={formData}
              onInputChange={handleInputChange}
              onSubmit={handleSubmit}
              onRememberMeChange={handleRememberMeChange}
              onForgotPasswordClick={() => handleOpenForgotPassword()}
              errors={errors}
              isLoading={isLoading}
              isLocked={isLocked}
              lockoutTime={lockoutTime}
              showSuccess={showSuccess}
            />
          </div>
        </div>

        {/* Right Side - Hero Section */}
        <div className="hidden lg:flex flex-1 bg-gradient-to-br from-blue-900 to-gray-900 text-white items-center justify-center p-0 relative overflow-hidden">
          {/* Background Image with Opacity */}
          <div
            className="absolute inset-0 bg-cover bg-center opacity-90"
            style={{
              backgroundImage:
                "url('https://images.unsplash.com/photo-1551434678-e076c223a692?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80')",
            }}
          ></div>
          {/* Overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 to-gray-900/90"></div>
          {/* Content Overlay */}
          <div className="relative z-10 text-center max-w-md mx-auto px-4 py-8">
            <div className="mb-4 relative">
              <Star className="h-10 w-10 text-blue-800 mx-auto mb-2 drop-shadow-lg" />
              <Star className="h-5 w-5 text-blue-800 absolute top-6 right-10 opacity-70" />
              <Star className="h-3 w-3 text-blue-800 absolute top-16 left-8 opacity-50" />
            </div>
            <h2 className="text-2xl font-bold mb-2 drop-shadow">
              <span className="text-blue-800">Smart Inventory</span>
              <br />
              Management System
            </h2>
            <p className="text-base font-medium text-white mb-4">
              Streamline your warehouse operations with our advanced tracking
              and analytics platform.
            </p>
            <div className="flex items-center justify-center gap-2 mb-2">
              <div className="flex -space-x-2">
                <div className="w-8 h-8 rounded-full bg-blue-700 border-2 border-white flex items-center justify-center">
                  <Users className="h-4 w-4 text-white" />
                </div>
                <div className="w-8 h-8 rounded-full bg-blue-500 border-2 border-white">
                  12
                </div>
                <div className="w-8 h-8 rounded-full bg-green-600 border-2 border-white"></div>
                <div className="w-8 h-8 rounded-full bg-purple-700 border-2 border-white"></div>
                <div className="w-8 h-8 rounded-full bg-pink-700 border-2 border-white"></div>
              </div>
            </div>
            <p className="text-white text-sm">
              Join <span className="font-bold text-white">10,000+</span>{" "}
              businesses managing their inventory efficiently
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer
        className={`${
          theme === "dark" ? "bg-gray-900 text-white" : "bg-gray-900 text-white"
        } py-6`}
      >
        <div className="container mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Package className="h-6 w-6 text-blue-800" />
            <span className="text-lg font-semibold">
              Stock<span className="text-blue-800">Pilot</span>
            </span>
          </div>

          <div className="hidden md:flex items-center gap-6 text-sm text-gray-400">
            <a href="#" className="hover:text-white transition-colors">
              About Us
            </a>
            <a href="#" className="hover:text-white transition-colors">
              Privacy Policy
            </a>
            <a href="#" className="hover:text-white transition-colors">
              Terms of Service
            </a>
          </div>

          <div className="flex items-center gap-4">
            <a
              href="#"
              className="text-gray-400 hover:text-white transition-colors"
            >
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" />
              </svg>
            </a>
            <a
              href="#"
              className="text-gray-400 hover:text-white transition-colors"
            >
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M22.46 6c-.77.35-1.6.58-2.46.69.88-.53 1.56-1.37 1.88-2.38-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29 0 .34.04.67.11.98C8.28 9.09 5.11 7.38 3 4.79c-.37.63-.58 1.37-.58 2.15 0 1.49.75 2.81 1.91 3.56-.71 0-1.37-.2-1.95-.5v.03c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 0 1-1.93.07 4.28 4.28 0 0 0 4 2.98 8.521 8.521 0 0 1-5.33 1.84c-.34 0-.68-.02-1.02-.06C3.44 20.29 5.7 21 8.12 21 16 21 20.33 14.46 20.33 8.79c0-.19 0-.37-.01-.56.84-.6 1.56-1.36 2.14-2.23z" />
              </svg>
            </a>
            <a
              href="#"
              className="text-gray-400 hover:text-white transition-colors"
            >
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
              </svg>
            </a>
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
