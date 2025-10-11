import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import jsPDF from 'jspdf';
import {
  ArrowLeft,
  ArrowUp,
  Edit,
  Trash2,
  DollarSign,
  Hash,
  Calendar,
  User,
  CreditCard,
  Package,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Receipt,
  Printer,
  Download,
  Copy,
  Eye,
  Loader2,
  Save,
  X,
  Truck,
  Building,
} from "lucide-react";
import { 
  fetchPurchaseById, 
  updatePurchaseStatus, 
  updatePurchase,
  deletePurchase,
} from "../../../store/slices/purchaseSlice";
import { fetchAllProducts } from "../../../store/slices/productSlice";
import { fetchSuppliers } from "../../../store/slices/supplierSlice";
import { showToast } from "../../../store/slices/uiSlice";
import Button from "../../../components/shared/Button";
import Input from "../../../components/shared/Input";

const PurchaseDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const exportRef = useRef(null);
  const { 
    currentPurchase, 
    loading, 
    error
  } = useSelector((state) => state.purchases);
  
  const { allProducts } = useSelector((state) => state.product);
  const { suppliers } = useSelector((state) => state.supplier);

  const [isEditingPurchaseInfo, setIsEditingPurchaseInfo] = useState(false);
  const [isEditingProducts, setIsEditingProducts] = useState(false);
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    if (id) {
      dispatch(fetchPurchaseById(id));
    } else {
    }
    if (!suppliers || suppliers.length === 0) {
      dispatch(fetchSuppliers());
    }
    if (!allProducts || allProducts.length === 0) {
      dispatch(fetchAllProducts());
    }
  }, [dispatch, id, suppliers, allProducts]);

  useEffect(() => {
    if (currentPurchase) {
      // Ensure productPurchases is an array
      const productPurchases = Array.isArray(currentPurchase.productPurchases) 
        ? currentPurchase.productPurchases 
        : [];
      
      setFormData({
        status: currentPurchase.status || 'pending',
        notes: currentPurchase.notes || '',
        supplierId: currentPurchase.supplierId || '',
        totalCost: currentPurchase.totalCost || 0,
        discount: currentPurchase.discount || 0,
        tax: currentPurchase.tax || 0,
        productPurchases: productPurchases,
        // Add editable product data
        editableProducts: productPurchases.map(pp => ({
          id: pp.id,
          productId: pp.productId,
          productName: pp.product?.name || 'Unknown Product',
          productSku: pp.product?.sku || 'N/A',
          quantity: pp.purchase_quantity || 1,
          price: pp.purchase_price || 0,
        })),
      });
    }
  }, [currentPurchase]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleProductChange = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      editableProducts: prev.editableProducts.map((product, i) => 
        i === index ? { ...product, [field]: value } : product
      )
    }));
  };

  const addProduct = () => {
    setFormData(prev => ({
      ...prev,
      editableProducts: [...prev.editableProducts, {
        id: null,
        productId: '',
        productName: '',
        quantity: 1,
        price: 0,
      }]
    }));
  };

  const removeProduct = (index) => {
    setFormData(prev => ({
      ...prev,
      editableProducts: prev.editableProducts.filter((_, i) => i !== index)
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.status) {
      newErrors.status = 'Status is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSavePurchaseInfo = async () => {
    setIsSubmitting(true);
    try {
      await dispatch(updatePurchase({ 
        id: currentPurchase.id,
        purchaseData: {
          supplierId: formData.supplierId,
          notes: formData.notes
        }
      })).unwrap();
      
      await dispatch(updatePurchaseStatus({ 
        id: currentPurchase.id, 
        status: formData.status 
      })).unwrap();
      
      // Refetch the purchase to ensure we have the latest data
      await dispatch(fetchPurchaseById(currentPurchase.id));
      
      dispatch(showToast({
        type: 'success',
        message: 'Purchase information updated successfully'
      }));

      setIsEditingPurchaseInfo(false);
    } catch (error) {
      dispatch(showToast({
        type: 'error',
        message: error || 'Failed to update purchase information'
      }));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveProducts = async () => {
    setIsSubmitting(true);
    try {
      // Validate that we have products to save
      if (!Array.isArray(formData.editableProducts) || formData.editableProducts.length === 0) {
        dispatch(showToast({
          type: 'error',
          message: 'No products to save'
        }));
        return;
      }

      // Calculate new totals based on editable products
      const subtotal = formData.editableProducts.reduce((sum, product) => {
        const quantity = product.quantity || 0;
        const price = product.price || 0;
        return sum + (quantity * price);
      }, 0);
      
      const totalCost = subtotal - (parseFloat(formData.discount) || 0) + (parseFloat(formData.tax) || 0);
      
      const updateData = {
        id: currentPurchase.id,
        purchaseData: {
          totalCost,
          discount: formData.discount || 0,
          tax: formData.tax || 0,
          editableProducts: formData.editableProducts
        }
      };
      
      await dispatch(updatePurchase(updateData)).unwrap();
      
      // Refetch the purchase to ensure we have the latest data
      await dispatch(fetchPurchaseById(currentPurchase.id));
      
      dispatch(showToast({
        type: 'success',
        message: 'Products updated successfully'
      }));
      
      setIsEditingProducts(false);
    } catch (error) {
      dispatch(showToast({
        type: 'error',
        message: error || 'Failed to update products'
      }));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyOrderNumber = () => {
    if (currentPurchase?.poNumber) {
      navigator.clipboard.writeText(currentPurchase.poNumber);
      dispatch(showToast({
        type: 'success',
        message: 'Purchase order number copied to clipboard'
      }));
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExport = async () => {
    if (!currentPurchase) return;
    
    try {
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      let yPosition = 20;
      
      // Helper function to add text with word wrap
      const addText = (text, x, y, options = {}) => {
        const { fontSize = 12, fontStyle = 'normal', color = '#000000', maxWidth = pageWidth - 40 } = options;
        pdf.setFontSize(fontSize);
        pdf.setFont('helvetica', fontStyle);
        pdf.setTextColor(color);
        
        const lines = pdf.splitTextToSize(text, maxWidth);
        pdf.text(lines, x, y);
        return y + (lines.length * fontSize * 0.4) + 5;
      };
      
      // Helper function to add line
      const addLine = (y) => {
        pdf.setDrawColor(200, 200, 200);
        pdf.line(20, y, pageWidth - 20, y);
        return y + 5;
      };
      
      // Header
      yPosition = addText('PURCHASE ORDER', 20, yPosition, { fontSize: 20, fontStyle: 'bold' });
      yPosition = addText(`PO Number: ${currentPurchase.poNumber || currentPurchase.id}`, 20, yPosition, { fontSize: 14, fontStyle: 'bold' });
      yPosition = addText(`Date: ${formatDate(currentPurchase.createdAt)}`, 20, yPosition);
      yPosition = addText(`Status: ${currentPurchase.status?.toUpperCase() || 'UNKNOWN'}`, 20, yPosition);
      yPosition += 10;
      
      // Purchase Information
      yPosition = addText('PURCHASE INFORMATION', 20, yPosition, { fontSize: 16, fontStyle: 'bold' });
      yPosition = addText(`Supplier: ${currentPurchase.supplier?.name || 'Unknown Supplier'}`, 20, yPosition);
      yPosition = addText(`Purchased By: ${currentPurchase.user?.firstName || currentPurchase.user?.email || 'Unknown User'}`, 20, yPosition);
      if (currentPurchase.notes) {
        yPosition = addText(`Notes: ${currentPurchase.notes}`, 20, yPosition);
      }
      yPosition += 10;
      
      // Products Table Header
      yPosition = addText('PRODUCTS PURCHASED', 20, yPosition, { fontSize: 16, fontStyle: 'bold' });
      yPosition += 5;
      
      // Table headers
      const tableHeaders = ['Product', 'SKU', 'Quantity', 'Unit Price', 'Total'];
      const colWidths = [60, 30, 20, 30, 30];
      const colPositions = [20, 80, 110, 130, 160];
      
      // Draw table header background
      pdf.setFillColor(240, 240, 240);
      pdf.rect(20, yPosition - 5, pageWidth - 40, 10, 'F');
      
      // Add table headers
      tableHeaders.forEach((header, index) => {
        addText(header, colPositions[index], yPosition, { fontSize: 10, fontStyle: 'bold' });
      });
      yPosition += 10;
      
      // Add products
      if (currentPurchase.productPurchases && currentPurchase.productPurchases.length > 0) {
        currentPurchase.productPurchases.forEach((productPurchase) => {
          // Check if we need a new page
          if (yPosition > pageHeight - 30) {
        pdf.addPage();
            yPosition = 20;
          }
          
          const productName = productPurchase.product?.name || 'Unknown Product';
          const sku = productPurchase.product?.sku || 'N/A';
          const quantity = productPurchase.purchase_quantity || 0;
          const unitPrice = productPurchase.purchase_price || 0;
          const total = quantity * unitPrice;
          
          addText(productName, colPositions[0], yPosition, { fontSize: 9 });
          addText(sku, colPositions[1], yPosition, { fontSize: 9 });
          addText(quantity.toString(), colPositions[2], yPosition, { fontSize: 9 });
          addText(`$${unitPrice.toFixed(2)}`, colPositions[3], yPosition, { fontSize: 9 });
          addText(`$${total.toFixed(2)}`, colPositions[4], yPosition, { fontSize: 9 });
          yPosition += 8;
        });
      } else {
        yPosition = addText('No products in this purchase', 20, yPosition);
      }
      
      yPosition += 10;
      yPosition = addLine(yPosition);
      
      // Financial Summary
      yPosition = addText('FINANCIAL SUMMARY', 20, yPosition, { fontSize: 16, fontStyle: 'bold' });
      yPosition += 5;
      
      const subtotal = calculateSubtotal();
      const discount = formData.discount || 0;
      const tax = formData.tax || 0;
      const total = calculateTotal();
      
      yPosition = addText(`Subtotal: $${subtotal.toFixed(2)}`, 20, yPosition);
      yPosition = addText(`Discount: -$${discount.toFixed(2)}`, 20, yPosition);
      yPosition = addText(`Tax: $${tax.toFixed(2)}`, 20, yPosition);
      yPosition = addLine(yPosition);
      yPosition = addText(`TOTAL: $${total.toFixed(2)}`, 20, yPosition, { fontSize: 14, fontStyle: 'bold', color: '#2563eb' });
      
      // Footer
      yPosition = pageHeight - 20;
      addText(`Generated on ${new Date().toLocaleString()}`, 20, yPosition, { fontSize: 8, color: '#666666' });
      
      // Save the PDF
      pdf.save(`purchase-${currentPurchase.poNumber || currentPurchase.id}.pdf`);
      
      dispatch(showToast({
        type: 'success',
        message: 'Purchase details exported successfully'
      }));
    } catch (error) {
      dispatch(showToast({
        type: 'error',
        message: 'Failed to export purchase details'
      }));
    }
  };

  const handleStatusChange = async (newStatus) => {
    if (!currentPurchase) return;
    
    setIsSubmitting(true);
    try {
      await dispatch(updatePurchaseStatus({ 
        id: currentPurchase.id, 
        status: newStatus 
      })).unwrap();
      
      dispatch(showToast({
        type: 'success',
        message: `Purchase status updated to ${newStatus}`
      }));
      
      // Refresh the purchase data
      dispatch(fetchPurchaseById(currentPurchase.id));
    } catch (error) {
      dispatch(showToast({
        type: 'error',
        message: error || 'Failed to update purchase status'
      }));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!currentPurchase) return;
    
    setIsSubmitting(true);
    try {
      await dispatch(deletePurchase(currentPurchase.id)).unwrap();
      
      dispatch(showToast({
        type: 'success',
        message: 'Purchase deleted successfully'
      }));
      
      navigate('/purchases');
    } catch (error) {
      dispatch(showToast({
        type: 'error',
        message: error || 'Failed to delete purchase'
      }));
    } finally {
      setIsSubmitting(false);
      setShowDeleteModal(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "received":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircle className="w-3 h-3 mr-1" />
            Received
          </span>
        );
      case "pending":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <Clock className="w-3 h-3 mr-1" />
            Pending
          </span>
        );
      case "cancelled":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <XCircle className="w-3 h-3 mr-1" />
            Cancelled
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            {status}
          </span>
        );
    }
  };

  const formatDate = (date) => {
    if (!date) {
      return "No date available";
    }
    
    try {
      const dateObj = new Date(date);
      if (isNaN(dateObj.getTime())) {
        return "Invalid date";
      }
      return new Intl.DateTimeFormat("en-US", {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(dateObj);
    } catch (error) {
      return "Invalid date";
    }
  };

  const calculateSubtotal = () => {
    if (!Array.isArray(formData.editableProducts)) return 0;
    return formData.editableProducts.reduce((sum, product) => {
      const quantity = product.quantity || 0;
      const price = product.price || 0;
      return sum + (quantity * price);
    }, 0);
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const discount = parseFloat(formData.discount) || 0;
    const tax = parseFloat(formData.tax) || 0;
    return subtotal - discount + tax;
  };

  if (loading && !currentPurchase) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex items-center gap-2">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>Loading purchase details...</span>
        </div>
      </div>
    );
  }

  // Debug logging for troubleshooting
  if (error) {
    return (
      <div className="bg-white rounded-lg">
        <div 
          className="pt-5 pb-12 min-h-full"
          style={{ paddingLeft: '24px', paddingRight: '24px' }}
        >
          {/* Header Section */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6" style={{ marginTop: '0px' }}>
            <div className="flex items-center gap-4 flex-1 min-w-0" style={{ marginLeft: '0px' }}>
              <button
                onClick={() => navigate("/purchases")}
                className="h-10 w-10 sm:h-12 sm:w-12 p-0 bg-blue-50 hover:bg-blue-100 rounded-lg flex items-center justify-center border-2 flex-shrink-0"
                style={{
                  borderColor: '#3b82f6',
                  color: '#3b82f6',
                  borderWidth: '2px',
                  borderStyle: 'solid',
                  borderRadius: '8px',
                  backgroundColor: '#f0f9ff',
                }}
              >
                <ArrowLeft size={20} className="sm:w-6 sm:h-6" />
              </button>
              <div className="min-w-0 flex-1">
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1 truncate">
                  Error Loading Purchase
                </h1>
                <p className="text-sm font-medium text-gray-600">
                  Invalid purchase ID
                </p>
              </div>
            </div>
          </div>

          {/* Error Content Card */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
            <div className="p-8 text-center">
              <p className="text-gray-900 mb-6">
                There was an error loading the purchase: {error}
              </p>
              
              <div className="flex gap-3 justify-center">
                <button
                  onClick={() => navigate('/purchases')}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                  Go Back
                </button>
                <button
                  onClick={() => window.location.reload()}
                  className="px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
                >
                  Try Again
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!currentPurchase) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg">
      <div 
        ref={exportRef}
        className="pt-5 pb-12 min-h-full"
        style={{ paddingLeft: '24px', paddingRight: '24px' }}
      >
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6" style={{ marginTop: '0px' }}>
          <div className="flex items-center gap-4 flex-1 min-w-0" style={{ marginLeft: '0px' }}>
            <button
              onClick={() => navigate("/purchases")}
              className="h-10 w-10 sm:h-12 sm:w-12 p-0 bg-blue-50 hover:bg-blue-100 rounded-lg flex items-center justify-center border-2 flex-shrink-0"
              style={{
                borderColor: '#3b82f6',
                color: '#3b82f6',
                borderWidth: '2px',
                borderStyle: 'solid',
                borderRadius: '8px',
                backgroundColor: '#f0f9ff',
              }}
            >
              <ArrowLeft size={20} className="sm:w-6 sm:h-6" />
            </button>
            <div className="min-w-0 flex-1">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1 truncate">
                Purchase Order #{currentPurchase.poNumber || currentPurchase.id}
              </h1>
              <p className="text-sm font-medium text-gray-600">
                View and manage purchase details
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
            <button
              onClick={handlePrint}
              className="h-11 px-4 py-3 rounded-lg flex items-center justify-center gap-2 bg-gray-600 hover:bg-gray-700 text-white font-medium transition-colors w-full sm:w-auto"
            >
              <Printer size={16} />
              <span className="hidden sm:inline">Print</span>
              <span className="sm:hidden">Print Details</span>
            </button>
            <button
              onClick={handleExport}
              className="h-11 px-4 py-3 rounded-lg flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors w-full sm:w-auto"
            >
              <ArrowUp size={16} />
              <span className="hidden sm:inline">Export Details</span>
              <span className="sm:hidden">Export</span>
            </button>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 mb-8" style={{ gap: '50px' }}>
          {/* Left Column - Purchase Information */}
          <div>
            <div 
              className="bg-white dark:bg-gray-800 rounded-lg h-fit"
              style={{ border: '2px solid rgba(229, 231, 235, 0.7)' }}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: 'none' }}>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white m-0">
                  Purchase Information
                </h3>
                <button
                  type="button"
                  onClick={() => setIsEditingPurchaseInfo(!isEditingPurchaseInfo)}
                  className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  disabled={isSubmitting}
                >
                  <Edit 
                    size={20} 
                    className={isEditingPurchaseInfo ? 'text-blue-600' : 'text-gray-600'} 
                  />
                </button>
              </div>
              
              {/* Body */}
              <div className="px-6 pb-6">
                {isEditingPurchaseInfo ? (
                  <div className="space-y-4">
                    {/* PO Number - Read Only */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Hash className="w-4 h-4 text-gray-500" />
                        <span className="text-sm font-medium text-gray-600">Purchase Order</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-900">
                          {currentPurchase.poNumber || 'N/A'}
                        </span>
                        <button
                          onClick={handleCopyOrderNumber}
                          className="p-1 hover:bg-gray-100 rounded"
                          title="Copy purchase order number"
                        >
                          <Copy size={14} className="text-gray-500" />
                        </button>
                      </div>
                    </div>

                    {/* Status - Read Only */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-gray-500" />
                        <span className="text-sm font-medium text-gray-600">Status</span>
                      </div>
                    <div>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${
                          currentPurchase.status === 'received' 
                            ? 'bg-green-100 text-green-800' 
                            : currentPurchase.status === 'pending' 
                            ? 'bg-yellow-100 text-yellow-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {currentPurchase.status === 'received' ? 'Received' : 
                           currentPurchase.status === 'pending' ? 'Pending' : 
                           'Cancelled'}
                        </span>
                      </div>
                    </div>

                    {/* Supplier - Editable */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Supplier
                      </label>
                      <select
                        name="supplierId"
                        value={formData.supplierId}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        disabled={!suppliers || suppliers.length === 0}
                      >
                        <option value="">Select Supplier</option>
                        {suppliers && suppliers.length > 0 ? (
                          suppliers.map((supplier) => (
                            <option key={supplier.id} value={supplier.id}>
                              {supplier.name}
                            </option>
                          ))
                        ) : (
                          <option value="" disabled>Loading suppliers...</option>
                        )}
                      </select>
                    </div>

                    {/* Notes - Editable */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Notes
                      </label>
                      <textarea
                        name="notes"
                        value={formData.notes}
                        onChange={handleInputChange}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Add notes..."
                      />
                    </div>

                    <div className="flex gap-2 pt-4 border-t border-gray-200">
                      <button
                        onClick={() => setIsEditingPurchaseInfo(false)}
                        disabled={isSubmitting}
                        className="flex-1 h-8 px-3 py-1 text-sm rounded-md font-medium flex items-center justify-center gap-1.5 focus:outline-none focus:ring-0 focus:shadow-none active:shadow-none"
                        style={{
                          backgroundColor: '#f3f4f6',
                          borderColor: '#d1d5db',
                          color: '#374151',
                          transition: 'background-color 0.2s ease',
                          transform: 'none',
                          boxShadow: 'none',
                          border: '1px solid #d1d5db',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = '#e5e7eb';
                          e.currentTarget.style.borderColor = '#9ca3af';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = '#f3f4f6';
                          e.currentTarget.style.borderColor = '#d1d5db';
                        }}
                      >
                        <X className="w-4 h-4" />
                        <span>Cancel</span>
                      </button>
                      <button
                        onClick={handleSavePurchaseInfo}
                        disabled={isSubmitting}
                        className="flex-1 h-8 px-3 py-1 text-sm rounded-md font-medium flex items-center justify-center gap-1.5 focus:outline-none focus:ring-0 focus:shadow-none active:shadow-none"
                        style={{
                          backgroundColor: '#3b82f6',
                          borderColor: '#3b82f6',
                          color: '#ffffff',
                          transition: 'background-color 0.2s ease',
                          transform: 'none',
                          boxShadow: 'none',
                          border: '1px solid #3b82f6',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = '#2563eb';
                          e.currentTarget.style.borderColor = '#2563eb';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = '#3b82f6';
                          e.currentTarget.style.borderColor = '#3b82f6';
                        }}
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>Saving...</span>
                          </>
                        ) : (
                          <>
                            <Save className="w-4 h-4" />
                            <span>Save</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* PO Number */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Hash className="w-4 h-4 text-gray-500" />
                        <span className="text-xs font-normal text-gray-500">Purchase Order</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-base font-bold text-gray-900">
                          {currentPurchase.poNumber || 'N/A'}
                        </span>
                        <button
                          onClick={handleCopyOrderNumber}
                          className="p-1 hover:bg-gray-100 rounded"
                          title="Copy purchase order number"
                        >
                          <Copy size={14} className="text-gray-500" />
                        </button>
                      </div>
                    </div>

                    {/* Status */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-gray-500" />
                        <span className="text-xs font-normal text-gray-500">Status</span>
                      </div>
                      <div>
                        {getStatusBadge(currentPurchase.status)}
                      </div>
                    </div>

                    {/* Supplier */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Building className="w-4 h-4 text-gray-500" />
                        <span className="text-xs font-normal text-gray-500">Supplier</span>
                      </div>
                      <div>
                        <span className="text-base font-semibold text-gray-900">
                          {currentPurchase.supplier?.name || 'Unknown Supplier'}
                        </span>
                      </div>
                    </div>

                    {/* Created Date */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-500" />
                        <span className="text-xs font-normal text-gray-500">Created</span>
                      </div>
                      <div>
                        <span className="text-base font-semibold text-gray-900">
                          {formatDate(currentPurchase.createdAt)}
                        </span>
                      </div>
                    </div>

                    {/* Purchased By */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-gray-500" />
                        <span className="text-xs font-normal text-gray-500">Purchased By</span>
                      </div>
                      <div>
                        <span className="text-base font-semibold text-gray-900">
                          {currentPurchase.user?.firstName || currentPurchase.user?.email || 'Unknown User'}
                        </span>
                      </div>
                    </div>

                    {/* Notes */}
                    {currentPurchase.notes && (
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <Receipt className="w-4 h-4 text-gray-500" />
                          <span className="text-xs font-normal text-gray-500">Notes</span>
                        </div>
                        <div className="text-right min-w-0 flex-1">
                          <span className="text-base font-semibold text-gray-900 break-words">
                            {currentPurchase.notes}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Delete Button - Only show in non-edit mode */}
                    {!isEditingPurchaseInfo && (
                      <div className="pt-4 border-t border-gray-200">
                        <div className="flex justify-center">
                          <button
                            onClick={() => setShowDeleteModal(true)}
                            disabled={isSubmitting}
                            className="w-[85%] h-12 px-4 py-3 rounded-lg text-sm flex items-center justify-center gap-2 focus:outline-none focus:ring-0 focus:shadow-none active:shadow-none"
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
                            <span>Remove Purchase</span>
                          </button>
                  </div>
                  </div>
                    )}
                  </div>
                )}
              </div>
            </div>


            {/* Status Action Buttons */}
            <div className="mt-6 space-y-3">
              {currentPurchase.status === 'pending' && (
                <button
                  onClick={() => handleStatusChange('received')}
                  disabled={isSubmitting}
                  className="w-full h-12 px-4 py-3 rounded-lg font-medium flex items-center justify-center gap-2 focus:outline-none focus:ring-0 focus:shadow-none active:shadow-none"
                  style={{
                    backgroundColor: '#10b981',
                    borderColor: '#10b981',
                    color: '#ffffff',
                    transition: 'background-color 0.2s ease',
                    transform: 'none',
                    boxShadow: 'none',
                    border: '1px solid #10b981',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#059669';
                    e.currentTarget.style.borderColor = '#059669';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#10b981';
                    e.currentTarget.style.borderColor = '#10b981';
                  }}
                >
                  <CheckCircle size={16} />
                  <span>Mark as Received</span>
                </button>
              )}
              
              {currentPurchase.status === 'received' && (
                <button
                  onClick={() => handleStatusChange('pending')}
                  disabled={isSubmitting}
                  className="w-full h-12 px-4 py-3 rounded-lg font-medium flex items-center justify-center gap-2 focus:outline-none focus:ring-0 focus:shadow-none active:shadow-none"
                  style={{
                    backgroundColor: '#f59e0b',
                    borderColor: '#f59e0b',
                    color: '#ffffff',
                    transition: 'background-color 0.2s ease',
                    transform: 'none',
                    boxShadow: 'none',
                    border: '1px solid #f59e0b',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#d97706';
                    e.currentTarget.style.borderColor = '#d97706';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#f59e0b';
                    e.currentTarget.style.borderColor = '#f59e0b';
                  }}
                >
                  <Clock size={16} />
                  <span>Mark as Pending</span>
                </button>
              )}
            </div>
          </div>

          {/* Right Column - Products Section */}
          <div className="lg:col-span-2" style={{ marginRight: '0px' }}>
            <div 
              className="bg-white dark:bg-gray-800 rounded-lg h-fit"
              style={{ border: '2px solid rgba(229, 231, 235, 0.7)' }}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: 'none' }}>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white m-0">
                  Purchase Details
                </h3>
              </div>
              
              {/* Body - Products Section */}
              <div className="px-6 pb-12" style={{ paddingTop: '4px' }}>
                <div className="ml-2 mr-2" style={{ paddingTop: '24px' }}>
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white m-0">
                      Products Purchased
                    </h4>
                    <button
                      type="button"
                      onClick={() => setIsEditingProducts(!isEditingProducts)}
                      className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      disabled={isSubmitting}
                    >
                      <Edit 
                        size={20} 
                        className={isEditingProducts ? 'text-blue-600' : 'text-gray-600'} 
                      />
                    </button>
                  </div>
                  
                  {isEditingProducts ? (
                    <div className="space-y-4">
                      {Array.isArray(formData.editableProducts) && formData.editableProducts.length > 0 ? (
                        formData.editableProducts.map((product, index) => (
                        <div key={product.id || index} className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 p-4 border border-gray-200 rounded-lg">
                          <div className="flex-1 min-w-0">
                              <p className="font-medium text-gray-900 truncate">{product.productName || 'Unknown Product'}</p>
                              <p className="text-sm text-gray-600 truncate">SKU: {product.productSku || 'N/A'}</p>
                          </div>
                          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
                            <div className="flex items-center gap-2 flex-1 sm:flex-initial">
                              <div className="flex-1 sm:flex-initial">
                                <input
                                  type="number"
                                  value={product.quantity || 0}
                                  onChange={(e) => handleProductChange(index, 'quantity', parseInt(e.target.value) || 0)}
                                  className="w-full sm:w-20 px-3 py-2 text-sm border border-gray-300 bg-white text-gray-800 rounded-lg shadow-sm transition duration-150 ease-in-out hover:border-gray-600 focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                  min="0"
                                  placeholder="Qty"
                                />
                              </div>
                              <span className="text-gray-500 flex-shrink-0">×</span>
                              <div className="flex-1 sm:flex-initial">
                                <input
                                  type="number"
                                  value={product.price || 0}
                                  onChange={(e) => handleProductChange(index, 'price', parseFloat(e.target.value) || 0)}
                                  className="w-full sm:w-24 px-3 py-2 text-sm border border-gray-300 bg-white text-gray-800 rounded-lg shadow-sm transition duration-150 ease-in-out hover:border-gray-600 focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                  min="0"
                                  step="0.01"
                                  placeholder="Price"
                                />
                              </div>
                            </div>
                            <div className="flex items-center justify-between sm:justify-end gap-2 px-3 py-2 bg-gray-50 rounded-lg sm:bg-transparent sm:p-0">
                              <span className="text-xs text-gray-500 sm:hidden">Total:</span>
                              <span className="font-semibold text-gray-900 text-sm sm:text-base whitespace-nowrap">
                                  ${((product.quantity || 0) * (product.price || 0)).toFixed(2)}
                              </span>
                            </div>
                          </div>
                        </div>
                        ))
                      ) : (
                        <div className="text-center py-8">
                          <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                          <p className="text-gray-500">No products to edit</p>
                        </div>
                      )}
                      
                      <div className="flex gap-2 pt-4 border-t border-gray-200">
                        <button
                          onClick={() => setIsEditingProducts(false)}
                          disabled={isSubmitting}
                          className="flex-1 h-8 px-3 py-1 text-sm rounded-md font-medium flex items-center justify-center gap-1.5 focus:outline-none focus:ring-0 focus:shadow-none active:shadow-none"
                          style={{
                            backgroundColor: '#f3f4f6',
                            borderColor: '#d1d5db',
                            color: '#374151',
                            transition: 'background-color 0.2s ease',
                            transform: 'none',
                            boxShadow: 'none',
                            border: '1px solid #d1d5db',
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = '#e5e7eb';
                            e.currentTarget.style.borderColor = '#9ca3af';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = '#f3f4f6';
                            e.currentTarget.style.borderColor = '#d1d5db';
                          }}
                        >
                          <X className="w-4 h-4" />
                          <span>Cancel</span>
                        </button>
                        <button
                          onClick={handleSaveProducts}
                          disabled={isSubmitting}
                          className="flex-1 h-8 px-3 py-1 text-sm rounded-md font-medium flex items-center justify-center gap-1.5 focus:outline-none focus:ring-0 focus:shadow-none active:shadow-none"
                          style={{
                            backgroundColor: '#3b82f6',
                            borderColor: '#3b82f6',
                            color: '#ffffff',
                            transition: 'background-color 0.2s ease',
                            transform: 'none',
                            boxShadow: 'none',
                            border: '1px solid #3b82f6',
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = '#2563eb';
                            e.currentTarget.style.borderColor = '#2563eb';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = '#3b82f6';
                            e.currentTarget.style.borderColor = '#3b82f6';
                          }}
                        >
                          {isSubmitting ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin" />
                              <span>Saving...</span>
                            </>
                          ) : (
                            <>
                              <Save className="w-4 h-4" />
                              <span>Save</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {Array.isArray(currentPurchase.productPurchases) && currentPurchase.productPurchases.length > 0 ? (
                        currentPurchase.productPurchases.map((productPurchase, index) => (
                        <div key={productPurchase.id || index} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-3 min-w-0 flex-1">
                            <div className="p-2 bg-blue-50 rounded-lg flex-shrink-0">
                              <Package className="w-5 h-5 text-blue-600" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="font-medium text-gray-900 truncate">
                                {productPurchase.product?.name || 'Unknown Product'}
                              </p>
                              <p className="text-sm text-gray-600 truncate">
                                SKU: {productPurchase.product?.sku || 'N/A'}
                              </p>
                            </div>
                          </div>
                          <div className="text-left sm:text-right flex-shrink-0">
                            <p className="font-semibold text-gray-900">
                                {productPurchase.purchase_quantity || 0} × ${(productPurchase.purchase_price || 0).toFixed(2)}
                            </p>
                            <p className="text-sm text-gray-600">
                              = ${((productPurchase.purchase_quantity || 0) * (productPurchase.purchase_price || 0)).toFixed(2)}
                            </p>
                          </div>
                        </div>
                        ))
                      ) : (
                        <div className="text-center py-8">
                          <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                          <p className="text-gray-500">No products in this purchase</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Financial Summary Section */}
              <div className="px-6 py-4 border-t border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Financial Summary
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-semibold">${calculateSubtotal().toFixed(2)}</span>
            </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Discount</span>
                    <span className="font-semibold text-green-600">-${(formData.discount || 0).toFixed(2)}</span>
          </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tax</span>
                    <span className="font-semibold">${(formData.tax || 0).toFixed(2)}</span>
                  </div>
                  <hr className="border-gray-200" />
                  <div className="flex justify-between text-lg">
                    <span className="font-semibold text-gray-900">Total</span>
                    <span className="font-bold text-blue-600">${calculateTotal().toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-red-50 rounded-lg">
                <Trash2 className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Delete Purchase</h3>
                <p className="text-sm text-gray-600">This action cannot be undone</p>
              </div>
            </div>
            
            <p className="text-gray-700 mb-6">
              Are you sure you want to delete purchase order <strong>{currentPurchase.poNumber || currentPurchase.id}</strong>? 
              This will permanently remove the purchase and all associated data.
            </p>
            
            <div className="flex gap-3">
              <Button
                onClick={() => setShowDeleteModal(false)}
                variant="outline"
                className="flex-1"
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                onClick={handleDelete}
                className="flex-1 bg-red-600 hover:bg-red-700"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <Trash2 className="w-4 h-4 mr-2" />
                )}
                Delete Purchase
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PurchaseDetail;