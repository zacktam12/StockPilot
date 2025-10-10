// src/features/sales/drawers/NewSaleDrawer.jsx
import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  createSale,
  fetchProducts,
  fetchCustomers,
} from "../../../store/slices/salesSlice";
import {
  ShoppingCart,
  DollarSign,
  Hash,
  Plus,
  Minus,
  X,
  Search,
  ChevronDown,
  AlertTriangle,
  Package,
  User,
} from "lucide-react";
import Button from "../../../components/shared/Button";
import Input from "../../../components/shared/Input";
import NumericInput from "../../../components/shared/NumericInput";
import { useOutsideClick } from "../../../hooks/useOutsideClick";

const NewSaleDrawer = ({ sale, isOpen, onClose, onSuccess }) => {
  const dispatch = useDispatch();
  const drawerRef = useRef(null);

  const {
    products = [],
    customers = [],
    loading: dataLoading = false,
  } = useSelector((state) => state.sales || {});

  // Debug logging
  useEffect(() => {
  }, [products, customers, dataLoading]);

  const [formData, setFormData] = useState({
    customerId: "",
    paymentMethod: "cash",
    status: "completed",
    notes: "",
  });

  const [selectedProducts, setSelectedProducts] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [isCustomerOpen, setIsCustomerOpen] = useState(false);
  const [customerSearch, setCustomerSearch] = useState("");
  const [isProductOpen, setIsProductOpen] = useState(false);
  const [productSearch, setProductSearch] = useState("");
  const customerRef = useRef(null);
  const productRef = useRef(null);

  // Load data on mount
  useEffect(() => {
    if (isOpen) {
      dispatch(fetchProducts()).then((result) => {
      }).catch((error) => {
      });
      dispatch(fetchCustomers()).then((result) => {
      }).catch((error) => {
      });
    }
  }, [dispatch, isOpen]);

  // Initialize form data
  useEffect(() => {
    if (sale) {
      setFormData({
        customerId: sale.customerId || sale.customer_id || "",
        paymentMethod: sale.paymentMethod || "cash",
        status: sale.status || "completed",
        notes: sale.notes || "",
      });
      setSelectedProducts(
        sale.items
          ? sale.items.map((item) => ({
              product: item.product,
              quantity: item.quantity,
            }))
          : []
      );
    } else {
      setFormData({
        customerId: "",
        paymentMethod: "cash",
        status: "completed",
        notes: "",
      });
      setSelectedProducts([]);
    }
  }, [sale]);

  // Close drawer when clicking outside
  useOutsideClick(drawerRef, () => {
    if (isOpen) {
      onClose();
    }
  });

  // Filter customers based on search - ensure customers is an array
  const filteredCustomers = Array.isArray(customers) 
    ? customers.filter((customer) =>
        customer.name?.toLowerCase().includes(customerSearch.toLowerCase())
      )
    : [];

  // Filter products based on search - ensure products is an array
  const filteredProducts = Array.isArray(products)
    ? products.filter((product) =>
        product.name?.toLowerCase().includes(productSearch.toLowerCase())
      )
    : [];

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleAddProduct = (product) => {
    if (product.quantity === 0) return;

    const existing = selectedProducts.find((p) => p.product.id === product.id);
    if (existing) {
      if (existing.quantity < product.quantity) {
        setSelectedProducts((prev) =>
          prev.map((p) =>
            p.product.id === product.id ? { ...p, quantity: p.quantity + 1 } : p
          )
        );
      }
    } else {
      setSelectedProducts((prev) => [...prev, { product, quantity: 1 }]);
    }
  };

  const handleUpdateQuantity = (productId, delta) => {
    setSelectedProducts((prev) =>
      prev
        .map((item) => {
          if (item.product.id === productId) {
            const newQuantity = item.quantity + delta;
            if (newQuantity <= 0) return null;
            if (newQuantity > item.product.quantity) return item;
            return { ...item, quantity: newQuantity };
          }
          return item;
        })
        .filter(Boolean)
    );
  };

  const handleRemoveProduct = (productId) => {
    setSelectedProducts((prev) =>
      prev.filter((item) => item.product.id !== productId)
    );
  };

  const calculateSubtotal = () => {
    return selectedProducts.reduce(
      (sum, item) => sum + item.product.price * item.quantity,
      0
    );
  };

  const calculateTotal = () => {
    return calculateSubtotal();
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.customerId) {
      newErrors.customerId = "Customer is required";
    }

    if (selectedProducts.length === 0) {
      newErrors.products = "At least one product is required";
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
      const saleData = {
        customerId: formData.customerId,
        paymentMethod: formData.paymentMethod,
        status: formData.status,
        notes: formData.notes,
        items: selectedProducts.map((item) => ({
          product_id: item.product.id,  // Backend expects product_id with underscore
          quantity: item.quantity,
          price: item.product.price,
        })),
        totalPrice: calculateTotal(),
      };
      await dispatch(createSale(saleData)).unwrap();
      if (onSuccess) {
        onSuccess();
      }
      onClose();
    } catch (error) {
            setErrors({ submit: "Failed to create sale. Please try again." });
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
        <div className="sticky top-0 bg-white dark:bg-gray-800 px-6 py-4 z-10 backdrop-blur-sm rounded-t-2xl sm:rounded-none border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {sale ? "Edit Sale" : "Sale"}
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {sale ? "Update sale details" : "Create a new sale order"}
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

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Customer Selection */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Customer *
                </label>
                <div className="relative" ref={customerRef}>
                  <button
                    type="button"
                    onClick={() => setIsCustomerOpen(!isCustomerOpen)}
                    className="w-full px-3 py-2 text-left bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <div className="flex items-center justify-between">
                      <span className="block truncate">
                        {formData.customerId
                          ? customers.find((c) => c.id === formData.customerId)
                              ?.name || "Select customer"
                          : "Select customer"}
                      </span>
                      <ChevronDown className="h-4 w-4 text-gray-400" />
                    </div>
                  </button>

                  {isCustomerOpen && (
                    <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg">
                      <div className="p-2">
                        <div className="relative">
                          <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                          <Input
                            type="text"
                            placeholder="Search customers..."
                            value={customerSearch}
                            onChange={(e) => setCustomerSearch(e.target.value)}
                            className="pl-8"
                          />
                        </div>
                      </div>
                      <div className="max-h-60 overflow-y-auto">
                        {dataLoading ? (
                          <div className="px-3 py-4 text-center text-sm text-gray-500">
                            Loading customers...
                          </div>
                        ) : filteredCustomers.length === 0 ? (
                          <div className="px-3 py-4 text-center text-sm text-gray-500">
                            {customerSearch ? "No customers found" : "No customers available"}
                          </div>
                        ) : (
                          filteredCustomers.map((customer) => (
                            <button
                              key={customer.id}
                              type="button"
                              onClick={() => {
                                handleInputChange("customerId", customer.id);
                                setIsCustomerOpen(false);
                                setCustomerSearch("");
                              }}
                              className="w-full px-3 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-600 flex items-center space-x-2"
                            >
                              <User className="h-4 w-4 text-gray-400" />
                              <span className="text-sm text-gray-900 dark:text-white">
                                {customer.name}
                              </span>
                            </button>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>
                {errors.customerId && (
                  <p className="text-sm text-red-600">{errors.customerId}</p>
                )}
              </div>

              {/* Payment Method */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Payment Method
                </label>
                <select
                  value={formData.paymentMethod}
                  onChange={(e) => handleInputChange("paymentMethod", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="cash">Cash</option>
                  <option value="card">Card</option>
                  <option value="bank_transfer">Bank Transfer</option>
                  <option value="other">Other</option>
                </select>
              </div>

              {/* Status */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => handleInputChange("status", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="pending">Pending</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              {/* Products Selection */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Products *
                </label>
                <div className="relative" ref={productRef}>
                  <button
                    type="button"
                    onClick={() => setIsProductOpen(!isProductOpen)}
                    className="w-full px-3 py-2 text-left bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <div className="flex items-center justify-between">
                      <span className="block truncate">
                        Add products to sale
                      </span>
                      <ChevronDown className="h-4 w-4 text-gray-400" />
                    </div>
                  </button>

                  {isProductOpen && (
                    <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg">
                      <div className="p-2">
                        <div className="relative">
                          <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                          <Input
                            type="text"
                            placeholder="Search products..."
                            value={productSearch}
                            onChange={(e) => setProductSearch(e.target.value)}
                            className="pl-8"
                          />
                        </div>
                      </div>
                      <div className="max-h-60 overflow-y-auto">
                        {dataLoading ? (
                          <div className="px-3 py-4 text-center text-sm text-gray-500">
                            Loading products...
                          </div>
                        ) : filteredProducts.length === 0 ? (
                          <div className="px-3 py-4 text-center text-sm text-gray-500">
                            {productSearch ? "No products found" : "No products available"}
                          </div>
                        ) : (
                          filteredProducts.map((product) => (
                            <button
                              key={product.id}
                              type="button"
                              onClick={() => {
                                handleAddProduct(product);
                                setIsProductOpen(false);
                                setProductSearch("");
                              }}
                              className="w-full px-3 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-600 flex items-center justify-between"
                              disabled={product.quantity === 0}
                            >
                              <div className="flex items-center space-x-2">
                                <Package className="h-4 w-4 text-gray-400" />
                                <span className="text-sm text-gray-900 dark:text-white">
                                  {product.name}
                                </span>
                              </div>
                              <div className="text-sm text-gray-500">
                                ${product.price} (Stock: {product.quantity})
                              </div>
                            </button>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>
                {errors.products && (
                  <p className="text-sm text-red-600">{errors.products}</p>
                )}
              </div>

              {/* Selected Products */}
              {selectedProducts.length > 0 && (
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Selected Products
                  </label>
                  <div className="space-y-2">
                    {selectedProducts.map((item) => (
                      <div
                        key={item.product.id}
                        className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                      >
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {item.product.name}
                          </p>
                          <p className="text-sm text-gray-500">
                            ${item.product.price} each
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            type="button"
                            onClick={() =>
                              handleUpdateQuantity(item.product.id, -1)
                            }
                            className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                          >
                            <Minus className="h-4 w-4" />
                          </button>
                          <span className="text-sm font-medium text-gray-900 dark:text-white min-w-[2rem] text-center">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              handleUpdateQuantity(item.product.id, 1)
                            }
                            className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              handleRemoveProduct(item.product.id)
                            }
                            className="p-1 text-red-400 hover:text-red-600"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Notes */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Notes
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => handleInputChange("notes", e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Add any additional notes..."
                />
              </div>

              {/* Total */}
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-medium text-gray-900 dark:text-white">
                    Total:
                  </span>
                  <span className="text-xl font-bold text-gray-900 dark:text-white">
                    ${calculateTotal().toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Error Message */}
              {errors.submit && (
                <div className="flex items-center space-x-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
                  <AlertTriangle className="h-5 w-5 text-red-400" />
                  <p className="text-sm text-red-600 dark:text-red-400">
                    {errors.submit}
                  </p>
                </div>
              )}
            </form>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 dark:border-gray-700">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              onClick={handleSubmit}
              disabled={isSubmitting || selectedProducts.length === 0}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isSubmitting ? "Creating..." : sale ? "Update Sale" : "Create Sale"}
            </Button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default NewSaleDrawer;
