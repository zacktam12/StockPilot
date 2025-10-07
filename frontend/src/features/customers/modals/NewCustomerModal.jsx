// src/features/customers/modals/NewCustomerModal.jsx
import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { User, Mail, Phone, MapPin } from "lucide-react";
import {
  createCustomer,
  updateCustomer,
  closeModal,
} from "../../../store/slices/customerSlice";
import Button from "../../../components/shared/Button";
import Input from "../../../components/shared/Input";
import { useOutsideClick } from "../../../hooks/useOutsideClick";
import {
  validateEmail,
  validatePhone,
  validateName,
  sanitizeEmail,
  sanitizePhone
} from "../../../utils/authValidation";

const NewCustomerModal = () => {
  const dispatch = useDispatch();
  const {
    isModalOpen,
    editingCustomer,
    loading: saveLoading,
    error: saveError,
  } = useSelector((state) => state.customer);

  const isEdit = Boolean(editingCustomer);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
  });
  const [errors, setErrors] = useState({});

  // Initialize form when modal opens or editingCustomer changes
  useEffect(() => {
    if (editingCustomer) {
      setFormData({
        name: editingCustomer.name,
        email: editingCustomer.email,
        phone: editingCustomer.phone || "",
        address: editingCustomer.address || "",
      });
    } else {
      setFormData({
        name: "",
        email: "",
        phone: "",
        address: "",
      });
    }
  }, [editingCustomer]);

  // Add outside click functionality
  const modalRef = useOutsideClick(() => {
    if (isModalOpen) {
      dispatch(closeModal());
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

  const handleInputChange = (field, value) => {
    // Sanitize phone as user types
    let sanitizedValue = value;
    if (field === 'phone') {
      sanitizedValue = sanitizePhone(value);
    }
    
    setFormData({ ...formData, [field]: sanitizedValue });
    
    // Real-time validation
    if (sanitizedValue) {
      let validation = { isValid: true, error: null };
      
      switch (field) {
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
        setErrors(prev => ({ ...prev, [field]: validation.error }));
      } else {
        setErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors[field];
          return newErrors;
        });
      }
    } else {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleEmailBlur = () => {
    if (formData.email) {
      const sanitized = sanitizeEmail(formData.email);
      setFormData({ ...formData, email: sanitized });
      
      const validation = validateEmail(sanitized);
      if (!validation.isValid && validation.error) {
        setErrors(prev => ({ ...prev, email: validation.error }));
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      if (isEdit) {
        await dispatch(
          updateCustomer({
            id: editingCustomer.id,
            ...formData,
          })
        ).unwrap();
      } else {
        await dispatch(createCustomer(formData)).unwrap();
      }

      // On success, the slice will automatically update the state
      dispatch(closeModal());
    } catch {
      // Error is already handled by the slice
    }
  };

  if (!isModalOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div
        ref={modalRef}
        className="bg-white dark:bg-gray-800 text-gray-800 dark:text-white rounded-lg shadow-xl max-w-md w-full"
      >
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold">
            {isEdit ? "Edit Customer" : "Add New Customer"}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <Input
            label="Full Name"
            icon={<User size={18} />}
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            error={errors.name}
            placeholder="John Doe"
            required
          />

          <Input
            label="Email"
            type="email"
            icon={<Mail size={18} />}
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            onBlur={handleEmailBlur}
            error={errors.email}
            placeholder="customer@example.com"
            required
          />

          <Input
            label="Phone"
            type="tel"
            icon={<Phone size={18} />}
            value={formData.phone}
            onChange={(e) => handleInputChange('phone', e.target.value)}
            error={errors.phone}
            placeholder="+1 (555) 123-4567"
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
              Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MapPin size={18} className="text-gray-400" />
              </div>
              <textarea
                value={formData.address}
                onChange={(e) =>
                  setFormData({ ...formData, address: e.target.value })
                }
                className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 pl-10 p-2 shadow-sm min-h-[80px]"
              />
            </div>
          </div>

          {saveError && (
            <div className="text-red-600 text-sm bg-red-50 p-3 rounded-md">
              {saveError}
            </div>
          )}

          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => dispatch(closeModal())}
              disabled={saveLoading}
            >
              Cancel
            </Button>
            <Button variant="primary" type="submit" isLoading={saveLoading}>
              {isEdit ? "Update Customer" : "Create Customer"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewCustomerModal;
