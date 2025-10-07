// src/features/products/drawers/NewProductDrawer.jsx
import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  createProduct,
  fetchCategories,
} from "../../../store/slices/productSlice";
import {
  Package,
  DollarSign,
  Hash,
  Upload,
  Image,
  AlertTriangle,
  X,
  Search,
  ChevronDown,
} from "lucide-react";
import Button from "../../../components/shared/Button";
import Input from "../../../components/shared/Input";
import NumericInput from "../../../components/shared/NumericInput";
import { useOutsideClick } from "../../../hooks/useOutsideClick";
import { productsAPI } from "../../../services/api";

const NewProductDrawer = ({ product, isOpen, onClose }) => {
  const dispatch = useDispatch();
  const drawerRef = useRef(null);
  const {
    categories,
    categoriesLoading,
    categoriesError,
  } = useSelector((state) => state.product || {});

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    cost: "",
    quantity: "",
    min_stock: "",
    max_stock: "",
    category_id: "",
    image_url: "",
  });

  const [imageFile, setImageFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [categorySearch, setCategorySearch] = useState("");
  const categoryRef = useRef(null);

  // Load categories on mount
  useEffect(() => {
    if (isOpen && (!categories || categories.length === 0)) {
      dispatch(fetchCategories());
    }
  }, [dispatch, isOpen, categories]);

  // Reset form when drawer opens for new product
  useEffect(() => {
    if (isOpen && !product) {
      setFormData({
        name: "",
        description: "",
        price: "",
        cost: "",
        quantity: "",
        min_stock: "",
        max_stock: "",
        category_id: "",
        image_url: "",
      });
      setImageFile(null);
      setErrors({});
      setCategorySearch("");
      setIsCategoryOpen(false);
    }
  }, [isOpen, product]);

  // Populate form when editing
  useEffect(() => {
    if (product && isOpen) {
      setFormData({
        name: product.name || "",
        description: product.description || "",
        price: product.price || "",
        cost: product.cost || "",
        quantity: product.quantity || "",
        min_stock: product.min_stock || "",
        max_stock: product.max_stock || "",
        category_id: product.category_id || "",
        image_url: product.image_url || "",
      });
    } else if (isOpen) {
      // Reset form for new product
      setFormData({
        name: "",
        description: "",
        price: "",
        cost: "",
        quantity: "",
        min_stock: "",
        max_stock: "",
        category_id: "",
        image_url: "",
      });
    }
  }, [product, isOpen]);

  // Close drawer when clicking outside
  useOutsideClick(drawerRef, () => {
    if (isOpen) {
      onClose();
    }
  });

  useOutsideClick(categoryRef, () => {
    setIsCategoryOpen(false);
    setCategorySearch("");
  });

  // Filter categories based on search
  const filteredCategories = categories?.filter(category =>
    category.name.toLowerCase().includes(categorySearch.toLowerCase())
  ) || [];

  const validateForm = () => {
    const newErrors = {};

    // Validate name
    if (!formData.name.trim()) {
      newErrors.name = "Product name is required";
    }

    // Validate price
    if (!formData.price) {
      newErrors.price = "Price is required";
    } else {
      const price = parseFloat(formData.price);
      if (isNaN(price) || price <= 0) {
        newErrors.price = "Price must be a positive number";
      }
    }

    // Validate cost (optional but must be valid if provided)
    if (formData.cost) {
      const cost = parseFloat(formData.cost);
      if (isNaN(cost) || cost < 0) {
        newErrors.cost = "Cost must be a non-negative number";
      }
    }

    // Validate category
    if (!formData.category_id) {
      newErrors.category_id = "Category is required";
    }

    // Validate quantity (optional but must be valid if provided)
    if (formData.quantity) {
      const quantity = parseInt(formData.quantity);
      if (isNaN(quantity) || quantity < 0) {
        newErrors.quantity = "Quantity must be a non-negative integer";
      }
    }

    // Validate min_stock (optional but must be valid if provided)
    if (formData.min_stock) {
      const minStock = parseInt(formData.min_stock);
      if (isNaN(minStock) || minStock < 0) {
        newErrors.min_stock = "Minimum stock must be a non-negative integer";
      }
      
      // Cross-validation with max_stock
      if (formData.max_stock) {
        const maxStock = parseInt(formData.max_stock);
        if (!isNaN(minStock) && !isNaN(maxStock) && minStock > maxStock) {
          newErrors.max_stock = "Maximum stock must be greater than or equal to minimum stock";
        }
      }
    }

    // Validate max_stock (optional but must be valid if provided)
    if (formData.max_stock) {
      const maxStock = parseInt(formData.max_stock);
      if (isNaN(maxStock) || maxStock < 0) {
        newErrors.max_stock = "Maximum stock must be a non-negative integer";
      }
      
      // Cross-validation with min_stock (check from max side too)
      if (formData.min_stock && !newErrors.max_stock) {
        const minStock = parseInt(formData.min_stock);
        if (!isNaN(minStock) && !isNaN(maxStock) && maxStock < minStock) {
          newErrors.max_stock = "Maximum stock must be greater than or equal to minimum stock";
        }
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
      const productData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        price: parseFloat(formData.price),
        cost: formData.cost ? parseFloat(formData.cost) : 0,
        quantity: parseInt(formData.quantity) || 0,
        min_stock: parseInt(formData.min_stock) || 0,
        max_stock: parseInt(formData.max_stock) || 0,
        categoryId: formData.category_id || null,
        image_url: formData.image_url || null,
      };

      // Remove null/undefined values
      Object.keys(productData).forEach(key => {
        if (productData[key] === null || productData[key] === undefined || productData[key] === '') {
          delete productData[key];
        }
      });
      if (imageFile) {
        try {
          // First upload the image
          const imageFormData = new FormData();
          imageFormData.append('image', imageFile);
          const imageResponse = await productsAPI.uploadImage(imageFormData);
          if (imageResponse.data.success && imageResponse.data.imageUrl) {
            productData.image_url = imageResponse.data.imageUrl;
          }
        } catch (imageError) {
          console.error('Image upload failed:', imageError);
          // Continue without image rather than failing the entire operation
          setErrors({ image: 'Failed to upload image, but product will be created without image' });
        }
      }

      // Create the product
      await dispatch(createProduct(productData)).unwrap();
      onClose();
    } catch (error) {
      console.error("Error creating product:", error);
      setErrors({ submit: error.message || "Failed to create product. Please try again." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
    
    // Real-time validation for min/max stock cross-validation
    if (name === 'min_stock' || name === 'max_stock') {
      const newFormData = { ...formData, [name]: value };
      
      if (newFormData.min_stock && newFormData.max_stock) {
        const minStock = parseInt(newFormData.min_stock);
        const maxStock = parseInt(newFormData.max_stock);
        
        if (!isNaN(minStock) && !isNaN(maxStock) && minStock > maxStock) {
          setErrors((prev) => ({
            ...prev,
            max_stock: "Maximum stock must be greater than or equal to minimum stock"
          }));
        } else {
          // Clear the error if values are now valid
          setErrors((prev) => {
            const newErrors = { ...prev };
            if (newErrors.max_stock === "Maximum stock must be greater than or equal to minimum stock") {
              delete newErrors.max_stock;
            }
            return newErrors;
          });
        }
      }
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setErrors({ image: 'Please select a valid image file' });
        return;
      }
      
      // Validate file size (10MB max)
      if (file.size > 10 * 1024 * 1024) {
        setErrors({ image: 'Image size must be less than 10MB' });
        return;
      }
      
      setImageFile(file);
      // Create a preview URL
      const previewUrl = URL.createObjectURL(file);
      setFormData((prev) => ({ ...prev, image_url: previewUrl }));
      setErrors((prev) => ({ ...prev, image: '' }));
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
                {product ? "Edit Product" : "Product"}
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {product ? "Update product information" : "Create Product"}
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
          <div className="space-y-4">
            <div>
              <Input
                label="Product Name *"
                icon={<Package size={18} />}
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                error={errors.name}
                placeholder="Product Name"
                required
              />
            </div>
          </div>

          {/* Price and Cost */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <NumericInput
              label="Price"
              icon={<DollarSign size={18} />}
              name="price"
              value={formData.price}
              onChange={handleInputChange}
              error={errors.price}
              placeholder="0.00"
              min={0.01}
              allowDecimal={true}
              decimals={2}
              required={true}
            />
            <NumericInput
              label="Cost"
              icon={<DollarSign size={18} />}
              name="cost"
              value={formData.cost}
              onChange={handleInputChange}
              error={errors.cost}
              placeholder="0.00"
              min={0}
              allowDecimal={true}
              decimals={2}
            />
          </div>

          {/* Category */}
          <div className="space-y-4">
            <div className="relative" ref={categoryRef}>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category *
              </label>
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search or select category..."
                  value={categorySearch || (formData.category_id ? categories?.find(cat => cat.id === formData.category_id)?.name || "" : "")}
                  onChange={(e) => {
                    setCategorySearch(e.target.value);
                    setIsCategoryOpen(true);
                    // Clear selection if user types something different
                    if (formData.category_id && e.target.value !== categories?.find(cat => cat.id === formData.category_id)?.name) {
                      setFormData(prev => ({ ...prev, category_id: "" }));
                    }
                  }}
                  onFocus={() => setIsCategoryOpen(true)}
                  className={`w-full pl-12 pr-12 py-3 text-sm border bg-white text-gray-800 rounded-lg shadow-sm transition duration-150 ease-in-out hover:border-gray-600 focus:outline-none focus:ring-0 ${
                    errors.category_id ? 'border-red-300 focus:border-red-500' : 'border-gray-300 focus:border-gray-300'
                  }`}
                />
                <ChevronDown size={16} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              </div>
              
              {isCategoryOpen && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                  {categoriesLoading ? (
                    <div className="px-4 py-2 text-sm text-gray-500">
                      Loading categories...
                    </div>
                  ) : categoriesError ? (
                    <div className="px-4 py-2 text-sm text-red-500">
                      Error loading categories
                    </div>
                  ) : filteredCategories.length > 0 ? (
                    filteredCategories.map((category) => (
                      <button
                        key={category.id}
                        type="button"
                        onClick={() => {
                          setFormData(prev => ({ ...prev, category_id: category.id }));
                          setCategorySearch(category.name);
                          setIsCategoryOpen(false);
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        {category.name}
                      </button>
                    ))
                  ) : (
                    <div className="px-4 py-2 text-sm text-gray-500">
                      {categorySearch ? "No categories found" : "No categories available"}
                    </div>
                  )}
                </div>
              )}
              {errors.category_id && (
                <p className="mt-1 text-sm text-red-600">{errors.category_id}</p>
              )}
            </div>
          </div>

          {/* Stock Management */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Stock Management</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <NumericInput
                label="Current Quantity"
                icon={<Package size={18} />}
                name="quantity"
                value={formData.quantity}
                onChange={handleInputChange}
                error={errors.quantity}
                placeholder="0"
                min={0}
                allowDecimal={false}
              />
              <NumericInput
                label="Minimum Stock"
                icon={<AlertTriangle size={18} />}
                name="min_stock"
                value={formData.min_stock}
                onChange={handleInputChange}
                error={errors.min_stock}
                placeholder="0"
                min={0}
                allowDecimal={false}
              />
              <NumericInput
                label="Maximum Stock"
                icon={<AlertTriangle size={18} />}
                name="max_stock"
                value={formData.max_stock}
                onChange={handleInputChange}
                error={errors.max_stock}
                placeholder="0"
                min={0}
                allowDecimal={false}
              />
            </div>
          </div>

          {/* Image Upload */}
          <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Product Image
            </label>
            <div className="flex items-center justify-center w-full">
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-gray-800 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  {imageFile ? (
                    <img
                      src={URL.createObjectURL(imageFile)}
                      alt="Preview"
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                  ) : formData.image_url ? (
                    <img
                      src={formData.image_url}
                      alt="Current"
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                  ) : (
                    <>
                      <Upload className="w-8 h-8 mb-4 text-gray-500" />
                      <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                        <span className="font-semibold">Click to upload</span> or drag and drop
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">PNG, JPG or GIF (MAX. 800x400px)</p>
                    </>
                  )}
                </div>
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handleImageChange}
                />
              </label>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Product Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                className="w-full rounded-lg border border-gray-300 bg-white text-gray-800 shadow-sm py-3 px-4 text-sm transition duration-150 ease-in-out hover:border-gray-600 focus:outline-none min-h-[80px]"
                placeholder="Description"
              />
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
              {isSubmitting ? "Saving..." : product ? "Update Product" : "Create Product"}
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

export default NewProductDrawer;
