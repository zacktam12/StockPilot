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
} from "lucide-react";
import { 
  fetchSaleById, 
  updateSaleStatus, 
  updateSale,
  deleteSale,
  fetchCustomers
} from "../../../store/slices/salesSlice";
import { fetchAllProducts } from "../../../store/slices/productSlice";
import { showToast } from "../../../store/slices/uiSlice";
import Button from "../../../components/shared/Button";
import Input from "../../../components/shared/Input";

const SaleDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const exportRef = useRef(null);
  const { 
    saleDetails, 
    loading, 
    error, 
    customers
  } = useSelector((state) => state.sales);
  
  const { allProducts } = useSelector((state) => state.product);

  const [isEditingSaleInfo, setIsEditingSaleInfo] = useState(false);
  const [isEditingProducts, setIsEditingProducts] = useState(false);
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    if (id) {
      dispatch(fetchSaleById(id));
    }
    if (!customers || customers.length === 0) {
      dispatch(fetchCustomers());
    }
    if (!allProducts || allProducts.length === 0) {
      dispatch(fetchAllProducts());
    }
  }, [dispatch, id, customers, allProducts]);

  useEffect(() => {
    if (saleDetails) {
      // Debug: Log the sale details to check timeline data
      setFormData({
        status: saleDetails.status || 'completed',
        notes: saleDetails.notes || '',
        paymentMethod: saleDetails.paymentMethod || 'cash',
        customerId: saleDetails.customerId || '',
        totalPrice: saleDetails.totalPrice || 0,
        discount: saleDetails.discount || 0,
        tax: saleDetails.tax || 0,
        productSales: saleDetails.productSales || [],
        // Add editable product data
        editableProducts: saleDetails.productSales?.map(ps => ({
          id: ps.id,
          productId: ps.productId,
          productName: ps.product?.name || '',
          quantity: ps.sale_quantity || 1,
          price: ps.sale_price || 0,
        })) || [],
      });
    }
  }, [saleDetails]);

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


  const handleSaveSaleInfo = async () => {
    setIsSubmitting(true);
    try {
      await dispatch(updateSale({ 
        id: saleDetails.id, 
        customerId: formData.customerId,
        paymentMethod: formData.paymentMethod,
        notes: formData.notes
      })).unwrap();
      
      await dispatch(updateSaleStatus({ 
        id: saleDetails.id, 
        status: formData.status 
      })).unwrap();
      
      dispatch(showToast({
        type: 'success',
        message: 'Sale information updated successfully'
      }));
      
      setIsEditingSaleInfo(false);
    } catch (error) {
      dispatch(showToast({
        type: 'error',
        message: error || 'Failed to update sale information'
      }));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveProducts = async () => {
    setIsSubmitting(true);
    try {
      // Calculate new totals based on editable products
      const subtotal = formData.editableProducts.reduce((sum, product) => 
        sum + (product.quantity * product.price), 0
      );
      
      // Apply discount and tax to get final total
      const discount = saleDetails.discount || 0;
      const tax = saleDetails.tax || 0;
      const finalTotal = subtotal - discount + tax;
      
      await dispatch(updateSale({ 
        id: saleDetails.id, 
        customerId: formData.customerId,
        paymentMethod: formData.paymentMethod,
        notes: formData.notes,
        totalPrice: finalTotal,
        productSales: formData.editableProducts
      })).unwrap();
      
      dispatch(showToast({
        type: 'success',
        message: 'Products updated successfully'
      }));
      
      setIsEditingProducts(false);
      // Refresh the sale details to get updated data
      dispatch(fetchSaleById(id));
    } catch (error) {
      dispatch(showToast({
        type: 'error',
        message: error || 'Failed to update products'
      }));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    setIsSubmitting(true);
    try {
      await dispatch(deleteSale(saleDetails.id)).unwrap();
      
      dispatch(showToast({
        type: 'success',
        message: 'Sale deleted successfully'
      }));
      
      navigate('/sales');
    } catch (error) {
      dispatch(showToast({
        type: 'error',
        message: error || 'Failed to delete sale'
      }));
    } finally {
      setIsSubmitting(false);
      setShowDeleteModal(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExport = async () => {
    if (!saleDetails) return;
    
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
      yPosition = addText('SALES RECEIPT', 20, yPosition, { fontSize: 20, fontStyle: 'bold' });
      yPosition = addText(`Order Number: ${saleDetails.orderNumber || saleDetails.id}`, 20, yPosition, { fontSize: 14, fontStyle: 'bold' });
      yPosition = addText(`Date: ${formatDate(saleDetails.createdAt)}`, 20, yPosition);
      yPosition = addText(`Status: ${saleDetails.status?.toUpperCase() || 'UNKNOWN'}`, 20, yPosition);
      yPosition += 10;
      
      // Sale Information
      yPosition = addText('SALE INFORMATION', 20, yPosition, { fontSize: 16, fontStyle: 'bold' });
      yPosition = addText(`Customer: ${saleDetails.customer?.name || 'Walk-in Customer'}`, 20, yPosition);
      yPosition = addText(`Sold By: ${saleDetails.user?.firstName || saleDetails.user?.email || 'Unknown User'}`, 20, yPosition);
      yPosition = addText(`Payment Method: ${saleDetails.paymentMethod || 'Not specified'}`, 20, yPosition);
      if (saleDetails.notes) {
        yPosition = addText(`Notes: ${saleDetails.notes}`, 20, yPosition);
      }
      yPosition += 10;
      
      // Products Table Header
      yPosition = addText('PRODUCTS SOLD', 20, yPosition, { fontSize: 16, fontStyle: 'bold' });
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
      if (saleDetails.productSales && saleDetails.productSales.length > 0) {
        saleDetails.productSales.forEach((productSale) => {
          // Check if we need a new page
          if (yPosition > pageHeight - 30) {
        pdf.addPage();
            yPosition = 20;
          }
          
          const productName = productSale.product?.name || 'Unknown Product';
          const sku = productSale.product?.sku || 'N/A';
          const quantity = productSale.sale_quantity || 0;
          const unitPrice = productSale.sale_price || 0;
          const total = quantity * unitPrice;
          
          addText(productName, colPositions[0], yPosition, { fontSize: 9 });
          addText(sku, colPositions[1], yPosition, { fontSize: 9 });
          addText(quantity.toString(), colPositions[2], yPosition, { fontSize: 9 });
          addText(`$${unitPrice.toFixed(2)}`, colPositions[3], yPosition, { fontSize: 9 });
          addText(`$${total.toFixed(2)}`, colPositions[4], yPosition, { fontSize: 9 });
          yPosition += 8;
        });
      } else {
        yPosition = addText('No products in this sale', 20, yPosition);
      }
      
      yPosition += 10;
      yPosition = addLine(yPosition);
      
      // Financial Summary
      yPosition = addText('FINANCIAL SUMMARY', 20, yPosition, { fontSize: 16, fontStyle: 'bold' });
      yPosition += 5;
      
      const subtotal = saleDetails.productSales?.reduce((sum, ps) => sum + ((ps.sale_quantity || 0) * (ps.sale_price || 0)), 0) || 0;
      const discount = saleDetails.discount || 0;
      const tax = saleDetails.tax || 0;
      const total = subtotal - discount + tax;
      
      yPosition = addText(`Subtotal: $${subtotal.toFixed(2)}`, 20, yPosition);
      yPosition = addText(`Discount: -$${discount.toFixed(2)}`, 20, yPosition);
      yPosition = addText(`Tax: $${tax.toFixed(2)}`, 20, yPosition);
      yPosition = addLine(yPosition);
      yPosition = addText(`TOTAL: $${total.toFixed(2)}`, 20, yPosition, { fontSize: 14, fontStyle: 'bold', color: '#2563eb' });
      
      // Footer
      yPosition = pageHeight - 20;
      addText(`Generated on ${new Date().toLocaleString()}`, 20, yPosition, { fontSize: 8, color: '#666666' });
      
      // Save the PDF
      pdf.save(`sale-${saleDetails.orderNumber || saleDetails.id}.pdf`);

      dispatch(showToast({
        type: 'success',
        message: 'Sale details exported successfully'
      }));
    } catch (error) {
      dispatch(showToast({
        type: 'error',
        message: 'Failed to export sale details'
      }));
    }
  };

  const handleCopyOrderNumber = () => {
    if (saleDetails?.orderNumber) {
      navigator.clipboard.writeText(saleDetails.orderNumber);
      dispatch(showToast({
        type: 'success',
        message: 'Order number copied to clipboard'
      }));
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-600" />;
      case 'cancelled':
        return <XCircle className="w-5 h-5 text-red-600" />;
      default:
        return <Clock className="w-5 h-5 text-gray-600" />;
    }
  };

  const getStatusBadge = (status) => {
    const statusStyles = {
      completed: "bg-green-100 text-green-800",
      pending: "bg-yellow-100 text-yellow-800",
      cancelled: "bg-red-100 text-red-800",
    };
    return (
      <span
        className={`px-3 py-1 rounded-full text-sm font-medium ${
          statusStyles[status] || "bg-gray-100 text-gray-800"
        }`}
      >
        {status?.charAt(0).toUpperCase() + status?.slice(1)}
      </span>
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not available';
    const date = new Date(dateString);
    // Check if the date is valid
    if (isNaN(date.getTime())) {
      console.warn('Invalid date received:', dateString);
      return 'Invalid date';
    }
    return date.toLocaleString();
  };

  // Loading skeleton
  if (loading && !saleDetails) {
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

  // Error state
  if (error || (!saleDetails && !loading)) {
    return (
      <div className="bg-white rounded-lg">
        <div 
          className="pt-5 pb-8 min-h-full"
          style={{ paddingLeft: '24px', paddingRight: '24px' }}
        >
          <div className="flex flex-row items-center justify-between gap-4 mb-6" style={{ marginTop: '0px' }}>
            <div className="flex items-center gap-4 flex-1" style={{ marginLeft: '0px' }}>
              <button
                onClick={() => navigate("/sales")}
                className="h-12 w-12 p-0 bg-blue-50 hover:bg-blue-100 rounded-lg flex items-center justify-center border-2"
                style={{
                  borderColor: '#3b82f6',
                  color: '#3b82f6',
                  borderWidth: '2px',
                  borderStyle: 'solid',
                  borderRadius: '8px',
                  backgroundColor: '#f0f9ff',
                }}
              >
                <ArrowLeft size={24} />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-1">
                  {error ? 'Error Loading Sale' : 'Sale Not Found'}
                </h1>
                <p className="text-sm font-medium text-gray-600">
                  {error || 'Unable to load sale details'}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 rounded-lg p-8 text-center">
            <p className="text-sm font-medium text-gray-600">
              {error 
                ? `There was an error loading the sale: ${error}` 
                : "The sale you're looking for could not be found."
              }
            </p>
            <div className="flex gap-3 mt-4 justify-center">
              <button
                onClick={() => navigate("/sales")}
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
                    dispatch(fetchSaleById(id));
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

  if (!saleDetails) {
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
              onClick={() => navigate("/sales")}
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
                Sale #{saleDetails.orderNumber || saleDetails.id}
              </h1>
              <p className="text-sm font-medium text-gray-600">
                View and manage sale details
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
          {/* Left Column - Sale Information */}
          <div>
            <div 
              className="bg-white dark:bg-gray-800 rounded-lg h-fit"
              style={{ border: '2px solid rgba(229, 231, 235, 0.7)' }}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: 'none' }}>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white m-0">
                  Sale Information
                </h3>
                <button
                  type="button"
                  onClick={() => setIsEditingSaleInfo(!isEditingSaleInfo)}
                  className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  disabled={isSubmitting}
                >
                  <Edit 
                    size={20} 
                    className={isEditingSaleInfo ? 'text-blue-600' : 'text-gray-600'} 
                  />
                </button>
              </div>
              
              {/* Body */}
              <div className="px-6 pb-6">
                {isEditingSaleInfo ? (
                  <div className="space-y-4">
                    {/* Order Number - Read Only */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Hash className="w-4 h-4 text-gray-500" />
                        <span className="text-sm font-medium text-gray-600">Order Number</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-gray-900">
                          {saleDetails.orderNumber || 'N/A'}
                        </span>
                        <button
                          onClick={handleCopyOrderNumber}
                          className="p-1 hover:bg-gray-100 rounded"
                          title="Copy order number"
                        >
                          <Copy size={14} className="text-gray-500" />
                        </button>
                      </div>
                    </div>

                    {/* Status - Editable */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Status
                      </label>
                      <select
                        name="status"
                        value={formData.status}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="pending">Pending</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </div>

                    {/* Customer - Editable */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Customer
                      </label>
                      <select
                        name="customerId"
                        value={formData.customerId}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        disabled={!customers || customers.length === 0}
                      >
                        <option value="">Walk-in Customer</option>
                        {customers && customers.length > 0 ? (
                          customers.map((customer) => (
                            <option key={customer.id} value={customer.id}>
                              {customer.name}
                            </option>
                          ))
                        ) : (
                          <option value="" disabled>Loading customers...</option>
                        )}
                      </select>
                    </div>

                    {/* Payment Method - Editable */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Payment Method
                      </label>
                      <select
                        name="paymentMethod"
                        value={formData.paymentMethod}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="cash">Cash</option>
                        <option value="card">Card</option>
                        <option value="bank_transfer">Bank Transfer</option>
                        <option value="check">Check</option>
                      </select>
                    </div>

                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Order Number */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Hash className="w-4 h-4 text-gray-500" />
                        <span className="text-sm font-medium text-gray-600">Order Number</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-gray-900">
                          {saleDetails.orderNumber || 'N/A'}
                        </span>
                        <button
                          onClick={handleCopyOrderNumber}
                          className="p-1 hover:bg-gray-100 rounded"
                          title="Copy order number"
                        >
                          <Copy size={14} className="text-gray-500" />
                        </button>
                      </div>
                    </div>

                    {/* Status */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(saleDetails.status)}
                        <span className="text-sm font-medium text-gray-600">Status</span>
                      </div>
                      {getStatusBadge(saleDetails.status)}
                    </div>

                    {/* Customer */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-gray-500" />
                        <span className="text-sm font-medium text-gray-600">Customer</span>
                      </div>
                      <span className="text-sm font-semibold text-gray-900">
                        {saleDetails.customer?.name || 'Walk-in Customer'}
                      </span>
                    </div>

                    {/* Payment Method */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CreditCard className="w-4 h-4 text-gray-500" />
                        <span className="text-sm font-medium text-gray-600">Payment</span>
                      </div>
                      <span className="text-sm font-semibold text-gray-900">
                        {saleDetails.paymentMethod || 'Cash'}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Save Button - Only show when editing sale info */}
              {isEditingSaleInfo && (
                <div className="px-6 pb-4">
                  <div className="flex justify-end">
                    <button
                      onClick={handleSaveSaleInfo}
                      disabled={isSubmitting}
                      className="h-8 px-3 py-1 text-sm rounded-md font-medium flex items-center justify-center gap-1.5 focus:outline-none focus:ring-0 focus:shadow-none active:shadow-none"
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
                          Saving...
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
              )}

              {/* Remove Sale Button - Only show when not editing */}
              {!isEditingSaleInfo && (
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
                      <span>Remove Sale</span>
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
                Sale Details
              </h3>
            </div>
            
            {/* Body - Unified Content */}
            <div className="px-6 pb-12" style={{ paddingTop: '4px' }}>
              {/* Products Section */}
              <div className="ml-2 mr-2" style={{ paddingTop: '24px' }}>
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white m-0">
                    Products Sold
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
                    {/* Products Section - Editable */}
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-lg font-semibold text-gray-900">Products</h4>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={addProduct}
                            className="h-8 px-3 py-1 text-sm rounded-md font-medium flex items-center justify-center gap-1.5 focus:outline-none focus:ring-0 focus:shadow-none active:shadow-none"
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
                            <Package className="w-4 h-4" />
                            <span>Add Product</span>
                          </button>
                          <button
                            onClick={handleSaveProducts}
                            disabled={isSubmitting}
                            className="h-8 px-3 py-1 text-sm rounded-md font-medium flex items-center justify-center gap-1.5 focus:outline-none focus:ring-0 focus:shadow-none active:shadow-none"
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
                                Saving...
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
                      
                      {formData.editableProducts?.length > 0 ? (
                        <div className="space-y-3">
                          {formData.editableProducts.map((product, index) => (
                            <div key={index} className="p-4 bg-gray-50 rounded-lg">
                              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                                {/* Product Selection */}
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Product
                                  </label>
                                  <select
                                    value={product.productId}
                                    onChange={(e) => {
                                      const selectedProduct = allProducts.find(p => p.id === e.target.value);
                                      handleProductChange(index, 'productId', e.target.value);
                                      handleProductChange(index, 'productName', selectedProduct?.name || '');
                                      handleProductChange(index, 'price', selectedProduct?.price || 0);
                                    }}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                  >
                                    <option value="">Select Product</option>
                                    {allProducts && allProducts.length > 0 ? (
                                      allProducts.map((prod) => (
                                        <option key={prod.id} value={prod.id}>
                                          {prod.name}
                                        </option>
                                      ))
                                    ) : (
                                      <option value="" disabled>Loading products...</option>
                                    )}
                                  </select>
                                </div>

                                {/* Quantity */}
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Quantity
                                  </label>
                                  <input
                                    type="number"
                                    min="1"
                                    value={product.quantity}
                                    onChange={(e) => handleProductChange(index, 'quantity', parseInt(e.target.value) || 1)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                  />
                                </div>

                                {/* Price */}
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Price
                                  </label>
                                  <input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={product.price}
                                    onChange={(e) => handleProductChange(index, 'price', parseFloat(e.target.value) || 0)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                  />
                                </div>

                                {/* Actions */}
                                <div className="flex items-end">
                                  <button
                                    onClick={() => removeProduct(index)}
                                    className="w-full px-3 py-2 text-red-600 border border-red-300 rounded-lg hover:bg-red-50 flex items-center justify-center gap-2"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                    Remove
                                  </button>
                                </div>
                              </div>
                              
                              {/* Subtotal */}
                              <div className="mt-2 text-right">
                                <span className="text-sm text-gray-600">Subtotal: </span>
                                <span className="font-semibold text-gray-900">
                                  ${(product.quantity * product.price).toFixed(2)}
                                </span>
                              </div>
                            </div>
                          ))}
                          
                          {/* Running Total Summary */}
                          <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                            <div className="flex justify-between items-center">
                              <span className="text-sm font-medium text-blue-800">Running Total:</span>
                              <span className="text-lg font-bold text-blue-900">
                                ${formData.editableProducts.reduce((sum, product) => 
                                  sum + (product.quantity * product.price), 0
                                ).toFixed(2)}
                              </span>
                            </div>
                            {(saleDetails.discount || 0) > 0 && (
                              <div className="flex justify-between items-center mt-1">
                                <span className="text-sm text-blue-700">After Discount:</span>
                                <span className="text-sm font-semibold text-blue-800">
                                  ${(formData.editableProducts.reduce((sum, product) => 
                                    sum + (product.quantity * product.price), 0
                                  ) - (saleDetails.discount || 0)).toFixed(2)}
                                </span>
                              </div>
                            )}
                            {(saleDetails.tax || 0) > 0 && (
                              <div className="flex justify-between items-center mt-1">
                                <span className="text-sm text-blue-700">After Tax:</span>
                                <span className="text-sm font-semibold text-blue-800">
                                  ${(formData.editableProducts.reduce((sum, product) => 
                                    sum + (product.quantity * product.price), 0
                                  ) - (saleDetails.discount || 0) + (saleDetails.tax || 0)).toFixed(2)}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-8 text-gray-500">
                          <Package className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                          <p>No products added</p>
                        </div>
                      )}
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
                        placeholder="Add notes about this sale..."
                      />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Products Section */}
                    <div className="mb-6">
                      {saleDetails.productSales && saleDetails.productSales.length > 0 ? (
                        <div className="space-y-3">
                          {saleDetails.productSales.map((productSale, index) => (
                            <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                              <div className="flex items-center gap-3">
                                <Package className="w-5 h-5 text-gray-500" />
                                <div>
                                  <div className="font-medium text-gray-900">
                                    {productSale.product?.name || 'Unknown Product'}
                                  </div>
                                  <div className="text-sm text-gray-500">
                                    SKU: {productSale.product?.sku || 'N/A'}
                                  </div>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="font-semibold text-gray-900">
                                  {productSale.sale_quantity} × ${productSale.sale_price?.toFixed(2) || '0.00'}
                                </div>
                                <div className="text-sm text-gray-500">
                                  = ${((productSale.sale_quantity || 0) * (productSale.sale_price || 0)).toFixed(2)}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8 text-gray-500">
                          <Package className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                          <p>No products found for this sale</p>
                        </div>
                      )}
                    </div>


                    {/* Notes Section */}
                    <div className="mt-6">
                      <h4 className="text-sm font-semibold text-gray-900 mb-2">Notes</h4>
                      <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                        {saleDetails.notes || 'No notes added'}
                      </p>
                    </div>

                  </div>
                )}
              </div>

              {/* Summary Section - Hidden in edit mode */}
              {!isEditingProducts && (
                <div className="ml-2 mr-2" style={{ paddingTop: '24px' }}>
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 m-0">
                    Sale Summary
                  </h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Subtotal:</span>
                      <span className="text-sm font-semibold text-gray-900">
                        ${(() => {
                          if (!saleDetails.productSales || saleDetails.productSales.length === 0) {
                            return '0.00';
                          }
                          const subtotal = saleDetails.productSales.reduce((sum, productSale) => 
                            sum + ((productSale.sale_quantity || 0) * (productSale.sale_price || 0)), 0
                          );
                          return subtotal.toFixed(2);
                        })()}
                      </span>
                    </div>
                    {(saleDetails.discount || 0) > 0 && (
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Discount:</span>
                        <span className="text-sm font-semibold text-red-600">
                          -${(saleDetails.discount || 0).toFixed(2)}
                        </span>
                      </div>
                    )}
                    {(saleDetails.tax || 0) > 0 && (
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Tax:</span>
                        <span className="text-sm font-semibold text-gray-900">
                          ${(saleDetails.tax || 0).toFixed(2)}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between border-t pt-2">
                      <span className="text-lg font-bold text-gray-900">Total:</span>
                      <span className="text-lg font-bold text-gray-900">
                        ${(() => {
                          if (!saleDetails.productSales || saleDetails.productSales.length === 0) {
                            return '0.00';
                          }
                          const subtotal = saleDetails.productSales.reduce((sum, productSale) => 
                            sum + ((productSale.sale_quantity || 0) * (productSale.sale_price || 0)), 0
                          );
                          const discount = saleDetails.discount || 0;
                          const tax = saleDetails.tax || 0;
                          const total = subtotal - discount + tax;
                          return total.toFixed(2);
                        })()}
                      </span>
                    </div>
                  </div>
                </div>
              )}

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
                      {formatDate(saleDetails.createdAt)}
                    </div>
                    {saleDetails.user && (
                      <div className="text-sm text-gray-500 mt-1">
                        by {saleDetails.user.firstName || saleDetails.user.email}
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">
                      Last Updated
                    </label>
                    <div className="text-base font-semibold text-gray-900 dark:text-white">
                      {formatDate(saleDetails.updatedAt)}
                    </div>
                    {saleDetails.createdAt && saleDetails.updatedAt && 
                     new Date(saleDetails.updatedAt).getTime() !== new Date(saleDetails.createdAt).getTime() ? (
                      <div className="text-sm text-gray-500 mt-1">
                        Modified
                      </div>
                    ) : (
                      <div className="text-sm text-gray-500 mt-1">
                        Original
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Product Images Section */}
              {saleDetails.productSales && saleDetails.productSales.length > 0 && (
                <div className="ml-2 mr-2" style={{ paddingTop: '24px' }}>
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 m-0">
                    Product Images
                  </h4>
                  
                  <div className="flex flex-wrap gap-4 justify-start">
                    {saleDetails.productSales.map((productSale, index) => (
                      <div key={index} className="flex flex-col items-center">
                        {productSale.product?.image_url ? (
                          <div className="relative">
                            <img
                              src={productSale.product.image_url}
                              alt={productSale.product.name}
                              className="h-32 w-32 object-cover rounded-lg shadow-sm border border-gray-200"
                            />
                            <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-white px-2 py-1 rounded-md shadow-sm border border-gray-200">
                              <span className="text-xs font-medium text-gray-700">
                                {productSale.sale_quantity}x
                              </span>
                            </div>
                          </div>
                        ) : (
                          <div className="h-32 w-32 bg-gray-100 dark:bg-gray-700 rounded-lg flex flex-col items-center justify-center border border-gray-200 relative">
                            <Package size={32} className="text-gray-400 mb-1" />
                            <span className="text-xs text-gray-500 text-center px-1">No image found</span>
                            <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-white px-2 py-1 rounded-md shadow-sm border border-gray-200">
                              <span className="text-xs font-medium text-gray-700">
                                {productSale.sale_quantity}x
                              </span>
                            </div>
                          </div>
                        )}
                        <div className="mt-2 text-center">
                          <p className="text-sm font-medium text-gray-900 truncate max-w-32">
                            {productSale.product?.name || 'Unknown Product'}
                          </p>
                          <p className="text-xs text-gray-500">
                            ${productSale.sale_price?.toFixed(2) || '0.00'}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              </div>
            </div>
          </div>
        </div>


        {/* Delete Confirmation Modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 text-center">
                Delete Sale
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6 text-center">
                Are you sure you want to delete sale #{saleDetails?.orderNumber || saleDetails?.id}? This action cannot be undone.
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center justify-center gap-2"
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
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SaleDetail;
