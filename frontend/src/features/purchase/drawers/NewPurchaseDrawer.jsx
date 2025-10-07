// src/features/purchase/drawers/NewPurchaseDrawer.jsx
import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  createPurchase,
} from "../../../store/slices/purchaseSlice";
import { fetchSuppliers } from "../../../store/slices/supplierSlice";
import { fetchProducts } from "../../../store/slices/productSlice";
import {
  ShoppingCart,
  DollarSign,
  Hash,
  Plus,
  X,
  Search,
  ChevronDown,
  AlertTriangle,
  Package,
  Building2,
  FileText,
  Calculator,
} from "lucide-react";
import Button from "../../../components/shared/Button";
import Input from "../../../components/shared/Input";
import NumericInput from "../../../components/shared/NumericInput";
import { useOutsideClick } from "../../../hooks/useOutsideClick";

const NewPurchaseDrawer = ({ purchase, isOpen, onClose }) => {
  const dispatch = useDispatch();
  const drawerRef = useRef(null);
  const {
    items: suppliers = [],
    loading: suppliersLoading = false,
    error: suppliersError = null,
  } = useSelector((state) => state.supplier || {});

  const {
    items: products = [],
    loading: productsLoading = false,
    error: productsError = null,
  } = useSelector((state) => state.product || {});

  const [formData, setFormData] = useState({
    supplierId: "",
    notes: "",
    status: "pending",
    totalCost: "",
    discount: "",
    tax: "",
  });

  const [selectedProducts, setSelectedProducts] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [isSupplierOpen, setIsSupplierOpen] = useState(false);
  const [supplierSearch, setSupplierSearch] = useState("");
  const [isProductOpen, setIsProductOpen] = useState({});
  const [productSearch, setProductSearch] = useState({});
  const supplierRef = useRef(null);
  const productRefs = useRef({});

  // Load suppliers and products on mount
  useEffect(() => {
    if (isOpen) {
      dispatch(fetchSuppliers()).then((result) => {
      }).catch((error) => {
      });
      dispatch(fetchProducts()).then((result) => {
      }).catch((error) => {
      });
    }
  }, [dispatch, isOpen]);

  // Debug logging for suppliers and products
  useEffect(() => {
  }, [suppliers, products, suppliersLoading, productsLoading, suppliersError, productsError]);

  // Reset form when drawer opens for new purchase
  useEffect(() => {
    if (isOpen && !purchase) {
      setFormData({
        supplierId: "",
        notes: "",
        status: "pending",
        totalCost: "",
        discount: "",
        tax: "",
      });
      setSelectedProducts([]);
      setErrors({});
      setSupplierSearch("");
      setIsSupplierOpen(false);
      setIsProductOpen({});
      setProductSearch({});
    }
  }, [isOpen, purchase]);

  // Use outside click hook
  useOutsideClick(drawerRef, () => {
    if (isOpen) {
      onClose();
    }
  });

  useOutsideClick(supplierRef, () => {
    setIsSupplierOpen(false);
    setSupplierSearch("");
  });

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: "",
      }));
    }
  };

  const handleAddProduct = () => {
    const newIndex = selectedProducts.length;
    setSelectedProducts((prev) => [
      ...prev,
      {
        productId: "",
        name: "",
        quantity: "",
        unitPrice: "",
        totalPrice: "",
      },
    ]);
    setIsProductOpen({ ...isProductOpen, [newIndex]: false });
    setProductSearch({ ...productSearch, [newIndex]: "" });
  };

  const handleRemoveProduct = (index) => {
    setSelectedProducts((prev) => prev.filter((_, i) => i !== index));
  };

  const handleProductChange = (index, field, value) => {
    setSelectedProducts((prev) =>
      prev.map((product, i) => {
        if (i === index) {
          const updatedProduct = { ...product, [field]: value };
          
          // Calculate total price when quantity or unit price changes
          if (field === "quantity" || field === "unitPrice") {
            const quantity = parseFloat(field === "quantity" ? value : product.quantity) || 0;
            const unitPrice = parseFloat(field === "unitPrice" ? value : product.unitPrice) || 0;
            updatedProduct.totalPrice = (quantity * unitPrice).toFixed(2);
          }
          
          return updatedProduct;
        }
        return product;
      })
    );
  };

  // Calculate total cost whenever selectedProducts, discount, or tax changes
  useEffect(() => {
    const total = selectedProducts.reduce((sum, product) => {
      return sum + (parseFloat(product.totalPrice) || 0);
    }, 0);
    
    const discount = parseFloat(formData.discount) || 0;
    const tax = parseFloat(formData.tax) || 0;
    const finalTotal = total - discount + tax;
    
    setFormData((prev) => ({
      ...prev,
      totalCost: finalTotal.toFixed(2),
    }));
  }, [selectedProducts, formData.discount, formData.tax]);

  const validateForm = () => {
    const newErrors = {};

    // Validate supplier
    if (!formData.supplierId) {
      newErrors.supplierId = "Supplier is required";
    }

    // Validate products array
    if (selectedProducts.length === 0) {
      newErrors.products = "At least one product is required";
    }

    // Validate each product
    selectedProducts.forEach((product, index) => {
      if (!product.productId) {
        newErrors[`product_${index}_id`] = "Product is required";
      }
      
      // Validate quantity
      if (!product.quantity) {
        newErrors[`product_${index}_quantity`] = "Quantity is required";
      } else {
        const qty = parseInt(product.quantity);
        if (isNaN(qty) || qty <= 0) {
          newErrors[`product_${index}_quantity`] = "Quantity must be a positive integer";
        }
      }
      
      // Validate unit price
      if (!product.unitPrice) {
        newErrors[`product_${index}_unitPrice`] = "Unit price is required";
      } else {
        const price = parseFloat(product.unitPrice);
        if (isNaN(price) || price <= 0) {
          newErrors[`product_${index}_unitPrice`] = "Unit price must be a positive number";
        }
      }
    });

    // Validate discount (optional but must be valid if provided)
    if (formData.discount) {
      const discount = parseFloat(formData.discount);
      if (isNaN(discount) || discount < 0) {
        newErrors.discount = "Discount must be a non-negative number";
      }
    }

    // Validate tax (optional but must be valid if provided)
    if (formData.tax) {
      const tax = parseFloat(formData.tax);
      if (isNaN(tax) || tax < 0) {
        newErrors.tax = "Tax must be a non-negative number";
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
      const purchaseData = {
        supplierId: formData.supplierId,
        notes: formData.notes.trim(),
        status: formData.status,
        totalCost: parseFloat(formData.totalCost),
        discount: parseFloat(formData.discount) || 0,
        tax: parseFloat(formData.tax) || 0,
        items: selectedProducts.map(product => ({
          productId: product.productId,
          purchase_quantity: parseInt(product.quantity),
          purchase_price: parseFloat(product.unitPrice),
        })),
      };
      await dispatch(createPurchase(purchaseData)).unwrap();
      onClose();
    } catch (error) {
      console.error("Error creating purchase:", error);
      setErrors({
        submit: error.message || "Failed to create purchase. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredSuppliers = Array.isArray(suppliers)
    ? suppliers.filter((supplier) =>
        supplier.name?.toLowerCase().includes(supplierSearch.toLowerCase())
      )
    : [];

  const selectedSupplier = Array.isArray(suppliers)
    ? suppliers.find(s => s.id === formData.supplierId)
    : null;

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
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {purchase ? "Edit Purchase Order" : "Purchase Orders"}
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {purchase ? "Update purchase order information" : "Create a new purchase order"}
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
          {/* Purchase Information */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Purchase Information</h3>
            <div className="space-y-4">
              {/* Supplier Selection */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Supplier *
                </label>
            <div className="relative" ref={supplierRef}>
              <button
                type="button"
                onClick={() => setIsSupplierOpen(!isSupplierOpen)}
                className="w-full flex items-center justify-between px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <span className="truncate">
                  {selectedSupplier ? selectedSupplier.name : "Select a supplier"}
                </span>
                <ChevronDown size={16} className="text-gray-400" />
              </button>
              
              {isSupplierOpen && (
                <div className="absolute z-20 w-full mt-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                  <div className="p-2">
                    <div className="relative">
                      <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search suppliers..."
                        value={supplierSearch}
                        onChange={(e) => setSupplierSearch(e.target.value)}
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      />
                    </div>
                  </div>
                  <div className="max-h-48 overflow-y-auto">
                    {filteredSuppliers.map((supplier) => (
                      <button
                        key={supplier.id}
                        type="button"
                        onClick={() => {
                          handleInputChange("supplierId", supplier.id);
                          setIsSupplierOpen(false);
                          setSupplierSearch("");
                        }}
                        className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-900 dark:text-white"
                      >
                        {supplier.name}
                      </button>
                    ))}
                    {filteredSuppliers.length === 0 && (
                      <div className="px-4 py-2 text-gray-500 dark:text-gray-400">
                        No suppliers found
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
            {errors.supplierId && (
              <p className="text-red-500 text-sm flex items-center gap-1">
                <AlertTriangle size={14} />
                {errors.supplierId}
              </p>
            )}
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => handleInputChange("notes", e.target.value)}
              placeholder="Additional notes for this purchase order..."
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              rows={3}
            />
          </div>

          {/* Status */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Status
            </label>
            <select
              value={formData.status}
              onChange={(e) => handleInputChange("status", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="pending">Pending</option>
              <option value="received">Received</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
            </div>
          </div>

          {/* Products Section */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Products</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Products *
                </label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  icon={<Plus size={16} />}
                  onClick={handleAddProduct}
                >
                  Add Product
                </Button>
              </div>
            
            {errors.products && (
              <p className="text-red-500 text-sm flex items-center gap-1">
                <AlertTriangle size={14} />
                {errors.products}
              </p>
            )}

            {selectedProducts.map((product, index) => (
              <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Product {index + 1}
                  </h4>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveProduct(index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <X size={16} />
                  </Button>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="relative" ref={(el) => productRefs.current[index] = el}>
                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                      Product *
                    </label>
                    <div className="relative">
                      <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search or select product..."
                        value={productSearch[index] || (product.productId && Array.isArray(products) ? products.find(p => p.id === product.productId)?.name || "" : "")}
                        onChange={(e) => {
                          setProductSearch({ ...productSearch, [index]: e.target.value });
                          setIsProductOpen({ ...isProductOpen, [index]: true });
                          // Clear selection if user types something different
                          if (product.productId && Array.isArray(products) && e.target.value !== products.find(p => p.id === product.productId)?.name) {
                            handleProductChange(index, "productId", "");
                            handleProductChange(index, "name", "");
                          }
                        }}
                        onFocus={() => setIsProductOpen({ ...isProductOpen, [index]: true })}
                        onBlur={(e) => {
                          // Delay closing to allow click on dropdown items
                          setTimeout(() => {
                            setIsProductOpen({ ...isProductOpen, [index]: false });
                          }, 200);
                        }}
                        className={`w-full pl-10 pr-10 py-2 text-sm border bg-white dark:bg-gray-700 text-gray-800 dark:text-white rounded-lg shadow-sm transition duration-150 ease-in-out hover:border-gray-600 focus:outline-none focus:ring-0 ${
                          errors[`product_${index}_id`] ? 'border-red-300 focus:border-red-500' : 'border-gray-300 dark:border-gray-600 focus:border-gray-300'
                        }`}
                      />
                      <ChevronDown size={16} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    </div>
                    
                    {isProductOpen[index] && (
                      <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                        {productsLoading ? (
                          <div className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400">
                            Loading products...
                          </div>
                        ) : productsError ? (
                          <div className="px-4 py-2 text-sm text-red-500 dark:text-red-400">
                            Error loading products
                          </div>
                        ) : Array.isArray(products) && products.filter(p => 
                          p.name?.toLowerCase().includes((productSearch[index] || "").toLowerCase())
                        ).length > 0 ? (
                          products.filter(p => 
                            p.name?.toLowerCase().includes((productSearch[index] || "").toLowerCase())
                          ).map((productOption) => (
                            <button
                              key={productOption.id}
                              type="button"
                              onClick={() => {
                                handleProductChange(index, "productId", productOption.id);
                                handleProductChange(index, "name", productOption.name);
                                setProductSearch({ ...productSearch, [index]: productOption.name });
                                setIsProductOpen({ ...isProductOpen, [index]: false });
                              }}
                              className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600"
                            >
                              {productOption.name}
                            </button>
                          ))
                        ) : (
                          <div className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400">
                            {productSearch[index] ? "No products found" : "No products available"}
                          </div>
                        )}
                      </div>
                    )}
                    {errors[`product_${index}_id`] && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors[`product_${index}_id`]}</p>
                    )}
                  </div>
                  <div>
                    <NumericInput
                      label="Quantity"
                      name={`quantity_${index}`}
                      value={product.quantity}
                      onChange={(e) => handleProductChange(index, "quantity", e.target.value)}
                      placeholder="0"
                      min={1}
                      allowDecimal={false}
                      required={true}
                      icon={<Hash size={16} />}
                      error={errors[`product_${index}_quantity`]}
                    />
                  </div>
                  <div>
                    <NumericInput
                      label="Unit Price"
                      name={`unitPrice_${index}`}
                      value={product.unitPrice}
                      onChange={(e) => handleProductChange(index, "unitPrice", e.target.value)}
                      placeholder="0.00"
                      min={0.01}
                      allowDecimal={true}
                      decimals={2}
                      required={true}
                      icon={<DollarSign size={16} />}
                      error={errors[`product_${index}_unitPrice`]}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                      Total Price
                    </label>
                    <Input
                      value={product.totalPrice}
                      placeholder="0.00"
                      disabled
                      className="bg-gray-50 dark:bg-gray-800"
                    />
                  </div>
                </div>
              </div>
            ))}
            </div>
          </div>

          {/* Cost Summary */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Cost Summary</h3>
            <div className="space-y-4">
            
            <div className="grid grid-cols-2 gap-4">
              <NumericInput
                label="Discount"
                name="discount"
                value={formData.discount}
                onChange={(e) => handleInputChange("discount", e.target.value)}
                placeholder="0.00"
                min={0}
                allowDecimal={true}
                decimals={2}
                icon={<DollarSign size={16} />}
                error={errors.discount}
              />
              <NumericInput
                label="Tax"
                name="tax"
                value={formData.tax}
                onChange={(e) => handleInputChange("tax", e.target.value)}
                placeholder="0.00"
                min={0}
                allowDecimal={true}
                decimals={2}
                icon={<DollarSign size={16} />}
                error={errors.tax}
              />
            </div>

            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
              <div className="flex justify-between items-center">
                <span className="text-lg font-medium text-gray-900 dark:text-white">Total Cost:</span>
                <span className="text-xl font-bold text-blue-600 dark:text-blue-400">
                  ${formData.totalCost || "0.00"}
                </span>
              </div>
            </div>
            </div>
          </div>

          {/* Error Display */}
          {errors.submit && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <p className="text-red-600 dark:text-red-400 text-sm flex items-center gap-2">
                <AlertTriangle size={16} />
                {errors.submit}
              </p>
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
              {isSubmitting ? "Creating..." : purchase ? "Update Purchase" : "Create Purchase"}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};

export default NewPurchaseDrawer;
