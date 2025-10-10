// src/features/category/drawers/NewCategoryDrawer.jsx
import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  createCategory,
  updateCategory,
  closeModal,
} from "../../../store/slices/categorySlice";
import {
  Tag,
  FileText,
  X,
} from "lucide-react";
import Button from "../../../components/shared/Button";
import Input from "../../../components/shared/Input";
import { useOutsideClick } from "../../../hooks/useOutsideClick";

const NewCategoryDrawer = ({ category, isOpen, onClose }) => {
  const dispatch = useDispatch();
  const drawerRef = useRef(null);
  const {
    modal,
    error,
  } = useSelector((state) => state.category);
  
  // Safely destructure modal properties with fallbacks
  const {
    isOpen: modalIsOpen = false,
    mode = "create",
    currentCategory = null,
    isLoading = false,
  } = modal || {};

  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  // Reset form when drawer opens for new category
  useEffect(() => {
    if (isOpen && !category && mode === "create") {
      setFormData({
        name: "",
        description: "",
      });
      setErrors({});
    }
  }, [isOpen, category, mode]);

  // Initialize form when editing
  useEffect(() => {
    if (mode === "edit" && currentCategory) {
      setFormData({
        name: currentCategory.name,
        description: currentCategory.description || "",
      });
    }
  }, [mode, currentCategory]);

  // Add outside click functionality
  useOutsideClick(drawerRef, () => {
    if (isOpen) {
      onClose();
    }
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = "Category name is required";
    } else if (formData.name.trim().length < 2) {
      newErrors.name = "Category name must be at least 2 characters";
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
      if (mode === "edit" && currentCategory) {
        await dispatch(
          updateCategory({
            id: currentCategory.id,
            ...formData,
          })
        ).unwrap();
      } else {
        await dispatch(createCategory(formData)).unwrap();
      }

      // Close drawer after successful submission
      onClose();
    } catch (error) {
            setErrors({
        submit: error.message || "Failed to save category. Please try again."
      });
    } finally {
      setIsSubmitting(false);
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
                {mode === "edit" ? "Edit Category" : "Category"}
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {mode === "edit" ? "Update category information" : "Create Category"}
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
          
          {/* Category Name */}
          <div className="space-y-4">
            <div>
              <Input
                label="Category Name *"
                icon={<Tag size={18} />}
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Category Name"
                error={errors.name}
                required
              />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Description"
                className="w-full rounded-lg border border-gray-300 bg-white text-gray-800 shadow-sm py-3 px-4 text-sm transition duration-150 ease-in-out hover:border-gray-600 focus:outline-none min-h-[80px]"
              />
            </div>
          </div>

          {/* Error Display */}
          {errors.submit && (
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
                    {errors.submit}
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
              {isSubmitting ? "Saving..." : mode === "edit" ? "Update Category" : "Create Category"}
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

export default NewCategoryDrawer;
