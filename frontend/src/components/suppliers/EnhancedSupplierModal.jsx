// Enhanced Supplier Modal with validation and better UX
import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useFormik } from 'formik';
import { 
  Building2, 
  Mail, 
  Phone, 
  MapPin, 
  User, 
  X, 
  Loader2,
  AlertCircle,
  CheckCircle
} from "lucide-react";
import {
  createSupplier,
  updateSupplier,
  closeModal,
} from "../../../store/slices/supplierSlice";
import Button from "../../../components/shared/Button";
import Input from "../../../components/shared/Input";
import { useOutsideClick } from "../../../hooks/useOutsideClick";
import { 
  supplierValidationSchema, 
  sanitizeInput, 
  formatPhoneNumber,
  validateField 
} from "./SupplierFormValidation";

const EnhancedSupplierModal = () => {
  const dispatch = useDispatch();
  const {
    modal: { isOpen, mode, formData },
    loading: saveLoading,
    error: saveError,
  } = useSelector((state) => state.supplier);

  const [fieldErrors, setFieldErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const formik = useFormik({
    initialValues: {
      name: formData?.name || '',
      contactName: formData?.contactName || '',
      email: formData?.email || '',
      phone: formData?.phone || '',
      address: formData?.address || '',
      companyName: formData?.companyName || '',
      notes: formData?.notes || '',
      status: formData?.status || 'active',
    },
    validationSchema: supplierValidationSchema,
    onSubmit: async (values, { setSubmitting, setErrors }) => {
      setIsSubmitting(true);
      try {
        // Sanitize all inputs
        const sanitizedValues = Object.keys(values).reduce((acc, key) => {
          acc[key] = sanitizeInput(values[key]);
          return acc;
        }, {});

        if (mode === "edit") {
          await dispatch(updateSupplier({ ...sanitizedValues, id: formData.id })).unwrap();
        } else {
          await dispatch(createSupplier(sanitizedValues)).unwrap();
        }

        dispatch(closeModal());
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
    const { isValid, error } = await validateField(fieldName, formik.values[fieldName], supplierValidationSchema);
    
    setFieldErrors(prev => ({
      ...prev,
      [fieldName]: isValid ? null : error
    }));
  };

  // Format phone number on change
  const handlePhoneChange = (e) => {
    const formatted = formatPhoneNumber(e.target.value);
    formik.setFieldValue('phone', formatted);
  };

  const modalRef = React.useRef(null);

  useOutsideClick(modalRef, () => {
    if (isOpen && !isSubmitting) {
      dispatch(closeModal());
    }
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div
        ref={modalRef}
        className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">
            {mode === "edit" ? "Edit Supplier" : "Add New Supplier"}
          </h2>
          <button
            onClick={() => dispatch(closeModal())}
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

          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 flex items-center">
              <Building2 size={20} className="mr-2" />
              Basic Information
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Supplier Name */}
              <div className="md:col-span-2">
                <Input
                  label="Supplier Name *"
                  name="name"
                  value={formik.values.name}
                  onChange={formik.handleChange}
                  onBlur={(e) => {
                    formik.handleBlur(e);
                    handleFieldBlur('name');
                  }}
                  error={formik.touched.name && (formik.errors.name || fieldErrors.name)}
                  placeholder="Enter supplier name"
                  required
                />
              </div>

              {/* Company Name */}
              <div>
                <Input
                  label="Company Name"
                  name="companyName"
                  value={formik.values.companyName}
                  onChange={formik.handleChange}
                  onBlur={(e) => {
                    formik.handleBlur(e);
                    handleFieldBlur('companyName');
                  }}
                  error={formik.touched.companyName && (formik.errors.companyName || fieldErrors.companyName)}
                  placeholder="Enter company name"
                />
              </div>

              {/* Contact Name */}
              <div>
                <Input
                  label="Contact Person"
                  name="contactName"
                  value={formik.values.contactName}
                  onChange={formik.handleChange}
                  onBlur={(e) => {
                    formik.handleBlur(e);
                    handleFieldBlur('contactName');
                  }}
                  error={formik.touched.contactName && (formik.errors.contactName || fieldErrors.contactName)}
                  placeholder="Enter contact person name"
                />
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 flex items-center">
              <Mail size={20} className="mr-2" />
              Contact Information
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Email */}
              <div>
                <Input
                  label="Email"
                  name="email"
                  type="email"
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

              {/* Phone */}
              <div>
                <Input
                  label="Phone"
                  name="phone"
                  value={formik.values.phone}
                  onChange={handlePhoneChange}
                  onBlur={(e) => {
                    formik.handleBlur(e);
                    handleFieldBlur('phone');
                  }}
                  error={formik.touched.phone && (formik.errors.phone || fieldErrors.phone)}
                  placeholder="Enter phone number"
                />
              </div>
            </div>

            {/* Address */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <MapPin size={16} className="inline mr-1" />
                Address
              </label>
              <textarea
                name="address"
                value={formik.values.address}
                onChange={formik.handleChange}
                onBlur={(e) => {
                  formik.handleBlur(e);
                  handleFieldBlur('address');
                }}
                placeholder="Enter address"
                rows={3}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  formik.touched.address && (formik.errors.address || fieldErrors.address)
                    ? 'border-red-300 focus:ring-red-500'
                    : 'border-gray-300'
                }`}
              />
              {formik.touched.address && (formik.errors.address || fieldErrors.address) && (
                <p className="mt-1 text-sm text-red-600">{formik.errors.address || fieldErrors.address}</p>
              )}
            </div>
          </div>

          {/* Additional Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 flex items-center">
              <User size={20} className="mr-2" />
              Additional Information
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                </select>
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
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end space-x-3 pt-6 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => dispatch(closeModal())}
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
                  <span>{mode === "edit" ? "Updating..." : "Creating..."}</span>
                </>
              ) : (
                <>
                  <CheckCircle size={16} />
                  <span>{mode === "edit" ? "Update Supplier" : "Create Supplier"}</span>
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EnhancedSupplierModal;

