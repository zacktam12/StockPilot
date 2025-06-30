"use client";

import { useState, useRef } from "react";
import { ArrowLeft, User, MessageSquare, X } from "lucide-react";
import Button from "../../../components/shared/Button";
import Input from "../../../components/shared/Input";
import Card from "../../../components/shared/Card";
import Spinner from "../../../components/shared/Spinner";
import { useTheme } from "../../../components/ThemeProvider";
import LoginNotice from "../components/LoginNotice";
import { authAPI } from "../../../services/api";
import { useOutsideClick } from "../../../hooks/useOutsideClick";

export default function AccountRecoveryModal({
  onClose,
  onOpenForgotPassword,
}) {
  const [activeTab, setActiveTab] = useState("employee-id");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState("");
  const { theme } = useTheme();

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
    fullName: "",
    department: "",
    phoneNumber: "",
    lastKnownEmail: "",
    reason: "",
    additionalInfo: "",
  });

  const handleEmployeeIdRecovery = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setFoundUser(null);
    try {
      console.log("Submitting employee ID recovery", employeeId);
      // Call backend API to verify employee ID
      const response = await authAPI.verifyEmployeeId(employeeId);
      if (response && response.data && response.data.user) {
        setFoundUser(response.data.user);
        setIsSuccess(true);
      } else {
        setError(
          response?.data?.message ||
            "Employee ID not found. Please check your ID or contact your administrator."
        );
      }
    } catch (error) {
      console.error("Employee ID recovery error:", error);
      setError(
        error?.response?.data?.message ||
          error?.message ||
          "System error occurred. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdminContact = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    try {
      console.log("Submitting admin contact", contactForm);
      // Call backend API to send admin contact request
      const response = await authAPI.contactAdmin(contactForm);
      if (response && response.data && response.data.success) {
        setIsSuccess(true);
      } else {
        setError(response?.data?.message || "Failed to send request.");
      }
    } catch (error) {
      console.error("Admin contact error:", error);
      setError(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to send request. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleContactFormChange = (field, value) => {
    setContactForm((prev) => ({ ...prev, [field]: value }));
    setError("");
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
      className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors ${
        isActive
          ? theme === "dark"
            ? "bg-slate-600 text-white"
            : "bg-blue-800 text-white"
          : theme === "dark"
          ? "bg-slate-700/50 text-slate-300 hover:bg-slate-600/50"
          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
      }`}
    >
      <Icon className="h-4 w-4" />
      {label}
    </button>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-lg">
      <div ref={modalRef} className="w-full max-w-lg mx-4">
        <Card
          className={
            theme === "dark"
              ? "bg-slate-800/50 border-slate-700 backdrop-blur-lg"
              : "bg-white border-gray-200"
          }
        >
          <div className="p-6 max-h-[90vh] flex flex-col justify-between">
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
                    Account Recovery
                  </h2>
                  <p
                    className={`text-sm text-center ${
                      theme === "dark" ? "text-slate-400" : "text-gray-600"
                    }`}
                  >
                    Multiple ways to recover your account access
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-1 text-gray-400 hover:text-gray-600 rounded"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            {/* back */}
            {/* Only one scrollable area for all modal content */}
            <div className="space-y-6 flex-1 overflow-y-auto">
              {isSuccess ? (
                <div className="space-y-4 text-center">
                  <LoginNotice
                    type="success"
                    message={
                      foundUser ? (
                        <>
                          <strong>Account Found!</strong>
                          Email: {foundUser.email}
                        </>
                      ) : (
                        <>
                          <strong>Request submitted!</strong> An administrator
                          will contact you within 24 hours.
                        </>
                      )
                    }
                    isVisible={true}
                  />

                  {foundUser && (
                    <div className="space-y-3">
                      <Button
                        onClick={handleFoundUserPasswordReset}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white h-12"
                      >
                        Reset Password for This Account
                      </Button>
                      <Button
                        onClick={() => {
                          setIsSuccess(false);
                          setFoundUser(null);
                          setEmployeeId("");
                        }}
                        className={`w-full h-12 ${
                          theme === "dark"
                            ? "bg-slate-700 hover:bg-slate-600 text-slate-300 border-slate-600"
                            : "bg-gray-100 hover:bg-gray-200 text-gray-700 border-gray-300"
                        } border`}
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
                    className={`flex gap-2 p-1 rounded-lg ${
                      theme === "dark" ? "bg-slate-700/50" : "bg-gray-100"
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
                        <User className="h-12 w-12 text-blue-800 mx-auto" />
                        <h3
                          className={`text-lg font-medium ${
                            theme === "dark" ? "text-white" : "text-gray-900"
                          }`}
                        >
                          Employee ID Recovery
                        </h3>
                        <p
                          className={`text-sm ${
                            theme === "dark"
                              ? "text-slate-400"
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
                            className={`text-sm font-medium ${
                              theme === "dark"
                                ? "text-slate-200"
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
                            onChange={(e) => {
                              setEmployeeId(e.target.value);
                              setError("");
                            }}
                            className={`h-12 ${
                              theme === "dark"
                                ? "bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400"
                                : "bg-yellow-50 border-gray-300 text-gray-900 placeholder:text-gray-500"
                            } focus:ring-2 focus:ring-blue-800 focus:border-blue-800`}
                            required
                            disabled={isLoading}
                          />
                        </div>

                        <LoginNotice
                          type="error"
                          message={error}
                          isVisible={!!error}
                        />

                        <Button
                          type="submit"
                          className="w-full h-12 bg-blue-800 hover:bg-blue-600 text-white font-medium rounded-lg"
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
                        <MessageSquare className="h-12 w-12 text-blue-800 mx-auto" />
                        <h3
                          className={`text-lg font-medium ${
                            theme === "dark" ? "text-white" : "text-gray-900"
                          }`}
                        >
                          Contact Administrator
                        </h3>
                        <p
                          className={`text-sm ${
                            theme === "dark"
                              ? "text-slate-400"
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
                              htmlFor="fullName"
                              className={`text-sm font-medium ${
                                theme === "dark"
                                  ? "text-slate-200"
                                  : "text-gray-700"
                              }`}
                            >
                              Full Name *
                            </label>
                            <Input
                              id="fullName"
                              type="text"
                              placeholder="Your name"
                              value={contactForm.fullName}
                              onChange={(e) =>
                                handleContactFormChange(
                                  "fullName",
                                  e.target.value
                                )
                              }
                              className={`h-10 ${
                                theme === "dark"
                                  ? "bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400"
                                  : "bg-yellow-50 border-gray-300 text-gray-900 placeholder:text-gray-500"
                              } focus:ring-2 focus:ring-blue-800 focus:border-blue-800`}
                              required
                              disabled={isLoading}
                            />
                          </div>
                          <div className="space-y-2">
                            <label
                              htmlFor="department"
                              className={`text-sm font-medium ${
                                theme === "dark"
                                  ? "text-slate-200"
                                  : "text-gray-700"
                              }`}
                            >
                              Department *
                            </label>
                            <select
                              value={contactForm.department}
                              onChange={(e) =>
                                handleContactFormChange(
                                  "department",
                                  e.target.value
                                )
                              }
                              className={`h-10 w-full rounded-lg border px-3 text-sm focus:ring-2 focus:ring-blue-800 focus:border-blue-800 ${
                                theme === "dark"
                                  ? "bg-slate-700/50 border-slate-600 text-white"
                                  : "bg-yellow-50 border-gray-300 text-gray-900"
                              }`}
                              required
                            >
                              <option value="">Select</option>
                              <option value="IT">IT</option>
                              <option value="Warehouse">Warehouse</option>
                              <option value="Operations">Operations</option>
                              <option value="Management">Management</option>
                              <option value="Other">Other</option>
                            </select>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <label
                            htmlFor="contactPhone"
                            className={`text-sm font-medium ${
                              theme === "dark"
                                ? "text-slate-200"
                                : "text-gray-700"
                            }`}
                          >
                            Phone Number *
                          </label>
                          <Input
                            id="contactPhone"
                            type="tel"
                            placeholder="Your phone number"
                            value={contactForm.phoneNumber}
                            onChange={(e) =>
                              handleContactFormChange(
                                "phoneNumber",
                                e.target.value
                              )
                            }
                            className={`h-10 ${
                              theme === "dark"
                                ? "bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400"
                                : "bg-yellow-50 border-gray-300 text-gray-900 placeholder:text-gray-500"
                            } focus:ring-2 focus:ring-blue-800 focus:border-blue-800`}
                            required
                            disabled={isLoading}
                          />
                        </div>

                        <div className="space-y-2">
                          <label
                            htmlFor="lastEmail"
                            className={`text-sm font-medium ${
                              theme === "dark"
                                ? "text-slate-200"
                                : "text-gray-700"
                            }`}
                          >
                            Last Known Email (if any)
                          </label>
                          <Input
                            id="lastEmail"
                            type="email"
                            placeholder="your.email@stockpilot.com"
                            value={contactForm.lastKnownEmail}
                            onChange={(e) =>
                              handleContactFormChange(
                                "lastKnownEmail",
                                e.target.value
                              )
                            }
                            className={`h-10 ${
                              theme === "dark"
                                ? "bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400"
                                : "bg-yellow-50 border-gray-300 text-gray-900 placeholder:text-gray-500"
                            } focus:ring-2 focus:ring-blue-800 focus:border-blue-800`}
                            disabled={isLoading}
                          />
                        </div>

                        <div className="space-y-2">
                          <label
                            htmlFor="reason"
                            className={`text-sm font-medium ${
                              theme === "dark"
                                ? "text-slate-200"
                                : "text-gray-700"
                            }`}
                          >
                            Reason for Recovery *
                          </label>
                          <select
                            value={contactForm.reason}
                            onChange={(e) =>
                              handleContactFormChange("reason", e.target.value)
                            }
                            className={`h-10 w-full rounded-lg border px-3 text-sm focus:ring-2 focus:ring-blue-800 focus:border-blue-800 ${
                              theme === "dark"
                                ? "bg-slate-700/50 border-slate-600 text-white"
                                : "bg-yellow-50 border-gray-300 text-gray-900"
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
                        </div>

                        <div className="space-y-2">
                          <label
                            htmlFor="additionalInfo"
                            className={`text-sm font-medium ${
                              theme === "dark"
                                ? "text-slate-200"
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
                              handleContactFormChange(
                                "additionalInfo",
                                e.target.value
                              )
                            }
                            className={`h-20 w-full rounded-lg border px-3 py-2 text-sm resize-none focus:ring-2 focus:ring-blue-800 focus:border-blue-800 ${
                              theme === "dark"
                                ? "bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400"
                                : "bg-yellow-50 border-gray-300 text-gray-900 placeholder:text-gray-500"
                            }`}
                            disabled={isLoading}
                          />
                        </div>

                        <LoginNotice
                          type="error"
                          message={error}
                          isVisible={!!error}
                        />

                        <Button
                          type="submit"
                          className="w-full h-12 bg-blue-800 hover:bg-blue-600 text-white font-medium rounded-lg"
                          disabled={
                            isLoading ||
                            !contactForm.fullName ||
                            !contactForm.department ||
                            !contactForm.phoneNumber ||
                            !contactForm.reason
                          }
                        >
                          {isLoading ? (
                            <div className="flex items-center justify-center gap-2">
                              <Spinner size="sm" />
                              Sending Request...
                            </div>
                          ) : (
                            "Contact Administrator"
                          )}
                        </Button>
                      </form>
                    </div>
                  )}
                </div>
              )}

              <div
                className={`text-center text-sm space-y-2 ${
                  theme === "dark" ? "text-slate-400" : "text-gray-600"
                }`}
              >
                <p>
                  Remember your login?{" "}
                  <button
                    onClick={onClose}
                    className="text-orange-400 hover:text-orange-300 font-medium"
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
