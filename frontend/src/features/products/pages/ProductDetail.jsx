import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  ArrowLeft,
  Edit,
  Trash2,
  Package,
  DollarSign,
  Hash,
  AlertTriangle,
  Calendar,
  User,
  Tag,
  Image as ImageIcon,
  X,
  Save,
  ClipboardList,
  ClipboardPaste,
  Upload,
  Loader2,
} from "lucide-react";
import { fetchProductById, updateProduct, deleteProduct, fetchCategories, uploadProductImage } from "../../../store/slices/productSlice";
import { showToast } from "../../../store/slices/uiSlice";
import Button from "../../../components/shared/Button";
import Input from "../../../components/shared/Input";

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { selectedProduct, loading, error, categories } = useSelector((state) => state.product);

  const [isEditing, setIsEditing] = useState(false);
  const [isEditingPricing, setIsEditingPricing] = useState(false);
  const [isEditingImage, setIsEditingImage] = useState(false);
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [imageFiles, setImageFiles] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);

  useEffect(() => {
    console.log("ProductDetail useEffect - id:", id, "selectedProduct:", selectedProduct);
    if (id) {
      console.log("Dispatching fetchProductById with id:", id);
      dispatch(fetchProductById(id));
    }
    if (!categories || categories.length === 0) {
      console.log("Dispatching fetchCategories");
      dispatch(fetchCategories());
    }
  }, [dispatch, id, categories]);

  // Cleanup preview URLs when component unmounts
  useEffect(() => {
    return () => {
      previewUrls.forEach(url => URL.revokeObjectURL(url));
    };
  }, [previewUrls]);

  const updateFormDataFromProduct = useCallback((product) => {
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
  }, []);

  useEffect(() => {
    if (selectedProduct) {
      updateFormDataFromProduct(selectedProduct);
    }
  }, [selectedProduct, updateFormDataFromProduct]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: undefined }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name?.trim()) newErrors.name = "Product name is required";
    if (!formData.price || parseFloat(formData.price) <= 0)
      newErrors.price = "Price must be a positive number";
    if (!formData.quantity || parseInt(formData.quantity) < 0)
      newErrors.quantity = "Quantity must be a non-negative number";
    
    // Validate min/max stock values
    if (formData.min_stock && formData.max_stock) {
      const minStock = parseInt(formData.min_stock);
      const maxStock = parseInt(formData.max_stock);
      if (minStock < 0) newErrors.min_stock = "Minimum stock cannot be negative";
      if (maxStock < 0) newErrors.max_stock = "Maximum stock cannot be negative";
      if (minStock > maxStock) newErrors.max_stock = "Maximum stock must be greater than or equal to minimum stock";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const updatedProduct = await dispatch(updateProduct({ id, ...formData })).unwrap();
      // Update formData with the returned updated product data
      updateFormDataFromProduct(updatedProduct);
      dispatch(showToast({ message: "Product updated successfully!", type: "success" }));
      setIsEditing(false);
    } catch (err) {
      dispatch(showToast({ message: err, type: "error" }));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSavePricing = async () => {
    setIsSubmitting(true);
    try {
      const updatedProduct = await dispatch(updateProduct({ id, ...formData })).unwrap();
      // Update formData with the returned updated product data
      updateFormDataFromProduct(updatedProduct);
      dispatch(showToast({ message: "Pricing updated successfully!", type: "success" }));
      setIsEditingPricing(false);
    } catch (err) {
      dispatch(showToast({ message: err, type: "error" }));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveImage = async () => {
    if (imageFiles.length === 0) {
      dispatch(showToast({ message: "Please select an image to upload", type: "error" }));
      return;
    }

    console.log("Starting image upload...", { productId: id, file: imageFiles[0] });
    setIsSubmitting(true);
    try {
      // Upload the first selected image
      const file = imageFiles[0];
      console.log("File details:", {
        name: file.name,
        size: file.size,
        type: file.type
      });
      
      const result = await dispatch(uploadProductImage({ productId: id, file })).unwrap();
      
      console.log("Upload result:", result);
      
      if (result.success) {
        // Update formData with the returned updated product data
        updateFormDataFromProduct(result.data);
        dispatch(showToast({ message: "Image updated successfully!", type: "success" }));
        setIsEditingImage(false);
        setImageFiles([]);
        setPreviewUrls([]);
      } else {
        throw new Error(result.message || "Failed to upload image");
      }
    } catch (err) {
      console.error("Upload error:", err);
      console.error("Error details:", {
        message: err.message,
        stack: err.stack,
        response: err.response?.data
      });
      
      let errorMessage = "Failed to upload image";
      if (err.message) {
        errorMessage = err.message;
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.response?.data?.error) {
        errorMessage = err.response.data.error;
      }
      
      dispatch(showToast({ message: errorMessage, type: "error" }));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    
    if (files.length === 0) return;
    
    // Only allow one image at a time
    const file = files[0];
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      dispatch(showToast({ message: "Please select a valid image file", type: "error" }));
      return;
    }
    
    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      dispatch(showToast({ message: "Image size must be less than 5MB", type: "error" }));
      return;
    }
    
    // Clear previous files and set new one
    setImageFiles([file]);
    
    // Create preview URL
    const newPreviewUrl = URL.createObjectURL(file);
    setPreviewUrls([newPreviewUrl]);
  };

  const handleRemoveImage = (index) => {
    const newImageFiles = imageFiles.filter((_, i) => i !== index);
    const newPreviewUrls = previewUrls.filter((_, i) => i !== index);
    
    setImageFiles(newImageFiles);
    setPreviewUrls(newPreviewUrls);
  };

  const handleRemoveExistingImage = () => {
    setFormData(prev => ({ ...prev, image_url: "" }));
  };

  const handleDelete = async () => {
    setIsSubmitting(true);
    try {
      await dispatch(deleteProduct(id));
      navigate("/products");
    } catch (error) {
      console.error("Failed to delete product:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString || dateString === "Invalid date" || dateString === "Not available") {
      return "Not available";
    }
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return "Not available";
      }
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (error) {
      return "Not available";
    }
  };

  // Only show loading skeleton on initial page load, not during saves
  if (loading && !selectedProduct) {
    return (
      <div className="bg-white rounded-lg">
        <div 
          className="pt-5 pb-8 min-h-full"
          style={{ paddingLeft: '24px', paddingRight: '24px' }}
        >
          <div className="flex flex-row items-center justify-between gap-4 mb-6" style={{ marginTop: '0px' }}>
            <div className="flex items-center gap-4 flex-1" style={{ marginLeft: '0px' }}>
              <div className="h-12 w-12 bg-gray-200 rounded-lg"></div>
              <div>
                <div className="h-8 bg-gray-200 rounded w-48 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-32"></div>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="h-11 bg-gray-200 rounded w-20"></div>
              <div className="h-11 bg-gray-200 rounded w-32"></div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 mb-8" style={{ gap: '50px' }}>
            <div className="space-y-4">
              <div className="bg-gray-200 rounded-lg h-64"></div>
              <div className="bg-gray-200 rounded-lg h-12"></div>
            </div>
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-gray-200 rounded-lg h-48"></div>
              <div className="bg-gray-200 rounded-lg h-48"></div>
              <div className="bg-gray-200 rounded-lg h-48"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || (!selectedProduct && !loading)) {
    console.log("Error state - error:", error, "selectedProduct:", selectedProduct, "loading:", loading);
    return (
      <div className="bg-white rounded-lg">
        <div 
          className="pt-5 pb-8 min-h-full"
          style={{ paddingLeft: '24px', paddingRight: '24px' }}
        >
          <div className="flex flex-row items-center justify-between gap-4 mb-6" style={{ marginTop: '0px' }}>
            <div className="flex items-center gap-4 flex-1" style={{ marginLeft: '0px' }}>
              <button
                onClick={() => navigate("/products")}
                className="h-12 w-12 p-0 bg-blue-50 hover:bg-blue-100 rounded-lg flex items-center justify-center border-2"
                style={{
                  borderColor: '#3b82f6',
                  color: '#3b82f6',
                  borderWidth: '2px',
                  borderStyle: 'solid',
                  borderRadius: '8px',
                  backgroundColor: '#f0f9ff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: 0,
                  lineHeight: 1,
                  textAlign: 'center',
                  verticalAlign: 'middle',
                }}
              >
                <ArrowLeft
                  size={24}
                  style={{
                    margin: 0,
                    padding: 0,
                    lineHeight: 1,
                    fontWeight: 'bold',
                    fontSize: '24px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                />
              </button>
              <div>
                <h1
                  className="text-2xl font-bold text-gray-900 mb-1"
                  style={{ marginTop: '-4px' }}
                >
                  {error ? 'Error Loading Product' : 'Product Not Found'}
                </h1>
                <p
                  className="text-sm font-medium text-gray-600"
                  style={{ marginTop: '-2px' }}
                >
                  {error || 'Unable to load product details'}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 rounded-lg p-8 text-center">
            <p className="text-sm font-medium text-gray-600">
              {error 
                ? `There was an error loading the product: ${error}` 
                : "The product you're looking for could not be found."
              }
            </p>
            <div className="flex gap-3 mt-4 justify-center">
              <button
                onClick={() => navigate("/products")}
                className="h-11 px-4 py-3 rounded-lg"
                style={{
                  backgroundColor: '#3b82f6',
                  borderColor: '#3b82f6',
                  color: '#ffffff',
                  border: '1px solid #3b82f6',
                }}
              >
                Go Back
              </button>
              <button
                onClick={() => {
                  if (id) {
                    dispatch(fetchProductById(id));
                  }
                }}
                className="h-11 px-4 py-3 rounded-lg"
                style={{
                  backgroundColor: '#10b981',
                  borderColor: '#10b981',
                  color: '#ffffff',
                  border: '1px solid #10b981',
                }}
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Don't render the main content if we don't have a selectedProduct
  if (!selectedProduct) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg">
      <div 
        className="pt-5 pb-12 min-h-full"
        style={{ paddingLeft: '24px', paddingRight: '24px' }}
      >
        {/* Header Section - Matching Ant Design style */}
        <div className="flex flex-row items-center justify-between gap-4 mb-6" style={{ marginTop: '0px' }}>
          <div className="flex items-center gap-4 flex-1" style={{ marginLeft: '0px' }}>
            <button
              onClick={() => navigate("/products")}
              className="h-12 w-12 p-0 bg-blue-50 hover:bg-blue-100 rounded-lg flex items-center justify-center border-2"
              style={{
                borderColor: '#3b82f6',
                color: '#3b82f6',
                borderWidth: '2px',
                borderStyle: 'solid',
                borderRadius: '8px',
                backgroundColor: '#f0f9ff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 0,
                lineHeight: 1,
                textAlign: 'center',
                verticalAlign: 'middle',
              }}
            >
              <ArrowLeft
                size={24}
                style={{
                  margin: 0,
                  padding: 0,
                  lineHeight: 1,
                  fontWeight: 'bold',
                  fontSize: '24px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              />
            </button>
            <div>
              <h1
                className="text-2xl font-bold text-gray-900 mb-1"
                style={{ marginTop: '-4px' }}
              >
                {selectedProduct.name}
              </h1>
              <p
                className="text-sm font-medium text-gray-600"
                style={{ marginTop: '-2px' }}
              >
                View and manage your product
              </p>
            </div>
          </div>

        </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 mb-8" style={{ gap: '50px' }}>
        {/* Left Column - Product Information */}
        <div>
          <div 
            className="bg-white dark:bg-gray-800 rounded-lg h-fit"
            style={{ border: '2px solid rgba(229, 231, 235, 0.7)' }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: 'none' }}>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white m-0">
                Product Information
              </h3>
              <button
                type="button"
                onClick={() => setIsEditing(!isEditing)}
                className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                disabled={isSubmitting}
              >
                <Edit 
                  size={20} 
                  className={isEditing ? 'text-blue-600' : 'text-gray-600'} 
                />
              </button>
            </div>
            
            {/* Body */}
            <div className="px-6 pb-12" style={{ paddingTop: '4px' }}>
              {isEditing ? (
                <div className="space-y-4">
                  <div className="ml-2 mr-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Product Name
                    </label>
                    <input
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="Product Name..."
                      className="w-full h-11 px-3 py-2 text-base border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:border-gray-400 dark:hover:border-gray-500 focus:border-gray-400 dark:focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-400 dark:focus:ring-gray-500"
                    />
                    {errors.name && (
                      <p className="text-red-500 text-sm mt-1">{errors.name}</p>
                    )}
                  </div>

                  <div className="ml-2 mr-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Category
                    </label>
                    <select
                      name="category_id"
                      value={formData.category_id}
                      onChange={handleInputChange}
                      className="w-full h-11 px-3 py-2 text-base border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:border-gray-400 dark:hover:border-gray-500 focus:border-gray-400 dark:focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-400 dark:focus:ring-gray-500"
                    >
                      <option value="">Select Category</option>
                      {categories.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="ml-2 mr-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Description
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      placeholder="Description..."
                      className="w-full h-24 px-3 py-2 text-base border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:border-gray-400 dark:hover:border-gray-500 focus:border-gray-400 dark:focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-400 dark:focus:ring-gray-500 resize-none"
                    />
                  </div>

                  <button
                    onClick={handleSave}
                    disabled={isSubmitting || !formData.name?.trim()}
                    className="w-full py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        Save
                      </>
                    )}
                  </button>
                </div>
              ) : (
                <div className="ml-2 mr-2">
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Product Name
                      </label>
                      <div className="mt-1">
                        <span className="text-base font-semibold text-gray-900 dark:text-white">
                          {formData.name || selectedProduct.name || ""}
                        </span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Category
                      </label>
                      <div className="mt-1">
                        <span className="text-base font-semibold text-gray-900 dark:text-white">
                          {categories.find(cat => cat.id === formData.category_id)?.name || selectedProduct.category?.name || "No category"}
                        </span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Description
                      </label>
                      <div className="mt-1">
                        <span className="text-base font-semibold text-gray-900 dark:text-white">
                          {formData.description || selectedProduct.description || "No description provided"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            {/* Remove Product Button - Inside Card (only show when not editing) */}
            {!isEditing && (
              <div className="ml-2 mr-2" style={{ paddingTop: '24px', paddingBottom: '24px' }}>
                <div className="flex justify-center">
                  <button
                    onClick={() => setShowDeleteModal(true)}
                    className="w-[85%] h-12 px-4 py-3 rounded-lg font-medium flex items-center justify-center gap-2 focus:outline-none focus:ring-0 focus:shadow-none active:shadow-none"
                  style={{
                    backgroundColor: '#dc2626',
                    borderColor: '#dc2626',
                    color: '#ffffff',
                    transition: 'background-color 0.2s ease',
                    transform: 'none',
                    boxShadow: 'none',
                    border: '1px solid #dc2626',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#b91c1c';
                    e.currentTarget.style.borderColor = '#b91c1c';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#dc2626';
                    e.currentTarget.style.borderColor = '#dc2626';
                  }}
                >
                    <Trash2 className="w-5 h-5" />
                    <span>Remove Product</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Unified Card Container */}
        <div className="lg:col-span-2" style={{ marginRight: '0px' }}>
          <div 
            className="bg-white dark:bg-gray-800 rounded-lg h-fit"
            style={{ border: '2px solid rgba(229, 231, 235, 0.7)' }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: 'none' }}>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white m-0">
                Product Details
              </h3>
            </div>
            
            {/* Body - Unified Content */}
            <div className="px-6 pb-12" style={{ paddingTop: '4px' }}>
              {/* Pricing & Inventory Section */}
              <div className="ml-2 mr-2" style={{ paddingTop: '24px' }}>
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white m-0">
                    Pricing & Inventory
                  </h4>
                  <button
                    type="button"
                    onClick={() => setIsEditingPricing(!isEditingPricing)}
                    className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    disabled={isSubmitting}
                  >
                    <Edit 
                      size={20} 
                      className={isEditingPricing ? 'text-blue-600' : 'text-gray-600'} 
                    />
                  </button>
                </div>
                
                {isEditingPricing ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Price
                        </label>
                        <Input
                          name="price"
                          type="number"
                          value={formData.price}
                          onChange={handleInputChange}
                          error={errors.price}
                          placeholder="0.00"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Cost
                        </label>
                        <Input
                          name="cost"
                          type="number"
                          value={formData.cost}
                          onChange={handleInputChange}
                          placeholder="0.00"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Quantity
                        </label>
                        <Input
                          name="quantity"
                          type="number"
                          value={formData.quantity}
                          onChange={handleInputChange}
                          error={errors.quantity}
                          placeholder="0"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Min Stock
                        </label>
                        <Input
                          name="min_stock"
                          type="number"
                          value={formData.min_stock}
                          onChange={handleInputChange}
                          error={errors.min_stock}
                          placeholder="0"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Max Stock
                        </label>
                        <Input
                          name="max_stock"
                          type="number"
                          value={formData.max_stock}
                          onChange={handleInputChange}
                          error={errors.max_stock}
                          placeholder="0"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Status
                        </label>
                        <div className="flex items-center space-x-2">
                          <div className={`w-2 h-2 rounded-full ${
                            (() => {
                              const quantity = parseInt(selectedProduct.quantity) || 0;
                              const minStock = parseInt(selectedProduct.min_stock) || 0;
                              if (quantity === 0) return 'bg-red-500';
                              if (minStock > 0 && quantity <= minStock) return 'bg-yellow-500';
                              return 'bg-green-500';
                            })()
                          }`} />
                          <span className="text-sm text-gray-900 dark:text-white">
                            {(() => {
                              const quantity = parseInt(selectedProduct.quantity) || 0;
                              const minStock = parseInt(selectedProduct.min_stock) || 0;
                              if (quantity === 0) return 'Out of Stock';
                              if (minStock > 0 && quantity <= minStock) return 'Low Stock';
                              return 'In Stock';
                            })()}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="col-span-2 flex justify-end">
                      <button
                        onClick={handleSavePricing}
                        disabled={isSubmitting}
                        className="w-[48%] py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <Save className="w-4 h-4" />
                            Save
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Price
                      </label>
                      <div className="text-gray-900 dark:text-white text-base">
                        ${(parseFloat(formData.price || selectedProduct.price || 0) || 0).toFixed(2)}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Cost
                      </label>
                      <div className="text-gray-900 dark:text-white text-base">
                        ${(parseFloat(formData.cost || selectedProduct.cost || 0) || 0).toFixed(2)}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Quantity
                      </label>
                      <div className="text-gray-900 dark:text-white text-base">
                        {parseInt(formData.quantity || selectedProduct.quantity || 0) || 0}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Min Stock
                      </label>
                      <div className="text-gray-900 dark:text-white text-base">
                        {parseInt(formData.min_stock || selectedProduct.min_stock || 0) || 0}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Max Stock
                      </label>
                      <div className="text-gray-900 dark:text-white text-base">
                        {parseInt(formData.max_stock || selectedProduct.max_stock || 0) || 0}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Status
                      </label>
                      <div className="flex items-center space-x-2">
                        <div className={`w-2 h-2 rounded-full ${
                          (() => {
                            const quantity = parseInt(formData.quantity || selectedProduct.quantity || 0) || 0;
                            const minStock = parseInt(formData.min_stock || selectedProduct.min_stock || 0) || 0;
                            if (quantity === 0) return 'bg-red-500';
                            if (minStock > 0 && quantity <= minStock) return 'bg-yellow-500';
                            return 'bg-green-500';
                          })()
                        }`} />
                        <span className="text-sm text-gray-900 dark:text-white">
                          {(() => {
                            const quantity = parseInt(formData.quantity || selectedProduct.quantity || 0) || 0;
                            const minStock = parseInt(formData.min_stock || selectedProduct.min_stock || 0) || 0;
                            if (quantity === 0) return 'Out of Stock';
                            if (minStock > 0 && quantity <= minStock) return 'Low Stock';
                            return 'In Stock';
                          })()}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Timeline Information Section */}
              <div className="ml-2 mr-2" style={{ paddingTop: '24px' }}>
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 m-0">
                  Timeline Information
                </h4>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">
                      Created
                    </label>
                    <div className="text-base font-semibold text-gray-900 dark:text-white">
                      {formatDate(selectedProduct.created_at || selectedProduct.createdAt)}
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">
                      Last Updated
                    </label>
                    <div className="text-base font-semibold text-gray-900 dark:text-white">
                      {formatDate(selectedProduct.updated_at || selectedProduct.updatedAt)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Product Image Section */}
              <div className="ml-2 mr-2" style={{ paddingTop: '24px' }}>
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white m-0">
                    Product Image
                  </h4>
                  <button
                    type="button"
                    onClick={() => setIsEditingImage(!isEditingImage)}
                    className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    disabled={isSubmitting}
                  >
                    <Edit 
                      size={20} 
                      className={isEditingImage ? 'text-blue-600' : 'text-gray-600'} 
                    />
                  </button>
                </div>
                {isEditingImage ? (
                  <div className="space-y-4">
                    {/* Existing Image */}
                    {formData.image_url && (
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Current Image
                        </label>
                        <div className="relative inline-block">
                          <img
                            src={formData.image_url}
                            alt={selectedProduct.name}
                            className="h-32 w-32 object-cover rounded-lg"
                          />
                          <button
                            type="button"
                            onClick={handleRemoveExistingImage}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Uploaded Image Preview */}
                    {previewUrls.length > 0 && (
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          New Image Preview
                        </label>
                        <div className="flex justify-center">
                          <div className="relative">
                            <img
                              src={previewUrls[0]}
                              alt="Preview"
                              className="h-32 w-32 object-cover rounded-lg"
                            />
                            <button
                              type="button"
                              onClick={() => handleRemoveImage(0)}
                              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                            >
                              <X size={16} />
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* File Upload */}
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Upload Image
                      </label>
                      <div className="flex items-center justify-center w-full">
                        <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-bray-800 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500 dark:hover:bg-gray-600">
                          <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <Upload className="w-8 h-8 mb-2 text-gray-500" />
                            <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                              <span className="font-semibold">Click to upload</span> or drag and drop
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">PNG, JPG, GIF (MAX. 5MB)</p>
                          </div>
                          <input
                            type="file"
                            className="hidden"
                            accept="image/*"
                            onChange={handleFileUpload}
                          />
                        </label>
                      </div>
                    </div>

                    
                    <div className="w-full">
                      <button
                        onClick={handleSaveImage}
                        disabled={isSubmitting}
                        className="w-full py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <Save className="w-4 h-4" />
                            Save
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex justify-center">
                    {(formData.image_url || selectedProduct.image_url) ? (
                      <img
                        src={formData.image_url || selectedProduct.image_url}
                        alt={formData.name || selectedProduct.name}
                        className="h-48 w-48 object-cover rounded-lg"
                      />
                    ) : (
                      <div className="h-48 w-48 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                        <ImageIcon size={48} className="text-gray-400" />
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 text-center">
              Delete Product
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6 text-center">
              Are you sure you want to delete "{selectedProduct.name}"? This action cannot be undone.
            </p>
            <div className="flex space-x-3">
              <Button
                variant="outline"
                onClick={() => setShowDeleteModal(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleDelete}
                disabled={isSubmitting}
                className="flex-1 bg-red-600 hover:bg-red-700 flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetail;
