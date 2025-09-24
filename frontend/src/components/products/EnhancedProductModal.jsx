// Enhanced Product Modal with validation and better UX
import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useFormik } from 'formik';
import { 
  Package, 
  DollarSign, 
  Hash, 
  BarChart3, 
  Image, 
  Tag, 
  X, 
  Loader2,
  AlertCircle,
  CheckCircle,
  Calculator,
  TrendingUp,
  AlertTriangle
} from "lucide-react";
import {
  createProduct,
  updateProduct,
  closeProductModal,
} from "../../../store/slices/productSlice";
import Button from "../../../components/shared/Button";
import Input from "../../../components/shared/Input";
import { useOutsideClick } from "../../../hooks/useOutsideClick";
import { 
  productValidationSchema, 
  sanitizeInput, 
  formatCurrency,
  formatNumber,
  generateSKU,
  generateBarcode,
  calculateProfitMargin,
  isLowStock,
  getStockStatus,
  formatStockStatus,
  getStockStatusColor
} from "./ProductFormValidation";

const EnhancedProductModal = () => {
  const dispatch = useDispatch();
  const {
    isProductModalOpen,
    editingProduct,
    loading: saveLoading,
    error: saveError,
  } = useSelector((state) => state.product);

  const [fieldErrors, setFieldErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const formik = useFormik({
    initialValues: {
      name: editingProduct?.name || '',
      description: editingProduct?.description || '',
      sku: editingProduct?.sku || '',
      barcode: editingProduct?.barcode || '',
      price: editingProduct?.price || '',
      cost: editingProduct?.cost || '',
      quantity: editingProduct?.quantity || 0,
      minStock: editingProduct?.minStock || '',
      maxStock: editingProduct?.maxStock || '',
      categoryId: editingProduct?.category_id || '',
      image: editingProduct?.image_url || '',
      status: editingProduct?.status || 'active',
      weight: editingProduct?.weight || '',
      dimensions: editingProduct?.dimensions || { length: '', width: '', height: '' },
      tags: editingProduct?.tags || [],
      notes: editingProduct?.notes || '',
    },
    validationSchema: productValidationSchema,
    onSubmit: async (values, { setSubmitting, setErrors }) => {
      setIsSubmitting(true);
      try {
        // Sanitize all inputs
        const sanitizedValues = Object.keys(values).reduce((acc, key) => {
          if (key === 'dimensions' && typeof values[key] === 'object') {
            acc[key] = values[key];
          } else if (key === 'tags' && Array.isArray(values[key])) {
            acc[key] = values[key];
          } else {
            acc[key] = sanitizeInput(values[key]);
          }
          return acc;
        }, {});

        if (editingProduct) {
          await dispatch(updateProduct({ ...sanitizedValues, id: editingProduct.id })).unwrap();
        } else {
          await dispatch(createProduct(sanitizedValues)).unwrap();
        }

        dispatch(closeProductModal());
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
    const { isValid, error } = await validateField(fieldName, formik.values[fieldName], productValidationSchema);
    
    setFieldErrors(prev => ({
      ...prev,
      [fieldName]: isValid ? null : error
    }));
  };

  // Auto-generate SKU
  const handleGenerateSKU = () => {
    if (formik.values.name) {
      const sku = generateSKU(formik.values.name);
      formik.setFieldValue('sku', sku);
    }
  };

  // Auto-generate barcode
  const handleGenerateBarcode = () => {
    const barcode = generateBarcode();
    formik.setFieldValue('barcode', barcode);
  };

  // Calculate profit margin
  const profitMargin = calculateProfitMargin(formik.values.price, formik.values.cost);
  const stockStatus = getStockStatus(formik.values.quantity, formik.values.minStock, formik.values.maxStock);

  const modalRef = React.useRef(null);

  useOutsideClick(modalRef, () => {
    if (isProductModalOpen && !isSubmitting) {
      dispatch(closeProductModal());
    }
  });

  if (!isProductModalOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div
        ref={modalRef}
        className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">
            {editingProduct ? "Edit Product" : "Add New Product"}
          </h2>
          <button
            onClick={() => dispatch(closeProductModal())}
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
              <Package size={20} className="mr-2" />
              Basic Information
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Product Name */}
              <div className="md:col-span-2">
                <Input
                  label="Product Name *"
                  name="name"
                  value={formik.values.name}
                  onChange={formik.handleChange}
                  onBlur={(e) => {
                    formik.handleBlur(e);
                    handleFieldBlur('name');
                  }}
                  error={formik.touched.name && (formik.errors.name || fieldErrors.name)}
                  placeholder="Enter product name"
                  required
                />
              </div>

              {/* SKU */}
              <div>
                <div className="flex items-center space-x-2">
                  <Input
                    label="SKU"
                    name="sku"
                    value={formik.values.sku}
                    onChange={formik.handleChange}
                    onBlur={(e) => {
                      formik.handleBlur(e);
                      handleFieldBlur('sku');
                    }}
                    error={formik.touched.sku && (formik.errors.sku || fieldErrors.sku)}
                    placeholder="Enter SKU"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleGenerateSKU}
                    disabled={!formik.values.name}
                  >
                    Generate
                  </Button>
                </div>
              </div>

              {/* Barcode */}
              <div>
                <div className="flex items-center space-x-2">
                  <Input
                    label="Barcode"
                    name="barcode"
                    value={formik.values.barcode}
                    onChange={formik.handleChange}
                    onBlur={(e) => {
                      formik.handleBlur(e);
                      handleFieldBlur('barcode');
                    }}
                    error={formik.touched.barcode && (formik.errors.barcode || fieldErrors.barcode)}
                    placeholder="Enter barcode"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleGenerateBarcode}
                  >
                    Generate
                  </Button>
                </div>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                name="description"
                value={formik.values.description}
                onChange={formik.handleChange}
                onBlur={(e) => {
                  formik.handleBlur(e);
                  handleFieldBlur('description');
                }}
                placeholder="Enter product description"
                rows={3}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  formik.touched.description && (formik.errors.description || fieldErrors.description)
                    ? 'border-red-300 focus:ring-red-500'
                    : 'border-gray-300'
                }`}
              />
              {formik.touched.description && (formik.errors.description || fieldErrors.description) && (
                <p className="mt-1 text-sm text-red-600">{formik.errors.description || fieldErrors.description}</p>
              )}
            </div>
          </div>

          {/* Pricing & Inventory */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 flex items-center">
              <DollarSign size={20} className="mr-2" />
              Pricing & Inventory
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Price */}
              <div>
                <Input
                  label="Price *"
                  name="price"
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={formik.values.price}
                  onChange={formik.handleChange}
                  onBlur={(e) => {
                    formik.handleBlur(e);
                    handleFieldBlur('price');
                  }}
                  error={formik.touched.price && (formik.errors.price || fieldErrors.price)}
                  placeholder="0.00"
                  required
                />
              </div>

              {/* Cost */}
              <div>
                <Input
                  label="Cost"
                  name="cost"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formik.values.cost}
                  onChange={formik.handleChange}
                  onBlur={(e) => {
                    formik.handleBlur(e);
                    handleFieldBlur('cost');
                  }}
                  error={formik.touched.cost && (formik.errors.cost || fieldErrors.cost)}
                  placeholder="0.00"
                />
              </div>

              {/* Profit Margin */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Profit Margin
                </label>
                <div className="px-3 py-2 border border-gray-300 rounded-lg bg-gray-50">
                  <div className="flex items-center space-x-2">
                    <TrendingUp size={16} className="text-green-600" />
                    <span className="text-sm font-medium text-green-600">
                      {profitMargin}%
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Quantity */}
              <div>
                <Input
                  label="Quantity"
                  name="quantity"
                  type="number"
                  min="0"
                  value={formik.values.quantity}
                  onChange={formik.handleChange}
                  onBlur={(e) => {
                    formik.handleBlur(e);
                    handleFieldBlur('quantity');
                  }}
                  error={formik.touched.quantity && (formik.errors.quantity || fieldErrors.quantity)}
                  placeholder="0"
                />
              </div>

              {/* Min Stock */}
              <div>
                <Input
                  label="Min Stock"
                  name="minStock"
                  type="number"
                  min="0"
                  value={formik.values.minStock}
                  onChange={formik.handleChange}
                  onBlur={(e) => {
                    formik.handleBlur(e);
                    handleFieldBlur('minStock');
                  }}
                  error={formik.touched.minStock && (formik.errors.minStock || fieldErrors.minStock)}
                  placeholder="0"
                />
              </div>

              {/* Max Stock */}
              <div>
                <Input
                  label="Max Stock"
                  name="maxStock"
                  type="number"
                  min="0"
                  value={formik.values.maxStock}
                  onChange={formik.handleChange}
                  onBlur={(e) => {
                    formik.handleBlur(e);
                    handleFieldBlur('maxStock');
                  }}
                  error={formik.touched.maxStock && (formik.errors.maxStock || fieldErrors.maxStock)}
                  placeholder="0"
                />
              </div>
            </div>

            {/* Stock Status */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full bg-${getStockStatusColor(stockStatus)}-500`}></div>
                <span className="text-sm font-medium text-gray-700">
                  Stock Status: {formatStockStatus(stockStatus)}
                </span>
              </div>
              {isLowStock(formik.values.quantity, formik.values.minStock) && (
                <div className="flex items-center space-x-1 text-yellow-600">
                  <AlertTriangle size={16} />
                  <span className="text-sm">Low Stock Alert</span>
                </div>
              )}
            </div>
          </div>

          {/* Category & Status */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 flex items-center">
              <Tag size={20} className="mr-2" />
              Category & Status
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category *
                </label>
                <select
                  name="categoryId"
                  value={formik.values.categoryId}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    formik.touched.categoryId && formik.errors.categoryId
                      ? 'border-red-300 focus:ring-red-500'
                      : 'border-gray-300'
                  }`}
                  required
                >
                  <option value="">Select a category</option>
                  {/* Categories will be loaded from Redux store */}
                </select>
                {formik.touched.categoryId && formik.errors.categoryId && (
                  <p className="mt-1 text-sm text-red-600">{formik.errors.categoryId}</p>
                )}
              </div>

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
                  <option value="discontinued">Discontinued</option>
                </select>
              </div>
            </div>
          </div>

          {/* Image */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 flex items-center">
              <Image size={20} className="mr-2" />
              Product Image
            </h3>

            <div>
              <Input
                label="Image URL"
                name="image"
                value={formik.values.image}
                onChange={formik.handleChange}
                onBlur={(e) => {
                  formik.handleBlur(e);
                  handleFieldBlur('image');
                }}
                error={formik.touched.image && (formik.errors.image || fieldErrors.image)}
                placeholder="https://example.com/image.jpg"
              />
            </div>
          </div>

          {/* Advanced Options */}
          <div className="space-y-4">
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex items-center space-x-2 text-blue-600 hover:text-blue-800"
            >
              <BarChart3 size={16} />
              <span>{showAdvanced ? 'Hide' : 'Show'} Advanced Options</span>
            </button>

            {showAdvanced && (
              <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                {/* Weight */}
                <div>
                  <Input
                    label="Weight (lbs)"
                    name="weight"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formik.values.weight}
                    onChange={formik.handleChange}
                    onBlur={(e) => {
                      formik.handleBlur(e);
                      handleFieldBlur('weight');
                    }}
                    error={formik.touched.weight && (formik.errors.weight || fieldErrors.weight)}
                    placeholder="0.00"
                  />
                </div>

                {/* Dimensions */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Dimensions (inches)
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <Input
                      label="Length"
                      name="dimensions.length"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formik.values.dimensions.length}
                      onChange={(e) => formik.setFieldValue('dimensions.length', e.target.value)}
                      placeholder="0.00"
                    />
                    <Input
                      label="Width"
                      name="dimensions.width"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formik.values.dimensions.width}
                      onChange={(e) => formik.setFieldValue('dimensions.width', e.target.value)}
                      placeholder="0.00"
                    />
                    <Input
                      label="Height"
                      name="dimensions.height"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formik.values.dimensions.height}
                      onChange={(e) => formik.setFieldValue('dimensions.height', e.target.value)}
                      placeholder="0.00"
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
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end space-x-3 pt-6 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => dispatch(closeProductModal())}
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
                  <span>{editingProduct ? "Updating..." : "Creating..."}</span>
                </>
              ) : (
                <>
                  <CheckCircle size={16} />
                  <span>{editingProduct ? "Update Product" : "Create Product"}</span>
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EnhancedProductModal;
