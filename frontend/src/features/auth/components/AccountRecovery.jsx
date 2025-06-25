// src/features/auth/components/AccountRecovery.jsx
import { useState } from "react";
import {
  ArrowLeft,
  User,
  Phone,
  MessageSquare,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import Button from "../../../components/shared/Button";
import Input from "../../../components/shared/Input";
import Card from "../../../components/shared/Card";
import Spinner from "../../../components/shared/spinner";
import api from "../../../services/api";

export default function AccountRecovery() {
  const [activeTab, setActiveTab] = useState("employee-id");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState("");

  // Employee ID Recovery
  const [employeeId, setEmployeeId] = useState("");
  const [foundUser, setFoundUser] = useState(null);

  // Phone Recovery
  const [phoneNumber, setPhoneNumber] = useState("");

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
      const response = await api.get(`/auth/verify-employee-id/${employeeId}`);
      if (response.data && response.data.success && response.data.user) {
        setFoundUser(response.data.user);
        setIsSuccess(true);
      } else {
        setError(
          response.data?.message ||
            "Employee ID not found. Please check your ID or contact your administrator."
        );
      }
    } catch (error) {
      setError(
        error?.response?.data?.message ||
          error?.message ||
          "System error occurred. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handlePhoneRecovery = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    try {
      console.log("Submitting phone recovery", phoneNumber);
      // Call backend API to send SMS for recovery
      const response = await api.post("/auth/recover-by-phone", {
        phone: phoneNumber,
      });
      if (response.data && response.data.success) {
        setIsSuccess(true);
      } else {
        setError(response.data?.message || "Phone number not found.");
      }
    } catch (error) {
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
      const response = await api.post("/auth/contact-admin", contactForm);
      if (response.data && response.data.success) {
        setIsSuccess(true);
      } else {
        setError(response.data?.message || "Failed to send request.");
      }
    } catch (error) {
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

  const TabButton = ({ id, label, icon: Icon, isActive, onClick }) => (
    <button
      type="button"
      onClick={() => onClick(id)}
      className={`flex-1 flex items-center justify-center gap-1 px-3 py-1 text-xs rounded transition-colors ${
        isActive
          ? "bg-slate-600 text-white"
          : "bg-slate-700/50 text-slate-300 hover:bg-slate-600/50"
      }`}
    >
      <Icon className="h-3 w-3" />
      {label}
    </button>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-3">
      <div className="w-full max-w-md">
        <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
          <div className="space-y-1 pb-3 p-4">
            <div className="flex items-center gap-2">
              <a href="/login">
                <button className="text-slate-400 hover:text-white p-0 h-6 w-6 bg-transparent border-none cursor-pointer flex items-center justify-center">
                  <ArrowLeft className="h-3 w-3" />
                </button>
              </a>
              <h2 className="text-lg text-white font-semibold">
                Account Recovery
              </h2>
            </div>
            <p className="text-slate-400 text-xs">
              Multiple ways to recover your account access
            </p>
          </div>

          <div className="space-y-3 px-4 pb-4">
            {isSuccess ? (
              <div className="space-y-3 text-center">
                <div className="border border-green-500 bg-green-500/10 rounded-md p-2">
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="h-3 w-3 text-green-500 flex-shrink-0 mt-0.5" />
                    <div className="text-green-400 text-xs text-left">
                      {foundUser ? (
                        <>
                          <strong>Account Found!</strong>
                          <br />
                          Email: {foundUser.email}
                          <br />
                          Name: {foundUser.name}
                          <br />
                          Department: {foundUser.department}
                        </>
                      ) : activeTab === "phone" ? (
                        <>
                          <strong>SMS sent!</strong> Check your phone for
                          account recovery instructions.
                        </>
                      ) : (
                        <>
                          <strong>Request submitted!</strong> An administrator
                          will contact you within 24 hours.
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {foundUser && (
                  <div className="space-y-2">
                    <Button
                      onClick={() =>
                        (window.location.href = `/forgot-password?email=${foundUser.email}`)
                      }
                      className="w-full bg-blue-600 hover:bg-blue-700 h-7 text-xs"
                    >
                      Reset Password for This Account
                    </Button>
                    <Button
                      onClick={() => {
                        setIsSuccess(false);
                        setFoundUser(null);
                        setEmployeeId("");
                      }}
                      className="w-full bg-slate-700/50 border border-slate-600 text-slate-300 hover:bg-slate-700 h-7 text-xs"
                    >
                      Try Another Method
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <div className="w-full">
                {/* Tab Navigation */}
                <div className="flex gap-1 bg-slate-700/50 p-1 rounded mb-3">
                  <TabButton
                    id="employee-id"
                    label="ID"
                    icon={User}
                    isActive={activeTab === "employee-id"}
                    onClick={setActiveTab}
                  />
                  <TabButton
                    id="phone"
                    label="Phone"
                    icon={Phone}
                    isActive={activeTab === "phone"}
                    onClick={setActiveTab}
                  />
                  <TabButton
                    id="admin"
                    label="Admin"
                    icon={MessageSquare}
                    isActive={activeTab === "admin"}
                    onClick={setActiveTab}
                  />
                </div>

                {/* Tab Content */}
                {activeTab === "employee-id" && (
                  <div className="space-y-3">
                    <div className="text-center space-y-1">
                      <User className="h-6 w-6 text-blue-400 mx-auto" />
                      <h3 className="text-sm font-medium text-white">
                        Employee ID Recovery
                      </h3>
                      <p className="text-xs text-slate-400">
                        Enter your employee ID to find your account
                      </p>
                    </div>

                    <form
                      onSubmit={handleEmployeeIdRecovery}
                      className="space-y-3"
                    >
                      <div className="space-y-1">
                        <label
                          htmlFor="employeeId"
                          className="text-slate-200 text-xs block"
                        >
                          Employee ID
                        </label>
                        <Input
                          id="employeeId"
                          type="text"
                          placeholder="e.g., EMP001"
                          value={employeeId}
                          onChange={(e) => {
                            setEmployeeId(e.target.value);
                            setError("");
                          }}
                          className="h-8 text-sm bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-blue-500"
                          required
                          disabled={isLoading}
                        />
                      </div>

                      {error && (
                        <div className="border border-red-500 bg-red-500/10 rounded-md p-1">
                          <div className="flex items-center gap-2">
                            <AlertCircle className="h-3 w-3 text-red-500 flex-shrink-0" />
                            <span className="text-red-400 text-xs">
                              {error}
                            </span>
                          </div>
                        </div>
                      )}

                      <Button
                        type="submit"
                        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 h-8 text-xs"
                        disabled={isLoading || !employeeId}
                      >
                        {isLoading ? (
                          <div className="flex items-center justify-center gap-1">
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

                {activeTab === "phone" && (
                  <div className="space-y-3">
                    <div className="text-center space-y-1">
                      <Phone className="h-6 w-6 text-green-400 mx-auto" />
                      <h3 className="text-sm font-medium text-white">
                        Phone Recovery
                      </h3>
                      <p className="text-xs text-slate-400">
                        Get recovery instructions via SMS
                      </p>
                    </div>

                    <form onSubmit={handlePhoneRecovery} className="space-y-3">
                      <div className="space-y-1">
                        <label
                          htmlFor="phone"
                          className="text-slate-200 text-xs block"
                        >
                          Phone Number
                        </label>
                        <Input
                          id="phone"
                          type="tel"
                          placeholder="+1234567890"
                          value={phoneNumber}
                          onChange={(e) => {
                            setPhoneNumber(e.target.value);
                            setError("");
                          }}
                          className="h-8 text-sm bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-blue-500"
                          required
                          disabled={isLoading}
                        />
                      </div>

                      {error && (
                        <div className="border border-red-500 bg-red-500/10 rounded-md p-1">
                          <div className="flex items-center gap-2">
                            <AlertCircle className="h-3 w-3 text-red-500 flex-shrink-0" />
                            <span className="text-red-400 text-xs">
                              {error}
                            </span>
                          </div>
                        </div>
                      )}

                      <Button
                        type="submit"
                        className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 h-8 text-xs"
                        disabled={isLoading || !phoneNumber}
                      >
                        {isLoading ? (
                          <div className="flex items-center justify-center gap-1">
                            <Spinner size="sm" />
                            Sending SMS...
                          </div>
                        ) : (
                          "Send Recovery SMS"
                        )}
                      </Button>
                    </form>
                  </div>
                )}

                {activeTab === "admin" && (
                  <div className="space-y-3">
                    <div className="text-center space-y-1">
                      <MessageSquare className="h-6 w-6 text-orange-400 mx-auto" />
                      <h3 className="text-sm font-medium text-white">
                        Contact Administrator
                      </h3>
                      <p className="text-xs text-slate-400">
                        Request help from your system admin
                      </p>
                    </div>

                    <form onSubmit={handleAdminContact} className="space-y-2">
                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                          <label
                            htmlFor="fullName"
                            className="text-slate-200 text-xs block"
                          >
                            Full Name
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
                            className="h-7 text-xs bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-blue-500"
                            required
                            disabled={isLoading}
                          />
                        </div>
                        <div className="space-y-1">
                          <label
                            htmlFor="department"
                            className="text-slate-200 text-xs block"
                          >
                            Department
                          </label>
                          <select
                            value={contactForm.department}
                            onChange={(e) =>
                              handleContactFormChange(
                                "department",
                                e.target.value
                              )
                            }
                            className="h-7 text-xs bg-slate-700/50 border border-slate-600 text-white focus:border-blue-500 rounded w-full px-2"
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

                      <div className="space-y-1">
                        <label
                          htmlFor="contactPhone"
                          className="text-slate-200 text-xs block"
                        >
                          Phone Number
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
                          className="h-7 text-xs bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-blue-500"
                          required
                          disabled={isLoading}
                        />
                      </div>

                      <div className="space-y-1">
                        <label
                          htmlFor="lastEmail"
                          className="text-slate-200 text-xs block"
                        >
                          Last Known Email (if any)
                        </label>
                        <Input
                          id="lastEmail"
                          type="email"
                          placeholder="your.email@company.com"
                          value={contactForm.lastKnownEmail}
                          onChange={(e) =>
                            handleContactFormChange(
                              "lastKnownEmail",
                              e.target.value
                            )
                          }
                          className="h-7 text-xs bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-blue-500"
                          disabled={isLoading}
                        />
                      </div>

                      <div className="space-y-1">
                        <label
                          htmlFor="reason"
                          className="text-slate-200 text-xs block"
                        >
                          Reason for Recovery
                        </label>
                        <select
                          value={contactForm.reason}
                          onChange={(e) =>
                            handleContactFormChange("reason", e.target.value)
                          }
                          className="h-7 text-xs bg-slate-700/50 border border-slate-600 text-white focus:border-blue-500 rounded w-full px-2"
                          required
                        >
                          <option value="">Select reason</option>
                          <option value="forgot-both">
                            Forgot email & password
                          </option>
                          <option value="new-employee">New employee</option>
                          <option value="account-locked">Account locked</option>
                          <option value="email-changed">
                            Email address changed
                          </option>
                          <option value="other">Other</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label
                          htmlFor="additionalInfo"
                          className="text-slate-200 text-xs block"
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
                          className="h-16 text-xs bg-slate-700/50 border border-slate-600 text-white placeholder:text-slate-400 focus:border-blue-500 resize-none rounded w-full p-2"
                          disabled={isLoading}
                        />
                      </div>

                      {error && (
                        <div className="border border-red-500 bg-red-500/10 rounded-md p-1">
                          <div className="flex items-center gap-2">
                            <AlertCircle className="h-3 w-3 text-red-500 flex-shrink-0" />
                            <span className="text-red-400 text-xs">
                              {error}
                            </span>
                          </div>
                        </div>
                      )}

                      <Button
                        type="submit"
                        className="w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 h-8 text-xs"
                        disabled={
                          isLoading ||
                          !contactForm.fullName ||
                          !contactForm.department ||
                          !contactForm.phoneNumber ||
                          !contactForm.reason
                        }
                      >
                        {isLoading ? (
                          <div className="flex items-center justify-center gap-1">
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

            <div className="text-center text-xs text-slate-400 space-y-1">
              <p>
                Remember your login?{" "}
                <a
                  href="/login"
                  className="text-blue-400 hover:text-blue-300 transition-colors"
                >
                  Back to login
                </a>
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
