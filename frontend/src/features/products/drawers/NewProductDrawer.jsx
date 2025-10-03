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

    if (!formData.name.trim()) {
      newErrors.name = "Product name is required";
    }

    if (!formData.price || parseFloat(formData.price) <= 0) {
      newErrors.price = "Valid price is required";
    }

    if (!formData.category_id) {
      newErrors.category_id = "Category is required";
    }

    if (formData.quantity && parseInt(formData.quantity) < 0) {
      newErrors.quantity = "Quantity cannot be negative";
    }

    if (formData.min_stock && parseInt(formData.min_stock) < 0) {
      newErrors.min_stock = "Minimum stock cannot be negative";
    }

    if (formData.max_stock && parseInt(formData.max_stock) < 0) {
      newErrors.max_stock = "Maximum stock cannot be negative";
    }

    if (formData.min_stock && formData.max_stock && 
        parseInt(formData.min_stock) > parseInt(formData.max_stock)) {
      newErrors.max_stock = "Maximum stock must be greater than minimum stock";
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

      console.log('Creating product with data:', productData);

      if (imageFile) {
        try {
          // First upload the image
          const imageFormData = new FormData();
          imageFormData.append('image', imageFile);
          
          console.log('Uploading image...');
          const imageResponse = await productsAPI.uploadImage(imageFormData);
          console.log('Image upload response:', imageResponse.data);
          
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
    <div className="fixed inset-0 bg-black/30 z-[9999] flex justify-end" style={{ top: 0, left: 0, right: 0, bottom: 0 }}>
      <div
        className="bg-white dark:bg-gray-800 text-gray-800 dark:text-white w-full max-w-lg h-screen overflow-y-auto shadow-2xl"
        ref={drawerRef}
        style={{ marginTop: 0, top: 0, height: '100vh' }}
      >
        {/* Drawer Header */}
        <div className="sticky top-0 bg-white dark:bg-gray-800 px-6 py-4 z-10 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {product ? "Edit Product" : "Products"}
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {product ? "Update product information" : "Create a new product"}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <X size={20} className="text-red-500" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-8 space-y-8">
          {/* Basic Information */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Product Information</h3>
            <div className="space-y-4">
              <Input
                label="Product Name"
                icon={<Package size={18} />}
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                error={errors.name}
                placeholder="Enter product name"
                required
              />

            </div>
          </div>

          {/* Pricing & Inventory */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Pricing & Inventory</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Price"
                icon={<DollarSign size={18} />}
                name="price"
                type="number"
                step="0.01"
                value={formData.price}
                onChange={handleInputChange}
                error={errors.price}
                placeholder="0.00"
                required
              />

              <Input
                label="Cost"
                icon={<DollarSign size={18} />}
                name="cost"
                type="number"
                step="0.01"
                value={formData.cost}
                onChange={handleInputChange}
                placeholder="0.00"
              />

              <Input
                label="Quantity"
                icon={<Hash size={18} />}
                name="quantity"
                type="number"
                value={formData.quantity}
                onChange={handleInputChange}
                error={errors.quantity}
                placeholder="0"
              />

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
          </div>

          {/* Stock Management */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Stock Management</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Minimum Stock"
                icon={<AlertTriangle size={18} />}
                name="min_stock"
                type="number"
                value={formData.min_stock}
                onChange={handleInputChange}
                error={errors.min_stock}
                placeholder="0"
              />

              <Input
                label="Maximum Stock"
                icon={<AlertTriangle size={18} />}
                name="max_stock"
                type="number"
                value={formData.max_stock}
                onChange={handleInputChange}
                error={errors.max_stock}
                placeholder="0"
              />
            </div>
          </div>


          {/* Description */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Description</h3>
            <div>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                className="w-full rounded-lg border border-gray-300 bg-white text-gray-800 shadow-sm py-3 px-4 text-sm transition duration-150 ease-in-out hover:border-gray-600 focus:outline-none min-h-[100px]"
                placeholder="Enter product description"
              />
            </div>
          </div>

          {/* Image Upload */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Product Image</h3>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg">
              <div className="space-y-1 text-center">
                {formData.image_url ? (
                  <div className="relative">
                    <img
                      src={formData.image_url}
                      alt="Product preview"
                      className="mx-auto h-32 w-32 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setFormData((prev) => ({ ...prev, image_url: "" }));
                        setImageFile(null);
                      }}
                      className="absolute top-0 right-0 -mt-2 -mr-2 bg-red-100 text-red-600 rounded-full p-1 hover:bg-red-200"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <Image size={48} className="mx-auto h-12 w-12 text-gray-400" />
                )}
                <div className="flex text-sm text-gray-600">
                  <label className="relative cursor-pointer rounded-lg font-medium text-indigo-600 hover:text-indigo-500">
                    <span>Upload a file</span>
                    <input
                      type="file"
                      className="sr-only"
                      accept="image/*"
                      onChange={handleImageChange}
                    />
                  </label>
                  <p className="pl-1">or drag and drop</p>
                </div>
                <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                {errors.image && (
                  <p className="text-xs text-red-500 mt-1">{errors.image}</p>
                )}
              </div>
            </div>
          </div>

          {/* Error Message */}
          {errors.submit && (
            <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg">
              {errors.submit}
            </div>
          )}

          {/* Form Actions */}
          <div className="flex justify-center space-x-4 pt-8 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-6 py-3 rounded-lg border border-blue-300 !text-blue-600 hover:bg-blue-50 hover:border-blue-400 hover:!text-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed bg-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-3 rounded-lg flex items-center justify-center focus:outline-none focus:ring-0 focus:shadow-none active:shadow-none disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                backgroundColor: isSubmitting ? '#9ca3af' : '#3b82f6',
                borderColor: isSubmitting ? '#9ca3af' : '#3b82f6',
                color: '#ffffff',
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
              {isSubmitting ? "Saving..." : product ? "Update Product" : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};

export default NewProductDrawer;
