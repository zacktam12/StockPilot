// src/features/customers/drawers/NewCustomerDrawer.jsx
import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  createCustomer,
  updateCustomer,
} from "../../../store/slices/customerSlice";
import {
  User,
  Mail,
  Phone,
  MapPin,
  AlertTriangle,
  X,
} from "lucide-react";
import Input from "../../../components/shared/Input";
import { useOutsideClick } from "../../../hooks/useOutsideClick";
import {
  validateEmail,
  validatePhone,
  validateName,
  sanitizeEmail,
  sanitizePhone
} from "../../../utils/authValidation";

const NewCustomerDrawer = ({ customer, isOpen, onClose }) => {
  const dispatch = useDispatch();
  const drawerRef = useRef(null);
  const {
    loading: saveLoading,
    error: saveError,
  } = useSelector((state) => state.customer || {});

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  // Reset form when drawer opens for new customer
  useEffect(() => {
    if (isOpen && !customer) {
      setFormData({
        name: "",
        email: "",
        phone: "",
        address: "",
      });
      setErrors({});
    }
  }, [isOpen, customer]);

  // Populate form when editing
  useEffect(() => {
    if (customer && isOpen) {
      setFormData({
        name: customer.name || "",
        email: customer.email || "",
        phone: customer.phone || "",
        address: customer.address || "",
      });
    } else if (isOpen) {
      // Reset form for new customer
      setFormData({
        name: "",
        email: "",
        phone: "",
        address: "",
      });
    }
  }, [customer, isOpen]);

  // Close drawer when clicking outside
  useOutsideClick(drawerRef, () => {
    if (isOpen) {
      onClose();
    }
  });

  const validateForm = () => {
    const newErrors = {};

    // Validate name
    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    } else {
      const nameValidation = validateName(formData.name.trim(), "Customer name");
      if (!nameValidation.isValid && nameValidation.error) {
        newErrors.name = nameValidation.error;
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

    // Validate phone (optional but must be valid if provided)
    if (formData.phone) {
      const phoneValidation = validatePhone(formData.phone);
      if (!phoneValidation.isValid && phoneValidation.error) {
        newErrors.phone = phoneValidation.error;
      }
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

    try {
      const customerData = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim() || null,
        address: formData.address.trim() || null,
      };

      // Remove null/undefined values
      Object.keys(customerData).forEach(key => {
        if (customerData[key] === null || customerData[key] === undefined || customerData[key] === '') {
          delete customerData[key];
        }
      });
      if (customer) {
        // Update existing customer
        await dispatch(updateCustomer({
          id: customer.id,
          ...customerData,
        })).unwrap();
      } else {
        // Create new customer
        await dispatch(createCustomer(customerData)).unwrap();
      }

      onClose();
    } catch (error) {
            setErrors({ 
        general: error.message || "Failed to save customer. Please try again." 
      });
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
    
    setFormData(prev => ({
      ...prev,
      [name]: sanitizedValue
    }));
    
    // Real-time validation
    if (sanitizedValue) {
      let validation = { isValid: true, error: null };
      
      switch (name) {
        case 'name':
          validation = validateName(sanitizedValue, "Customer name");
          break;
        case 'email':
          validation = validateEmail(sanitizedValue);
          break;
        case 'phone':
          validation = validatePhone(sanitizedValue);
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
      // Clear error if field is empty
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
                {customer ? "Edit Customer" : "Customer"}
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {customer ? "Update customer information" : "Create Customer"}
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
          {/* General Error */}
          {errors.general && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 flex items-start space-x-3">
              <AlertTriangle size={20} className="text-red-500 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                  Error
                </h3>
                <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                  {errors.general}
                </p>
              </div>
            </div>
          )}

          {/* Customer Name */}
          <div className="space-y-4">
            <div>
              <Input
                label="Customer Name *"
                icon={<User size={18} />}
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                error={errors.name}
                placeholder="Customer Name"
                required
              />
            </div>
          </div>

          {/* Email */}
          <div className="space-y-4">
            <div>
              <Input
                label="Email Address *"
                icon={<Mail size={18} />}
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                onBlur={handleEmailBlur}
                error={errors.email}
                placeholder="customer@example.com"
                required
              />
            </div>
          </div>

          {/* Phone */}
          <div className="space-y-4">
            <div>
              <Input
                label="Phone Number"
                icon={<Phone size={18} />}
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleInputChange}
                error={errors.phone}
                placeholder="+1 (555) 123-4567"
              />
            </div>
          </div>

          {/* Address */}
          <div className="space-y-4">
            <div>
              <Input
                label="Address"
                icon={<MapPin size={18} />}
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                error={errors.address}
                placeholder="Address"
              />
            </div>
          </div>

          {/* Error Display */}
          {errors.general && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <X size={20} className="text-red-400" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">
                    Error
                  </h3>
                  <div className="mt-1 text-sm text-red-700">
                    {errors.general}
                  </div>
                </div>
              </div>
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
              {isSubmitting ? "Saving..." : customer ? "Update Customer" : "Create Customer"}
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

export default NewCustomerDrawer;
