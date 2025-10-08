// src/features/users/drawers/NewUserDrawer.jsx
import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { useDispatch, useSelector } from "react-redux";
import { createUser, updateUser } from "../../../store/slices/userSlice";
import { fetchRoles } from "../../../store/slices/roleSlice";
import {
  User,
  Mail,
  Lock,
  Phone,
  X,
  Shield,
  UserCheck,
} from "lucide-react";
import Button from "../../../components/shared/Button";
import Input from "../../../components/shared/Input";
import { useOutsideClick } from "../../../hooks/useOutsideClick";
import {
  validateEmail,
  validatePassword,
  validatePhone,
  validateName,
  sanitizeEmail,
  sanitizePhone
} from "../../../utils/authValidation";

const NewUserDrawer = ({ user, isOpen, onClose, onSuccess }) => {
  const dispatch = useDispatch();
  const drawerRef = useRef(null);
  const { roles = [] } = useSelector((state) => state.role || {});

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    phone: "",
    roleId: "",
    status: "Active",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  // Load roles on mount
  useEffect(() => {
    if (isOpen && (!roles || roles.length === 0)) {
      dispatch(fetchRoles());
    }
  }, [dispatch, isOpen, roles]);

  // Reset form when drawer opens for new user
  useEffect(() => {
    if (isOpen && !user) {
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        phone: "",
        roleId: "",
        status: "Active",
      });
      setErrors({});
    }
  }, [isOpen, user]);

  // Populate form when editing
  useEffect(() => {
    if (user && isOpen) {
      setFormData({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
        password: "",
        phone: user.phone || "",
        roleId: user.roleId || "",
        status: user.status || "Active",
      });
    } else if (isOpen) {
      // Reset form for new user
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        phone: "",
        roleId: "",
        status: "Active",
      });
    }
  }, [user, isOpen]);

  // Close drawer when clicking outside
  useOutsideClick(drawerRef, () => {
    if (isOpen) {
      onClose();
    }
  });

  const validateForm = () => {
    const newErrors = {};

    // Validate first name
    if (!formData.firstName.trim()) {
      newErrors.firstName = "First name is required";
    } else {
      const firstNameValidation = validateName(formData.firstName.trim(), "First name");
      if (!firstNameValidation.isValid && firstNameValidation.error) {
        newErrors.firstName = firstNameValidation.error;
      }
    }

    // Validate last name
    if (!formData.lastName.trim()) {
      newErrors.lastName = "Last name is required";
    } else {
      const lastNameValidation = validateName(formData.lastName.trim(), "Last name");
      if (!lastNameValidation.isValid && lastNameValidation.error) {
        newErrors.lastName = lastNameValidation.error;
      }
    }

    // Validate email
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else {
      const emailValidation = validateEmail(formData.email.trim());
      if (!emailValidation.isValid && emailValidation.error) {
        newErrors.email = emailValidation.error;
      }
    }

    // Validate password
    if (!user && !formData.password.trim()) {
      newErrors.password = "Password is required for new users";
    } else if (formData.password) {
      const passwordValidation = validatePassword(formData.password);
      if (!passwordValidation.isValid && passwordValidation.error) {
        newErrors.password = passwordValidation.error;
      }
    }

    // Validate phone (optional but must be valid if provided)
    if (formData.phone) {
      const phoneValidation = validatePhone(formData.phone);
      if (!phoneValidation.isValid && phoneValidation.error) {
        newErrors.phone = phoneValidation.error;
      }
    }

    // Validate role
    if (!formData.roleId) {
      newErrors.roleId = "Role is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      if (user) {
        // Update user
        const updateData = { ...formData };
        if (!updateData.password) {
          delete updateData.password;
        }
        // Remove email field when editing since it's disabled
        delete updateData.email;
        await dispatch(
          updateUser({ id: user.id, userData: updateData })
        ).unwrap();
      } else {
        // Create new user
        await dispatch(createUser(formData)).unwrap();
      }
      
      if (onSuccess) {
        onSuccess();
      }
      onClose();
    } catch (error) {
      console.error("Error saving user:", error);
      setErrors({ submit: error.message || "Failed to save user. Please try again." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Sanitize phone as user types
    let sanitizedValue = value;
    if (name === 'phone') {
      sanitizedValue = sanitizePhone(value);
    }
    
    setFormData((prev) => ({ ...prev, [name]: sanitizedValue }));
    
    // Real-time validation
    if (sanitizedValue) {
      let validation = { isValid: true, error: null };
      
      switch (name) {
        case 'firstName':
          validation = validateName(sanitizedValue, "First name");
          break;
        case 'lastName':
          validation = validateName(sanitizedValue, "Last name");
          break;
        case 'email':
          validation = validateEmail(sanitizedValue);
          break;
        case 'phone':
          validation = validatePhone(sanitizedValue);
          break;
        case 'password':
          validation = validatePassword(sanitizedValue);
          break;
        default:
          break;
      }
      
      if (!validation.isValid && validation.error) {
        setErrors(prev => ({ ...prev, [name]: validation.error }));
      } else {
        setErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors[name];
          return newErrors;
        });
      }
    } else {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  // Email blur handler for sanitization
  const handleEmailBlur = () => {
    if (formData.email) {
      const sanitized = sanitizeEmail(formData.email);
      setFormData(prev => ({ ...prev, email: sanitized }));
      
      const validation = validateEmail(sanitized);
      if (!validation.isValid && validation.error) {
        setErrors(prev => ({ ...prev, email: validation.error }));
      }
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 bg-black/30 z-[9999] flex items-end sm:items-stretch sm:justify-end" style={{ top: 0, left: 0, right: 0, bottom: 0 }}>
      <div
        className="bg-white dark:bg-gray-800 text-gray-800 dark:text-white w-full sm:w-96 lg:w-[28rem] h-[70vh] sm:h-full overflow-y-auto shadow-2xl rounded-t-2xl sm:rounded-none"
        ref={drawerRef}
      >
        {/* Drawer Header */}
        <div className="sticky top-0 bg-white dark:bg-gray-800 px-6 py-4 z-10 backdrop-blur-sm rounded-t-2xl sm:rounded-none">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {user ? "Edit User" : "User"}
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {user ? "Update user information" : "Create User"}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <X size={20} className="text-gray-500" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-6 space-y-6">
          {/* Basic Information */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">User Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="First Name"
                icon={<User size={18} />}
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                error={errors.firstName}
                placeholder="Enter first name"
                required
              />

              <Input
                label="Last Name"
                icon={<User size={18} />}
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                error={errors.lastName}
                placeholder="Enter last name"
                required
              />
            </div>
          </div>

          {/* Contact Information */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Contact Information</h3>
            <div className="space-y-4">
              <Input
                label="Email"
                type="email"
                icon={<Mail size={18} />}
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                onBlur={handleEmailBlur}
                error={errors.email}
                placeholder="user@company.com"
                required
                disabled={!!user}
              />

              <Input
                label="Phone"
                type="tel"
                icon={<Phone size={18} />}
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                error={errors.phone}
                placeholder="+1 (555) 123-4567"
              />
            </div>
          </div>

          {/* Authentication */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Authentication</h3>
            <div className="space-y-4">
              {!user && (
                <Input
                  label="Password"
                  type="password"
                  icon={<Lock size={18} />}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  error={errors.password}
                  placeholder="Enter password"
                  required
                />
              )}

              {user && (
                <Input
                  label="New Password (leave blank to keep current)"
                  type="password"
                  icon={<Lock size={18} />}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Enter new password"
                />
              )}
            </div>
          </div>

          {/* Role & Status */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Role & Status</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                  Role *
                </label>
                <div className="relative">
                  <Shield size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <select
                    name="roleId"
                    value={formData.roleId}
                    onChange={handleInputChange}
                    className={`w-full pl-12 pr-4 py-3 text-sm border bg-white text-gray-800 rounded-lg shadow-sm transition duration-150 ease-in-out hover:border-gray-600 focus:outline-none focus:ring-0 ${
                      errors.roleId ? 'border-red-300 focus:border-red-500' : 'border-gray-300 focus:border-gray-300'
                    }`}
                    required
                  >
                    <option value="">Select a role</option>
                    {roles.map((role) => (
                      <option key={role.id} value={role.id}>
                        {role.role_type}
                      </option>
                    ))}
                  </select>
                </div>
                {errors.roleId && (
                  <p className="mt-1 text-sm text-red-600">{errors.roleId}</p>
                )}
              </div>

              {user && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                    Status
                  </label>
                  <div className="relative">
                    <UserCheck size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                      className="w-full pl-12 pr-4 py-3 text-sm border border-gray-300 bg-white text-gray-800 rounded-lg shadow-sm transition duration-150 ease-in-out hover:border-gray-600 focus:outline-none focus:ring-0 focus:border-gray-300"
                    >
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                      <option value="Deactivated">Deactivated</option>
                      <option value="Banned">Banned</option>
                    </select>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Error Message */}
          {errors.submit && (
            <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg">
              {errors.submit}
            </div>
          )}

          {/* Form Actions */}
          <div className="flex space-x-3 pt-6 border-t border-gray-200 dark:border-gray-700">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-6 py-3 rounded-lg flex items-center justify-center focus:outline-none focus:ring-0 focus:shadow-none active:shadow-none disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium"
              style={{
                backgroundColor: isSubmitting ? '#9ca3af' : '#3b82f6',
                borderColor: isSubmitting ? '#9ca3af' : '#3b82f6',
                transition: 'background-color 0.2s ease',
                transform: 'none',
                boxShadow: 'none',
              }}
              onMouseEnter={(e) => {
                if (!isSubmitting) {
                  e.currentTarget.style.backgroundColor = '#2563eb';
                  e.currentTarget.style.borderColor = '#2563eb';
                }
              }}
              onMouseLeave={(e) => {
                if (!isSubmitting) {
                  e.currentTarget.style.backgroundColor = '#3b82f6';
                  e.currentTarget.style.borderColor = '#3b82f6';
                }
              }}
            >
              {isSubmitting ? "Saving..." : user ? "Update User" : "Create User"}
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 px-6 py-3 rounded-lg border border-gray-300 text-blue-600 hover:bg-blue-50 hover:border-blue-400 hover:text-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed bg-white font-medium"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};

export default NewUserDrawer;
