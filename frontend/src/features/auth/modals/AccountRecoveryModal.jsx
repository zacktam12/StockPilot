"use client";

import { useState, useRef } from "react";
import { ArrowLeft, User, MessageSquare, X } from "lucide-react";
import Button from "../../../components/shared/Button";
import Input from "../../../components/shared/Input";
import Card from "../../../components/shared/Card";
import Spinner from "../../../components/shared/Spinner";
import { useTheme } from "../../../components/ThemeProvider";
import { authAPI } from "../../../services/api";
import { useOutsideClick } from "../../../hooks/useOutsideClick";
import { showError, showSuccess } from "../../../services/notificationService";
import {
  validateEmail,
  validateEmployeeId,
  validatePhone,
  sanitizePhone,
  validateName,
  sanitizeEmail
} from "../../../utils/authValidation";
import { useForm, ValidationError } from '@formspree/react';

export default function AccountRecoveryModal({
  onClose,
  onOpenForgotPassword,
}) {
  const [activeTab, setActiveTab] = useState("employee-id");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { theme } = useTheme();
  const [errors, setErrors] = useState({});
  
  // Formspree hook for admin contact form
  const [state, handleSubmit] = useForm("mqayyqyl"); // Using the same Formspree ID as landing page

  // Add outside click functionality
  const modalRef = useRef(null);
  useOutsideClick(modalRef, () => {
    if (onClose) onClose();
  });

  // Employee ID Recovery
  const [employeeId, setEmployeeId] = useState("");
  const [foundUser, setFoundUser] = useState(null);

  // Admin Contact
  const [contactForm, setContactForm] = useState({
    firstName: "",
    lastName: "",
    employeeId: "",
    phone: "",
    lastKnownEmail: "",
    reason: "",
    additionalInfo: "",
  });

  // Employee ID change handler with validation
  const handleEmployeeIdChange = (e) => {
    const value = e.target.value;
    setEmployeeId(value);
    
    // Real-time validation
    if (value) {
      const validation = validateEmployeeId(value);
      if (!validation.isValid && validation.error) {
        setErrors((prev) => ({ ...prev, employeeId: validation.error }));
      } else {
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors.employeeId;
          return newErrors;
        });
      }
    } else {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.employeeId;
        return newErrors;
      });
    }
  };

  // Contact form change handler with validation
  const handleContactFormChangeWithValidation = (field, value) => {
    // Sanitize phone input
    if (field === 'phone') {
      value = sanitizePhone(value);
    }
    
    setContactForm((prev) => ({ ...prev, [field]: value }));
    
    // Real-time validation
    if (value) {
      let validation = { isValid: true, error: null };
      
      switch (field) {
        case 'firstName':
          validation = validateName(value, "First name");
          break;
        case 'lastName':
          validation = validateName(value, "Last name");
          break;
        case 'employeeId':
          validation = validateEmployeeId(value);
          break;
        case 'phone':
          validation = validatePhone(value);
          break;
        case 'lastKnownEmail':
          validation = validateEmail(value);
          break;
        default:
          break;
      }
      
      if (!validation.isValid && validation.error) {
        setErrors((prev) => ({ ...prev, [field]: validation.error }));
      } else {
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors[field];
          return newErrors;
        });
      }
    } else {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  // Email blur handler for contact form
  const handleEmailBlur = () => {
    if (contactForm.lastKnownEmail) {
      const sanitized = sanitizeEmail(contactForm.lastKnownEmail);
      setContactForm((prev) => ({ ...prev, lastKnownEmail: sanitized }));
      
      const validation = validateEmail(sanitized);
      if (!validation.isValid && validation.error) {
        setErrors((prev) => ({ ...prev, lastKnownEmail: validation.error }));
      }
    }
  };

  const handleEmployeeIdRecovery = async (e) => {
    e.preventDefault();
    
    // Validate before submitting
    const validation = validateEmployeeId(employeeId);
    if (!validation.isValid) {
      setErrors({ employeeId: validation.error || "Invalid Employee ID" });
      showError("Validation Error", validation.error || "Invalid Employee ID", 3000);
      return;
    }
    
    setIsLoading(true);
    setFoundUser(null);
    setErrors({});
    try {
      // Call backend API to verify employee ID
      const response = await authAPI.verifyEmployeeId(employeeId);
      if (response && response.data && response.data.user) {
        setFoundUser(response.data.user);
        setIsSuccess(true);
        showSuccess(
          "Account Found!",
          `Email: ${response.data.user.email}. You can now reset your password.`,
          4000
        );
      } else {
        const errorMessage = response?.data?.message || "Employee ID not found. Please check your ID or contact your administrator.";
        showError(
          "Employee ID Not Found",
          errorMessage,
          5000
        );
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || "System error occurred. Please try again.";
      showError(
        "System Error",
        errorMessage,
        5000
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdminContact = async (e) => {
    e.preventDefault();
    
    // Validate all fields
    const newErrors = {};
    
    // Validate required fields
    const firstNameValidation = validateName(contactForm.firstName, "First name");
    if (!firstNameValidation.isValid && firstNameValidation.error) {
      newErrors.firstName = firstNameValidation.error;
    }
    
    const lastNameValidation = validateName(contactForm.lastName, "Last name");
    if (!lastNameValidation.isValid && lastNameValidation.error) {
      newErrors.lastName = lastNameValidation.error;
    }
    
    const phoneValidation = validatePhone(contactForm.phone);
    if (!phoneValidation.isValid && phoneValidation.error) {
      newErrors.phone = phoneValidation.error;
    }
    
    if (!contactForm.reason) {
      newErrors.reason = "Please select a reason";
    }
    
    // Validate optional email if provided
    if (contactForm.lastKnownEmail) {
      const emailValidation = validateEmail(contactForm.lastKnownEmail);
      if (!emailValidation.isValid && emailValidation.error) {
        newErrors.lastKnownEmail = emailValidation.error;
      }
    }
    
    // Validate optional employee ID if provided
    if (contactForm.employeeId) {
      const empIdValidation = validateEmployeeId(contactForm.employeeId);
      if (!empIdValidation.isValid && empIdValidation.error) {
        newErrors.employeeId = empIdValidation.error;
      }
    }
    
    // If there are errors, show them and stop
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      const firstError = Object.values(newErrors)[0];
      showError("Validation Error", firstError, 3000);
      return;
    }
    
    // Use Formspree to submit the form
    try {
      // Prepare the data for Formspree
      const formData = {
        firstName: contactForm.firstName,
        lastName: contactForm.lastName,
        employeeId: contactForm.employeeId || 'Not provided',
        phone: contactForm.phone,
        email: contactForm.lastKnownEmail || 'Not provided',
        reason: contactForm.reason,
        additionalInfo: contactForm.additionalInfo || 'Not provided',
        message: `Account Recovery Request from ${contactForm.firstName} ${contactForm.lastName}`,
        _subject: `StockPilot Account Recovery Request - ${contactForm.reason}`,
        _replyto: contactForm.lastKnownEmail || contactForm.phone
      };

      // Submit to Formspree
      await handleSubmit(formData);
      
      if (state.succeeded) {
        setIsSuccess(true);
        showSuccess(
          "Request Submitted!",
          "An administrator will contact you within 24 hours.",
          4000
        );
      }
    } catch (error) {
      showError(
        "Request Failed",
        "Failed to send request. Please try again.",
        5000
      );
    }
  };


  const handleFoundUserPasswordReset = () => {
    onClose();
    if (onOpenForgotPassword) {
      onOpenForgotPassword(foundUser.email);
    }
  };

  const TabButton = ({ id, label, icon: Icon, isActive, onClick }) => (
    <button
      type="button"
      onClick={() => onClick(id)}
      className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-semibold rounded-xl transition-all duration-200 ${
        isActive
          ? theme === "dark"
            ? "bg-blue-600 text-white shadow-md"
            : "bg-blue-600 text-white shadow-md"
          : theme === "dark"
          ? "bg-gray-700/50 text-gray-300 hover:bg-gray-600/50"
          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
      }`}
    >
      <Icon className="h-4 w-4" />
      {label}
    </button>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div ref={modalRef} className="w-full max-w-2xl mx-4">
        <Card
          className={
            theme === "dark"
              ? "bg-gray-800/95 border-gray-700 shadow-2xl"
              : "bg-white/95 border-gray-200 shadow-2xl"
          }
        >
          <div className="p-8 max-h-[90vh] flex flex-col justify-between">
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
                    Account Recovery
                  </h2>
                  <p
                    className={`text-base ${
                      theme === "dark" ? "text-gray-400" : "text-gray-600"
                    }`}
                  >
                    Multiple ways to recover your account access
                  </p>
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
            {/* back */}
            {/* Only one scrollable area for all modal content */}
            <div className="space-y-6 flex-1 overflow-y-auto">
              {isSuccess ? (
                <div className="space-y-4 text-center">
                  <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-6">
                    <div className="flex items-center justify-center w-12 h-12 bg-green-100 dark:bg-green-800/30 rounded-full mx-auto mb-4">
                      <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-green-800 dark:text-green-200 mb-2">
                      {foundUser ? "Account Found!" : "Request Submitted!"}
                    </h3>
                    <p className="text-sm text-green-700 dark:text-green-300">
                      {foundUser ? (
                        <>Email: <strong>{foundUser.email}</strong></>
                      ) : (
                        "An administrator will contact you within 24 hours."
                      )}
                    </p>
                  </div>

                  {foundUser && (
                    <div className="space-y-3">
                      <Button
                        onClick={handleFoundUserPasswordReset}
                        variant="primary"
                        size="md"
                        className="w-full"
                      >
                        Reset Password for This Account
                      </Button>
                      <Button
                        onClick={() => {
                          setIsSuccess(false);
                          setFoundUser(null);
                          setEmployeeId("");
                          setActiveTab("employee-id");
                        }}
                        variant="outline"
                        size="md"
                        className="w-full"
                      >
                        Try Another Method
                      </Button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Tab Navigation */}
                  <div
                    className={`flex gap-2 p-1.5 rounded-xl ${
                      theme === "dark" ? "bg-gray-700/50" : "bg-gray-100"
                    }`}
                  >
                    <TabButton
                      id="employee-id"
                      label="Employee ID"
                      icon={User}
                      isActive={activeTab === "employee-id"}
                      onClick={setActiveTab}
                    />
                    <TabButton
                      id="admin"
                      label="Contact Admin"
                      icon={MessageSquare}
                      isActive={activeTab === "admin"}
                      onClick={setActiveTab}
                    />
                  </div>

                  {/* Tab Content */}
                  {activeTab === "employee-id" && (
                    <div className="space-y-4">
                      <div className="text-center space-y-2">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mx-auto shadow-lg">
                          <User className="h-6 w-6 text-white" />
                        </div>
                        <h3
                          className={`text-lg font-bold ${
                            theme === "dark" ? "text-white" : "text-gray-900"
                          }`}
                        >
                          Employee ID Recovery
                        </h3>
                        <p
                          className={`text-sm ${
                            theme === "dark"
                              ? "text-gray-400"
                              : "text-gray-600"
                          }`}
                        >
                          Enter your employee ID to find your account
                        </p>
                      </div>

                      <form
                        onSubmit={handleEmployeeIdRecovery}
                        className="space-y-4"
                      >
                        <div className="space-y-2">
                          <label
                            htmlFor="employeeId"
                            className={`text-sm font-semibold ${
                              theme === "dark"
                                ? "text-gray-200"
                                : "text-gray-700"
                            }`}
                          >
                            Employee ID
                          </label>
                          <Input
                            id="employeeId"
                            type="text"
                            placeholder="e.g., SP001, EMP001"
                            value={employeeId}
                            onChange={handleEmployeeIdChange}
                            className={`h-12 text-sm rounded-xl border-2 ${
                              errors.employeeId
                                ? "border-red-300 focus:border-red-500"
                                : theme === "dark"
                                ? "bg-gray-700/50 text-white placeholder:text-gray-300 border-gray-600 focus:border-gray-600 focus:bg-gray-700/50"
                                : "bg-gray-50 text-gray-900 placeholder:text-gray-400 border-gray-200 focus:border-gray-200 focus:bg-gray-50"
                            } focus:outline-none`}
                            required
                            disabled={isLoading}
                          />
                          {errors.employeeId && (
                            <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                              {errors.employeeId}
                            </p>
                          )}
                        </div>


                        <Button
                          type="submit"
                          variant="primary"
                          size="md"
                          className="w-full"
                          disabled={isLoading || !employeeId}
                        >
                          {isLoading ? (
                            <div className="flex items-center justify-center gap-2">
                              <Spinner size="sm" />
                              Searching...
                            </div>
                          ) : (
                            "Find My Account"
                          )}
                        </Button>
                      </form>
                    </div>
                  )}

                  {activeTab === "admin" && (
                    <div className="space-y-4">
                      <div className="text-center space-y-2">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mx-auto shadow-lg">
                          <MessageSquare className="h-6 w-6 text-white" />
                        </div>
                        <h3
                          className={`text-lg font-bold ${
                            theme === "dark" ? "text-white" : "text-gray-900"
                          }`}
                        >
                          Contact Administrator
                        </h3>
                        <p
                          className={`text-sm ${
                            theme === "dark"
                              ? "text-gray-400"
                              : "text-gray-600"
                          }`}
                        >
                          Request help from your system admin
                        </p>
                      </div>

                      <form onSubmit={handleAdminContact} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label
                              htmlFor="firstName"
                              className={`text-sm font-semibold ${
                                theme === "dark"
                                  ? "text-gray-200"
                                  : "text-gray-700"
                              }`}
                            >
                              First Name *
                            </label>
                            <Input
                              id="firstName"
                              type="text"
                              placeholder="e.g., John"
                              value={contactForm.firstName}
                              onChange={(e) =>
                                handleContactFormChangeWithValidation(
                                  "firstName",
                                  e.target.value
                                )
                              }
                              className={`h-12 text-sm rounded-xl border-2 transition-all duration-200 ${
                                errors.firstName
                                  ? "border-red-300 focus:border-red-500"
                                  : theme === "dark"
                                  ? "bg-gray-700/50 text-white placeholder:text-gray-300 border-gray-600 focus:border-blue-500 focus:bg-gray-700/70"
                                  : "bg-gray-50 text-gray-900 placeholder:text-gray-400 border-gray-200 focus:border-blue-500 focus:bg-white focus:shadow-lg"
                              } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                              required
                              disabled={isLoading}
                            />
                            {errors.firstName && (
                              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                                {errors.firstName}
                              </p>
                            )}
                            <ValidationError prefix="First Name" field="firstName" errors={state.errors} />
                          </div>
                          <div className="space-y-2">
                            <label
                              htmlFor="lastName"
                              className={`text-sm font-semibold ${
                                theme === "dark"
                                  ? "text-gray-200"
                                  : "text-gray-700"
                              }`}
                            >
                              Last Name *
                            </label>
                            <Input
                              id="lastName"
                              type="text"
                              placeholder="e.g., Doe"
                              value={contactForm.lastName}
                              onChange={(e) =>
                                handleContactFormChangeWithValidation(
                                  "lastName",
                                  e.target.value
                                )
                              }
                              className={`h-12 text-sm rounded-xl border-2 transition-all duration-200 ${
                                errors.lastName
                                  ? "border-red-300 focus:border-red-500"
                                  : theme === "dark"
                                  ? "bg-gray-700/50 text-white placeholder:text-gray-300 border-gray-600 focus:border-blue-500 focus:bg-gray-700/70"
                                  : "bg-gray-50 text-gray-900 placeholder:text-gray-400 border-gray-200 focus:border-blue-500 focus:bg-white focus:shadow-lg"
                              } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                              required
                              disabled={isLoading}
                            />
                            {errors.lastName && (
                              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                                {errors.lastName}
                              </p>
                            )}
                            <ValidationError prefix="Last Name" field="lastName" errors={state.errors} />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label
                              htmlFor="employeeIdContact"
                              className={`text-sm font-semibold ${
                                theme === "dark"
                                  ? "text-gray-200"
                                  : "text-gray-700"
                              }`}
                            >
                              Employee ID (if known)
                            </label>
                            <Input
                              id="employeeIdContact"
                              type="text"
                              placeholder="e.g., EMP-001"
                              value={contactForm.employeeId}
                              onChange={(e) =>
                                handleContactFormChangeWithValidation(
                                  "employeeId",
                                  e.target.value
                                )
                              }
                              className={`h-12 text-sm rounded-xl border-2 ${
                                errors.employeeId
                                  ? "border-red-300 focus:border-red-500"
                                  : theme === "dark"
                                  ? "bg-gray-700/50 text-white placeholder:text-gray-300 border-gray-600 focus:border-blue-500 focus:bg-gray-700/70"
                                  : "bg-gray-50 text-gray-900 placeholder:text-gray-400 border-gray-200 focus:border-blue-500 focus:bg-white focus:shadow-lg"
                              } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                              disabled={isLoading}
                            />
                            {errors.employeeId && (
                              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                                {errors.employeeId}
                              </p>
                            )}
                            <ValidationError prefix="Employee ID" field="employeeId" errors={state.errors} />
                          </div>
                          <div className="space-y-2">
                            <label
                              htmlFor="contactPhone"
                              className={`text-sm font-semibold ${
                                theme === "dark"
                                  ? "text-gray-200"
                                  : "text-gray-700"
                              }`}
                            >
                              Phone Number *
                            </label>
                            <Input
                              id="contactPhone"
                              type="tel"
                              placeholder="e.g., +1234567890"
                              value={contactForm.phone}
                              onChange={(e) =>
                                handleContactFormChangeWithValidation(
                                  "phone",
                                  e.target.value
                                )
                              }
                              className={`h-12 text-sm rounded-xl border-2 ${
                                errors.phone
                                  ? "border-red-300 focus:border-red-500"
                                  : theme === "dark"
                                  ? "bg-gray-700/50 text-white placeholder:text-gray-300 border-gray-600 focus:border-blue-500 focus:bg-gray-700/70"
                                  : "bg-gray-50 text-gray-900 placeholder:text-gray-400 border-gray-200 focus:border-blue-500 focus:bg-white focus:shadow-lg"
                              } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                              required
                              disabled={isLoading}
                            />
                            {errors.phone && (
                              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                                {errors.phone}
                              </p>
                            )}
                            <ValidationError prefix="Phone" field="phone" errors={state.errors} />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <label
                            htmlFor="lastEmail"
                            className={`text-sm font-semibold ${
                              theme === "dark"
                                ? "text-gray-200"
                                : "text-gray-700"
                            }`}
                          >
                            Last Known Email
                          </label>
                          <Input
                            id="lastEmail"
                            type="email"
                            placeholder="e.g., john.doe@company.com"
                            value={contactForm.lastKnownEmail}
                            onChange={(e) =>
                              handleContactFormChangeWithValidation(
                                "lastKnownEmail",
                                e.target.value
                              )
                            }
                            onBlur={handleEmailBlur}
                            className={`h-12 text-sm rounded-xl border-2 ${
                              errors.lastKnownEmail
                                ? "border-red-300 focus:border-red-500"
                                : theme === "dark"
                                ? "bg-gray-700/50 text-white placeholder:text-gray-300 border-gray-600 focus:border-blue-500 focus:bg-gray-700/70"
                                : "bg-gray-50 text-gray-900 placeholder:text-gray-400 border-gray-200 focus:border-blue-500 focus:bg-white focus:shadow-lg"
                            } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                            disabled={isLoading}
                          />
                          {errors.lastKnownEmail && (
                            <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                              {errors.lastKnownEmail}
                            </p>
                          )}
                          <ValidationError prefix="Email" field="lastKnownEmail" errors={state.errors} />
                        </div>

                        <div className="space-y-2">
                          <label
                            htmlFor="reason"
                            className={`text-sm font-semibold ${
                              theme === "dark"
                                ? "text-gray-200"
                                : "text-gray-700"
                            }`}
                          >
                            Reason for Recovery *
                          </label>
                          <select
                            value={contactForm.reason}
                            onChange={(e) =>
                              handleContactFormChangeWithValidation("reason", e.target.value)
                            }
                            className={`h-12 w-full rounded-xl border-2 px-3 text-sm transition-all duration-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 ${
                              errors.reason
                                ? "border-red-300 focus:border-red-500"
                                : theme === "dark"
                                ? "bg-gray-700/50 border-gray-600 text-white"
                                : "bg-gray-50 border-gray-200 text-gray-900"
                            }`}
                            required
                          >
                            <option value="">Select reason</option>
                            <option value="forgot-both">
                              Forgot email & password
                            </option>
                            <option value="new-employee">New employee</option>
                            <option value="account-locked">
                              Account locked
                            </option>
                            <option value="email-changed">
                              Email address changed
                            </option>
                            <option value="other">Other</option>
                          </select>
                          <ValidationError prefix="Reason" field="reason" errors={state.errors} />
                        </div>

                        <div className="space-y-2">
                          <label
                            htmlFor="additionalInfo"
                            className={`text-sm font-semibold ${
                              theme === "dark"
                                ? "text-gray-200"
                                : "text-gray-700"
                            }`}
                          >
                            Additional Information
                          </label>
                          <textarea
                            id="additionalInfo"
                            placeholder="Any additional details that might help verify your identity..."
                            value={contactForm.additionalInfo}
                            onChange={(e) =>
                              handleContactFormChangeWithValidation(
                                "additionalInfo",
                                e.target.value
                              )
                            }
                            className={`h-20 w-full rounded-xl border-2 px-3 py-2 text-sm resize-none ${
                              theme === "dark"
                                ? "bg-gray-700/50 border-gray-600 text-white placeholder:text-gray-300 focus:border-gray-600 focus:bg-gray-700/50"
                                : "bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-400 focus:border-gray-200 focus:bg-gray-50"
                            } focus:outline-none`}
                            disabled={isLoading}
                          />
                          <ValidationError prefix="Additional Info" field="additionalInfo" errors={state.errors} />
                        </div>


                        <Button
                          type="submit"
                          variant="primary"
                          size="md"
                          className="w-full"
                          disabled={
                            state.submitting ||
                            !contactForm.firstName ||
                            !contactForm.lastName ||
                            !contactForm.phone ||
                            !contactForm.reason
                          }
                        >
                          {state.submitting ? (
                            <div className="flex items-center justify-center gap-2">
                              <Spinner size="sm" />
                              Sending Request...
                            </div>
                          ) : (
                            "Send Recovery Request"
                          )}
                        </Button>

                        {/* Formspree Success Message */}
                        {state.succeeded && (
                          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4">
                            <div className="flex items-center gap-2">
                              <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                              <p className="text-sm font-medium text-green-800 dark:text-green-200">
                                Recovery request sent successfully! An administrator will contact you within 24 hours.
                              </p>
                            </div>
                          </div>
                        )}

                        {/* Formspree Error Message */}
                        {state.errors && state.errors.length > 0 && (
                          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
                            <div className="flex items-center gap-2">
                              <svg className="w-5 h-5 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              <p className="text-sm font-medium text-red-800 dark:text-red-200">
                                Failed to send request. Please try again.
                              </p>
                            </div>
                          </div>
                        )}
                      </form>
                    </div>
                  )}
                </div>
              )}

              <div
                className={`text-center text-sm space-y-2 ${
                  theme === "dark" ? "text-gray-400" : "text-gray-600"
                }`}
              >
                <p>
                  Remember your login?{" "}
                  <button
                    onClick={onClose}
                    className="text-blue-600 hover:text-blue-500 font-semibold transition-colors duration-200"
                  >
                    Back to login
                  </button>
                </p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
    // Forgot password
  );
}
