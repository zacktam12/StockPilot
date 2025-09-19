// Enhanced Customer Modal with validation and better UX
import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useFormik } from 'formik';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Building2, 
  CreditCard,
  Calendar,
  Tag,
  X,
  Loader2,
  AlertCircle,
  CheckCircle,
  Star,
  TrendingUp,
  AlertTriangle,
  Shield,
  UserCheck
} from "lucide-react";
import {
  createCustomer,
  updateCustomer,
  closeCustomerModal,
} from "../../../store/slices/customerSlice";
import Button from "../../../components/shared/Button";
import Input from "../../../components/shared/Input";
import { useOutsideClick } from "../../../hooks/useOutsideClick";
import { 
  customerValidationSchema, 
  sanitizeInput, 
  formatPhoneNumber,
  formatCurrency,
  calculateAge,
  getCustomerStatusColor,
  getCustomerTypeColor,
  formatCustomerType,
  formatCustomerStatus,
  isVIPCustomer,
  getCustomerPriority,
  formatFullAddress,
  getCustomerInitials,
  getCustomerContactScore
} from "./CustomerFormValidation";

const EnhancedCustomerModal = () => {
  const dispatch = useDispatch();
  const {
    isCustomerModalOpen,
    editingCustomer,
    loading: saveLoading,
    error: saveError,
  } = useSelector((state) => state.customer);

  const [fieldErrors, setFieldErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const formik = useFormik({
    initialValues: {
      name: editingCustomer?.name || '',
      email: editingCustomer?.email || '',
      phone: editingCustomer?.phone || '',
      address: editingCustomer?.address || '',
      company: editingCustomer?.company || '',
      city: editingCustomer?.city || '',
      state: editingCustomer?.state || '',
      zipCode: editingCustomer?.zipCode || '',
      country: editingCustomer?.country || '',
      status: editingCustomer?.status || 'active',
      customerType: editingCustomer?.customerType || 'individual',
      creditLimit: editingCustomer?.creditLimit || '',
      taxId: editingCustomer?.taxId || '',
      dateOfBirth: editingCustomer?.dateOfBirth || '',
      notes: editingCustomer?.notes || '',
      tags: editingCustomer?.tags || [],
      preferences: editingCustomer?.preferences || {
        newsletter: false,
        smsNotifications: false,
        emailNotifications: true,
        preferredContactMethod: 'email'
      }
    },
    validationSchema: customerValidationSchema,
    onSubmit: async (values, { setSubmitting, setErrors }) => {
      setIsSubmitting(true);
      try {
        // Sanitize all inputs
        const sanitizedValues = Object.keys(values).reduce((acc, key) => {
          if (key === 'preferences' && typeof values[key] === 'object') {
            acc[key] = values[key];
          } else if (key === 'tags' && Array.isArray(values[key])) {
            acc[key] = values[key];
          } else {
            acc[key] = sanitizeInput(values[key]);
          }
          return acc;
        }, {});

        if (editingCustomer) {
          await dispatch(updateCustomer({ ...sanitizedValues, id: editingCustomer.id })).unwrap();
        } else {
          await dispatch(createCustomer(sanitizedValues)).unwrap();
        }

        dispatch(closeCustomerModal());
      } catch (error) {
        // Handle validation errors from backend
        if (error.errors) {
          setErrors(error.errors);
        }
      } finally {
        setIsSubmitting(false);
        setSubmitting(false);
      }
    },
    enableReinitialize: true,
  });

  // Real-time validation
  const handleFieldBlur = async (fieldName) => {
    const { isValid, error } = await validateField(fieldName, formik.values[fieldName], customerValidationSchema);
    
    setFieldErrors(prev => ({
      ...prev,
      [fieldName]: isValid ? null : error
    }));
  };

  // Calculate customer metrics
  const contactScore = getCustomerContactScore(formik.values);
  const isVIP = isVIPCustomer(formik.values.creditLimit);
  const priority = getCustomerPriority(formik.values);
  const age = calculateAge(formik.values.dateOfBirth);

  const modalRef = React.useRef(null);

  useOutsideClick(modalRef, () => {
    if (isCustomerModalOpen && !isSubmitting) {
      dispatch(closeCustomerModal());
    }
  });

  if (!isCustomerModalOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div
        ref={modalRef}
        className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <User size={20} className="text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  {editingCustomer ? "Edit Customer" : "Add New Customer"}
                </h2>
                {editingCustomer && (
                  <p className="text-sm text-gray-500">
                    Customer ID: {editingCustomer.id}
                  </p>
                )}
              </div>
            </div>
            {isVIP && (
              <div className="flex items-center space-x-1 bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-medium">
                <Star size={12} />
                <span>VIP</span>
              </div>
            )}
          </div>
          <button
            onClick={() => dispatch(closeCustomerModal())}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            disabled={isSubmitting}
          >
            <X size={24} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={formik.handleSubmit} className="p-6 space-y-6">
          {/* Error Display */}
          {saveError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start space-x-3">
              <AlertCircle className="text-red-500 mt-0.5" size={20} />
              <div>
                <h3 className="text-red-800 font-medium">Error</h3>
                <p className="text-red-700 text-sm mt-1">{saveError}</p>
              </div>
            </div>
          )}

          {/* Customer Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{contactScore}%</div>
              <div className="text-xs text-gray-600">Contact Score</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600 capitalize">{priority}</div>
              <div className="text-xs text-gray-600">Priority</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {formik.values.customerType ? formatCustomerType(formik.values.customerType) : 'Individual'}
              </div>
              <div className="text-xs text-gray-600">Type</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {age ? `${age}y` : 'N/A'}
              </div>
              <div className="text-xs text-gray-600">Age</div>
            </div>
          </div>

          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 flex items-center">
              <User size={20} className="mr-2" />
              Basic Information
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Name */}
              <div>
                <Input
                  label="Full Name *"
                  name="name"
                  value={formik.values.name}
                  onChange={formik.handleChange}
                  onBlur={(e) => {
                    formik.handleBlur(e);
                    handleFieldBlur('name');
                  }}
                  error={formik.touched.name && (formik.errors.name || fieldErrors.name)}
                  placeholder="Enter full name"
                  required
                />
              </div>

              {/* Email */}
              <div>
                <Input
                  label="Email Address"
                  type="email"
                  name="email"
                  value={formik.values.email}
                  onChange={formik.handleChange}
                  onBlur={(e) => {
                    formik.handleBlur(e);
                    handleFieldBlur('email');
                  }}
                  error={formik.touched.email && (formik.errors.email || fieldErrors.email)}
                  placeholder="Enter email address"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Phone */}
              <div>
                <Input
                  label="Phone Number"
                  type="tel"
                  name="phone"
                  value={formik.values.phone}
                  onChange={(e) => {
                    const formatted = formatPhoneNumber(e.target.value);
                    formik.setFieldValue('phone', formatted);
                  }}
                  onBlur={(e) => {
                    formik.handleBlur(e);
                    handleFieldBlur('phone');
                  }}
                  error={formik.touched.phone && (formik.errors.phone || fieldErrors.phone)}
                  placeholder="Enter phone number"
                />
              </div>

              {/* Company */}
              <div>
                <Input
                  label="Company"
                  name="company"
                  value={formik.values.company}
                  onChange={formik.handleChange}
                  onBlur={(e) => {
                    formik.handleBlur(e);
                    handleFieldBlur('company');
                  }}
                  error={formik.touched.company && (formik.errors.company || fieldErrors.company)}
                  placeholder="Enter company name"
                />
              </div>
            </div>
          </div>

          {/* Address Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 flex items-center">
              <MapPin size={20} className="mr-2" />
              Address Information
            </h3>

            <div>
              <Input
                label="Street Address"
                name="address"
                value={formik.values.address}
                onChange={formik.handleChange}
                onBlur={(e) => {
                  formik.handleBlur(e);
                  handleFieldBlur('address');
                }}
                error={formik.touched.address && (formik.errors.address || fieldErrors.address)}
                placeholder="Enter street address"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* City */}
              <div>
                <Input
                  label="City"
                  name="city"
                  value={formik.values.city}
                  onChange={formik.handleChange}
                  onBlur={(e) => {
                    formik.handleBlur(e);
                    handleFieldBlur('city');
                  }}
                  error={formik.touched.city && (formik.errors.city || fieldErrors.city)}
                  placeholder="Enter city"
                />
              </div>

              {/* State */}
              <div>
                <Input
                  label="State"
                  name="state"
                  value={formik.values.state}
                  onChange={formik.handleChange}
                  onBlur={(e) => {
                    formik.handleBlur(e);
                    handleFieldBlur('state');
                  }}
                  error={formik.touched.state && (formik.errors.state || fieldErrors.state)}
                  placeholder="Enter state"
                />
              </div>

              {/* ZIP Code */}
              <div>
                <Input
                  label="ZIP Code"
                  name="zipCode"
                  value={formik.values.zipCode}
                  onChange={formik.handleChange}
                  onBlur={(e) => {
                    formik.handleBlur(e);
                    handleFieldBlur('zipCode');
                  }}
                  error={formik.touched.zipCode && (formik.errors.zipCode || fieldErrors.zipCode)}
                  placeholder="12345"
                />
              </div>
            </div>

            <div>
              <Input
                label="Country"
                name="country"
                value={formik.values.country}
                onChange={formik.handleChange}
                onBlur={(e) => {
                  formik.handleBlur(e);
                  handleFieldBlur('country');
                }}
                error={formik.touched.country && (formik.errors.country || fieldErrors.country)}
                placeholder="Enter country"
              />
            </div>
          </div>

          {/* Customer Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 flex items-center">
              <Building2 size={20} className="mr-2" />
              Customer Details
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  name="status"
                  value={formik.values.status}
                  onChange={formik.handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="blocked">Blocked</option>
                </select>
              </div>

              {/* Customer Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Customer Type
                </label>
                <select
                  name="customerType"
                  value={formik.values.customerType}
                  onChange={formik.handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="individual">Individual</option>
                  <option value="business">Business</option>
                  <option value="wholesale">Wholesale</option>
                </select>
              </div>

              {/* Credit Limit */}
              <div>
                <Input
                  label="Credit Limit"
                  type="number"
                  step="0.01"
                  min="0"
                  name="creditLimit"
                  value={formik.values.creditLimit}
                  onChange={formik.handleChange}
                  onBlur={(e) => {
                    formik.handleBlur(e);
                    handleFieldBlur('creditLimit');
                  }}
                  error={formik.touched.creditLimit && (formik.errors.creditLimit || fieldErrors.creditLimit)}
                  placeholder="0.00"
                />
                {isVIP && (
                  <div className="flex items-center space-x-1 text-yellow-600 mt-1">
                    <Star size={12} />
                    <span className="text-xs">VIP Customer</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Advanced Options */}
          <div className="space-y-4">
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex items-center space-x-2 text-blue-600 hover:text-blue-800"
            >
              <Tag size={16} />
              <span>{showAdvanced ? 'Hide' : 'Show'} Advanced Options</span>
            </button>

            {showAdvanced && (
              <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Tax ID */}
                  <div>
                    <Input
                      label="Tax ID"
                      name="taxId"
                      value={formik.values.taxId}
                      onChange={formik.handleChange}
                      onBlur={(e) => {
                        formik.handleBlur(e);
                        handleFieldBlur('taxId');
                      }}
                      error={formik.touched.taxId && (formik.errors.taxId || fieldErrors.taxId)}
                      placeholder="Enter tax ID"
                    />
                  </div>

                  {/* Date of Birth */}
                  <div>
                    <Input
                      label="Date of Birth"
                      type="date"
                      name="dateOfBirth"
                      value={formik.values.dateOfBirth}
                      onChange={formik.handleChange}
                      onBlur={(e) => {
                        formik.handleBlur(e);
                        handleFieldBlur('dateOfBirth');
                      }}
                      error={formik.touched.dateOfBirth && (formik.errors.dateOfBirth || fieldErrors.dateOfBirth)}
                    />
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Notes
                  </label>
                  <textarea
                    name="notes"
                    value={formik.values.notes}
                    onChange={formik.handleChange}
                    onBlur={(e) => {
                      formik.handleBlur(e);
                      handleFieldBlur('notes');
                    }}
                    placeholder="Enter additional notes"
                    rows={3}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      formik.touched.notes && (formik.errors.notes || fieldErrors.notes)
                        ? 'border-red-300 focus:ring-red-500'
                        : 'border-gray-300'
                    }`}
                  />
                  {formik.touched.notes && (formik.errors.notes || fieldErrors.notes) && (
                    <p className="mt-1 text-sm text-red-600">{formik.errors.notes || fieldErrors.notes}</p>
                  )}
                </div>

                {/* Preferences */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Communication Preferences
                  </label>
                  <div className="space-y-2">
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={formik.values.preferences.emailNotifications}
                        onChange={(e) => formik.setFieldValue('preferences.emailNotifications', e.target.checked)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">Email Notifications</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={formik.values.preferences.smsNotifications}
                        onChange={(e) => formik.setFieldValue('preferences.smsNotifications', e.target.checked)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">SMS Notifications</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={formik.values.preferences.newsletter}
                        onChange={(e) => formik.setFieldValue('preferences.newsletter', e.target.checked)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">Newsletter</span>
                    </label>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end space-x-3 pt-6 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => dispatch(closeCustomerModal())}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !formik.isValid}
              className="flex items-center space-x-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>{editingCustomer ? "Updating..." : "Creating..."}</span>
                </>
              ) : (
                <>
                  <CheckCircle size={16} />
                  <span>{editingCustomer ? "Update Customer" : "Create Customer"}</span>
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EnhancedCustomerModal;
