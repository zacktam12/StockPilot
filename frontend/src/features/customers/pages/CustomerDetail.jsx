import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import jsPDF from 'jspdf';
import {
  ArrowLeft,
  ArrowUp,
  Edit,
  Trash2,
  Mail,
  Phone,
  MapPin,
  User,
  Calendar,
  Loader2,
  Save,
  X,
  Printer,
  Download,
  CheckCircle,
  Package,
  ShoppingCart,
  DollarSign,
  Users,
} from "lucide-react";
import { fetchCustomerById, updateCustomer, deleteCustomer } from "../../../store/slices/customerSlice";
import { fetchSales } from "../../../store/slices/salesSlice";
import { showToast } from "../../../store/slices/uiSlice";
import Button from "../../../components/shared/Button";
import Input from "../../../components/shared/Input";

const CustomerDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { selectedCustomer, loading, error } = useSelector((state) => state.customer);
  const { sales = [] } = useSelector((state) => state.sales);

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    if (id && id !== 'undefined' && id !== 'null' && id !== '' && id !== 'NaN') {
      dispatch(fetchCustomerById(id));
      // Fetch sales for this customer
      dispatch(fetchSales({ customerId: id, limit: 100 }));
    } else {
      // If no valid ID, redirect to customers list
      navigate('/customers');
    }
  }, [dispatch, id, navigate]);

  const updateFormDataFromCustomer = useCallback((customer) => {
    setFormData({
      name: customer.name || "",
      email: customer.email || "",
      phone: customer.phone || "",
      address: customer.address || "",
      notes: customer.notes || "",
    });
  }, []);

  useEffect(() => {
    if (selectedCustomer) {
      updateFormDataFromCustomer(selectedCustomer);
    }
  }, [selectedCustomer, updateFormDataFromCustomer]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: undefined }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name?.trim()) newErrors.name = "Customer name is required";
    if (!formData.email?.trim()) newErrors.email = "Email is required";
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }
    if (formData.phone && !/^[\+]?[1-9][\d]{0,15}$/.test(formData.phone.replace(/\s/g, ""))) {
      newErrors.phone = "Please enter a valid phone number";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const customerData = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim() || null,
        address: formData.address.trim() || null,
        notes: formData.notes.trim() || null,
      };

      // Remove null/undefined values
      Object.keys(customerData).forEach(key => {
        if (customerData[key] === null || customerData[key] === undefined || customerData[key] === '') {
          delete customerData[key];
        }
      });

      const updatedCustomer = await dispatch(updateCustomer({ id, ...customerData })).unwrap();
      updateFormDataFromCustomer(updatedCustomer);
      dispatch(showToast({ message: "Customer updated successfully!", type: "success" }));
      setIsEditing(false);
    } catch (err) {
      dispatch(showToast({ message: err.message || "Failed to update customer", type: "error" }));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    setIsSubmitting(true);
    try {
      await dispatch(deleteCustomer(id));
      navigate("/customers");
    } catch (error) {
          } finally {
      setIsSubmitting(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExport = async () => {
    if (!selectedCustomer) return;
    
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
      yPosition = addText('CUSTOMER PROFILE', 20, yPosition, { fontSize: 20, fontStyle: 'bold' });
      yPosition = addText(`Generated: ${new Date().toLocaleDateString()}`, 20, yPosition);
      yPosition += 10;
      
      // Customer Information
      yPosition = addText('CUSTOMER INFORMATION', 20, yPosition, { fontSize: 16, fontStyle: 'bold' });
      yPosition = addText(`Name: ${selectedCustomer.name || 'Not provided'}`, 20, yPosition);
      yPosition = addText(`Email: ${selectedCustomer.email || 'Not provided'}`, 20, yPosition);
      yPosition = addText(`Phone: ${selectedCustomer.phone || 'Not provided'}`, 20, yPosition);
      yPosition = addText(`Address: ${selectedCustomer.address || 'Not provided'}`, 20, yPosition);
      if (selectedCustomer.notes) {
        yPosition = addText(`Notes: ${selectedCustomer.notes}`, 20, yPosition);
      }
      yPosition += 10;
      
      // Sales History
      const customerSales = sales.filter(s => s.customerId === id);
      yPosition = addText('SALES HISTORY', 20, yPosition, { fontSize: 16, fontStyle: 'bold' });
      yPosition += 5;
      
      if (customerSales.length > 0) {
        // Table headers
        const tableHeaders = ['Order Number', 'Date', 'Status', 'Total Amount'];
        const colPositions = [20, 60, 100, 140];
        
        // Draw table header background
        pdf.setFillColor(240, 240, 240);
        pdf.rect(20, yPosition - 5, pageWidth - 40, 10, 'F');
        
        // Add table headers
        tableHeaders.forEach((header, index) => {
          addText(header, colPositions[index], yPosition, { fontSize: 10, fontStyle: 'bold' });
        });
        yPosition += 10;
        
        // Add sales records with product details
        customerSales.slice(0, 20).forEach((sale) => {
          // Check if we need a new page
          if (yPosition > pageHeight - 50) {
            pdf.addPage();
            yPosition = 20;
          }
          
          // Sale header
          addText(sale.orderNumber || `Sale-${sale.id.slice(0, 8)}`, colPositions[0], yPosition, { fontSize: 9, fontStyle: 'bold' });
          addText(formatDate(sale.createdAt), colPositions[1], yPosition, { fontSize: 9 });
          addText(sale.status || 'Completed', colPositions[2], yPosition, { fontSize: 9 });
          addText(`$${(sale.totalAmount || sale.totalPrice || 0).toFixed(2)}`, colPositions[3], yPosition, { fontSize: 9 });
          yPosition += 8;
          
          // Product details
          if (sale.productSales && sale.productSales.length > 0) {
            sale.productSales.forEach((productSale) => {
              if (yPosition > pageHeight - 30) {
                pdf.addPage();
                yPosition = 20;
              }
              
              const productName = productSale.product?.name || 'Unknown Product';
              const quantity = productSale.sale_quantity || 0;
              const price = productSale.sale_price || 0;
              const total = quantity * price;
              
              addText(`  └─ ${productName}`, colPositions[0], yPosition, { fontSize: 8, color: '#666666' });
              addText(`${quantity}x $${price.toFixed(2)}`, colPositions[2], yPosition, { fontSize: 8, color: '#666666' });
              addText(`$${total.toFixed(2)}`, colPositions[3], yPosition, { fontSize: 8, color: '#666666' });
              yPosition += 6;
            });
            yPosition += 4; // Extra space after each sale
          }
        });
        
        // Summary
        yPosition += 10;
        yPosition = addLine(yPosition);
        const totalSales = customerSales.length;
        const totalValue = customerSales.reduce((sum, s) => sum + (s.totalAmount || s.totalPrice || 0), 0);
        yPosition = addText(`Total Sales: ${totalSales}`, 20, yPosition, { fontSize: 12, fontStyle: 'bold' });
        yPosition = addText(`Total Value: $${totalValue.toFixed(2)}`, 20, yPosition, { fontSize: 12, fontStyle: 'bold' });
      } else {
        yPosition = addText('No sales history found', 20, yPosition);
      }
      
      // Footer
      yPosition = pageHeight - 20;
      addText(`Generated on ${new Date().toLocaleString()}`, 20, yPosition, { fontSize: 8, color: '#666666' });
      
      // Save the PDF
      pdf.save(`customer-${selectedCustomer.name || selectedCustomer.id}.pdf`);
      
      dispatch(showToast({
        type: 'success',
        message: 'Customer details exported successfully'
      }));
    } catch (error) {
      dispatch(showToast({
        type: 'error',
        message: 'Failed to export customer details'
      }));
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

  // Loading skeleton
  if (loading && !selectedCustomer) {
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
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 mb-8" style={{ gap: '50px' }}>
            <div className="space-y-4">
              <div className="bg-gray-200 rounded-lg h-64"></div>
              <div className="bg-gray-200 rounded-lg h-12"></div>
            </div>
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-gray-200 rounded-lg h-48"></div>
              <div className="bg-gray-200 rounded-lg h-48"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error || (!selectedCustomer && !loading)) {
    const errorMessage = error || 'Customer not found';
    const isInvalidId = error?.includes('Invalid') || error?.includes('not found') || !id || id === 'undefined' || id === 'null' || id === 'NaN' || isNaN(id);
    
    return (
      <div className="bg-white rounded-lg">
        <div 
          className="pt-5 pb-8 min-h-full"
          style={{ paddingLeft: '24px', paddingRight: '24px' }}
        >
          <div className="flex flex-row items-center justify-between gap-4 mb-6" style={{ marginTop: '0px' }}>
            <div className="flex items-center gap-4 flex-1" style={{ marginLeft: '0px' }}>
              <button
                onClick={() => navigate("/customers")}
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
                  {isInvalidId ? 'Invalid Customer ID' : 'Error Loading Customer'}
                </h1>
                <p className="text-sm font-medium text-gray-600">
                  {isInvalidId ? 'The customer ID is invalid or malformed' : 'Unable to load customer details'}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 rounded-lg p-8 text-center">
            <p className="text-sm font-medium text-gray-600">
              {isInvalidId 
                ? `The customer ID "${id}" you're trying to access is invalid. Please check the URL or go back to the customers list.`
                : `There was an error loading the customer: ${errorMessage}`
              }
            </p>
            {process.env.NODE_ENV === 'development' && (
              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-left">
                <p className="text-xs text-yellow-800 font-mono">
                  <strong>Debug Info:</strong><br/>
                  ID: {JSON.stringify(id)}<br/>
                  Type: {typeof id}<br/>
                  Error: {JSON.stringify(error)}<br/>
                  Loading: {JSON.stringify(loading)}<br/>
                  Selected Customer: {JSON.stringify(selectedCustomer ? 'exists' : 'null')}
                </p>
              </div>
            )}
            <div className="flex gap-3 mt-4 justify-center">
              <button
                onClick={() => navigate("/customers")}
                className="h-11 px-4 py-3 rounded-lg bg-blue-600 text-white"
              >
                Go Back
              </button>
              {!isInvalidId && (
                <button
                  onClick={() => {
                    if (id && id !== 'undefined' && id !== 'null') {
                      dispatch(fetchCustomerById(id));
                    }
                  }}
                  className="h-11 px-4 py-3 rounded-lg bg-green-600 text-white"
                >
                  Try Again
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!selectedCustomer) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg">
      <div 
        className="pt-5 pb-12 min-h-full"
        style={{ paddingLeft: '24px', paddingRight: '24px' }}
      >
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6" style={{ marginTop: '0px' }}>
          <div className="flex items-center gap-4 flex-1 min-w-0" style={{ marginLeft: '0px' }}>
            <button
              onClick={() => navigate("/customers")}
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
                {selectedCustomer.name}
              </h1>
              <p className="text-sm font-medium text-gray-600">
                View and manage customer information
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
          {/* Left Column - Customer Information */}
          <div>
            <div 
              className="bg-white dark:bg-gray-800 rounded-lg h-fit"
              style={{ border: '2px solid rgba(229, 231, 235, 0.7)' }}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: 'none' }}>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white m-0">
                  Customer Information
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
                        Customer Name *
                      </label>
                      <input
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="Customer Name..."
                        className="w-full h-11 px-3 py-2 text-base border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:border-gray-400 dark:hover:border-gray-500 focus:border-gray-400 dark:focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-400 dark:focus:ring-gray-500"
                      />
                      {errors.name && (
                        <p className="text-red-500 text-sm mt-1">{errors.name}</p>
                      )}
                    </div>

                    <div className="ml-2 mr-2">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Email Address *
                      </label>
                      <input
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="Email Address..."
                        className="w-full h-11 px-3 py-2 text-base border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:border-gray-400 dark:hover:border-gray-500 focus:border-gray-400 dark:focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-400 dark:focus:ring-gray-500"
                      />
                      {errors.email && (
                        <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                      )}
                    </div>

                    <div className="ml-2 mr-2">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Phone Number
                      </label>
                      <input
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder="Phone Number..."
                        className="w-full h-11 px-3 py-2 text-base border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:border-gray-400 dark:hover:border-gray-500 focus:border-gray-400 dark:focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-400 dark:focus:ring-gray-500"
                      />
                      {errors.phone && (
                        <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
                      )}
                    </div>

                    <div className="ml-2 mr-2">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Address
                      </label>
                      <textarea
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        placeholder="Address..."
                        className="w-full h-24 px-3 py-2 text-base border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:border-gray-400 dark:hover:border-gray-500 focus:border-gray-400 dark:focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-400 dark:focus:ring-gray-500 resize-none"
                      />
                    </div>

                    <div className="ml-2 mr-2">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Notes
                      </label>
                      <textarea
                        name="notes"
                        value={formData.notes}
                        onChange={handleInputChange}
                        placeholder="Additional notes..."
                        className="w-full h-24 px-3 py-2 text-base border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:border-gray-400 dark:hover:border-gray-500 focus:border-gray-400 dark:focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-400 dark:focus:ring-gray-500 resize-none"
                      />
                    </div>

                    <button
                      onClick={handleSave}
                      disabled={isSubmitting || !formData.name?.trim() || !formData.email?.trim()}
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
                  <div className="space-y-4">
                    {/* Customer Name */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-gray-500" />
                        <span className="text-sm font-medium text-gray-600">Customer Name</span>
                      </div>
                      <div>
                        <span className="text-sm text-gray-900">
                            {formData.name || selectedCustomer.name || ""}
                          </span>
                        </div>
                      </div>

                    {/* Email */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-gray-500" />
                        <span className="text-sm font-medium text-gray-600">Email</span>
                      </div>
                      <div>
                        <span className="text-sm text-gray-900">
                            {formData.email || selectedCustomer.email || "Not provided"}
                          </span>
                        </div>
                      </div>

                    {/* Phone */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-gray-500" />
                        <span className="text-sm font-medium text-gray-600">Phone</span>
                      </div>
                      <div>
                        <span className="text-sm text-gray-900">
                            {formData.phone || selectedCustomer.phone || "Not provided"}
                          </span>
                        </div>
                      </div>

                    {/* Address */}
                    {formData.address || selectedCustomer.address ? (
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-gray-500" />
                          <span className="text-sm font-medium text-gray-600">Address</span>
                        </div>
                        <div className="text-right">
                          <span className="text-sm text-gray-900">
                            {formData.address || selectedCustomer.address}
                          </span>
                        </div>
                      </div>
                    ) : null}

                    {/* Notes */}
                    {formData.notes || selectedCustomer.notes ? (
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-gray-500" />
                          <span className="text-sm font-medium text-gray-600">Notes</span>
                        </div>
                        <div className="text-right">
                          <span className="text-sm text-gray-900">
                            {formData.notes || selectedCustomer.notes}
                          </span>
                        </div>
                      </div>
                    ) : null}
                  </div>
                )}
              </div>
              
              {/* Remove Customer Button - Inside Card (only show when not editing) */}
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
                      <span>Remove Customer</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Sales History & Statistics */}
          <div className="lg:col-span-2" style={{ marginRight: '0px' }}>
            <div 
              className="bg-white dark:bg-gray-800 rounded-lg h-fit"
              style={{ border: '2px solid rgba(229, 231, 235, 0.7)' }}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: 'none' }}>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white m-0">
                  Sales History & Statistics
                </h3>
              </div>
              
              {/* Body */}
              <div className="px-6 pb-12" style={{ paddingTop: '4px' }}>
                <div className="ml-2 mr-2" style={{ paddingTop: '24px' }}>
                  {/* Sales Statistics */}
                  <div className="mb-6">
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                      Sales Statistics
                    </h4>
                    {(() => {
                      const customerSales = sales.filter(s => s.customerId === id);
                      const totalSales = customerSales.length;
                      const totalValue = customerSales.reduce((sum, s) => sum + (s.totalAmount || s.totalPrice || 0), 0);
                      const avgSaleValue = totalSales > 0 ? totalValue / totalSales : 0;
                      const recentSales = customerSales.filter(s => {
                        const saleDate = new Date(s.createdAt);
                        const thirtyDaysAgo = new Date();
                        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
                        return saleDate >= thirtyDaysAgo;
                      }).length;

                      return (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                          <div className="bg-blue-50 rounded-lg p-4">
                            <div className="flex items-center gap-2 mb-2">
                              <ShoppingCart className="w-5 h-5 text-blue-600" />
                              <span className="text-sm font-medium text-blue-800">Total Sales</span>
                            </div>
                            <div className="text-2xl font-bold text-blue-900">{totalSales}</div>
                          </div>
                          
                          <div className="bg-green-50 rounded-lg p-4">
                            <div className="flex items-center gap-2 mb-2">
                              <DollarSign className="w-5 h-5 text-green-600" />
                              <span className="text-sm font-medium text-green-800">Total Value</span>
                            </div>
                            <div className="text-2xl font-bold text-green-900">${totalValue.toFixed(2)}</div>
                          </div>
                          
                          <div className="bg-purple-50 rounded-lg p-4">
                            <div className="flex items-center gap-2 mb-2">
                              <Package className="w-5 h-5 text-purple-600" />
                              <span className="text-sm font-medium text-purple-800">Avg Sale</span>
                            </div>
                            <div className="text-2xl font-bold text-purple-900">${avgSaleValue.toFixed(2)}</div>
                          </div>
                          
                          <div className="bg-orange-50 rounded-lg p-4">
                            <div className="flex items-center gap-2 mb-2">
                              <Calendar className="w-5 h-5 text-orange-600" />
                              <span className="text-sm font-medium text-orange-800">Last 30 Days</span>
                            </div>
                            <div className="text-2xl font-bold text-orange-900">{recentSales}</div>
                          </div>
                        </div>
                      );
                    })()}
                  </div>

                  {/* Recent Sales */}
                  <div className="mb-6">
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                      Recent Sales
                    </h4>
                    {(() => {
                      const customerSales = sales.filter(s => s.customerId === id);
                      const recentSales = customerSales
                        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                        .slice(0, 5);

                      if (recentSales.length === 0) {
                        return (
                          <div className="text-center py-8">
                            <ShoppingCart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                            <p className="text-gray-500">No sales history found</p>
                          </div>
                        );
                      }

                      return (
                        <div className="space-y-3">
                          {recentSales.map((sale) => (
                            <div key={sale.id} className="bg-gray-50 rounded-lg">
                              {/* Sale Header */}
                              <div className="flex items-center justify-between p-4">
                                <div className="flex items-center gap-3">
                                  <div className="p-2 bg-blue-50 rounded-lg">
                                    <ShoppingCart className="w-5 h-5 text-blue-600" />
                                  </div>
                                  <div>
                                    <p className="font-medium text-gray-900">
                                      {sale.orderNumber || `Sale-${sale.id.slice(0, 8)}`}
                                    </p>
                                    <p className="text-sm text-gray-600">
                                      {formatDate(sale.createdAt)}
                                    </p>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <p className="font-semibold text-gray-900">
                                    ${(sale.totalAmount || sale.totalPrice || 0).toFixed(2)}
                                  </p>
                                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${
                                    sale.status === 'completed' 
                                      ? 'bg-green-100 text-green-800' 
                                      : sale.status === 'pending' 
                                      ? 'bg-yellow-100 text-yellow-800' 
                                      : 'bg-gray-100 text-gray-800'
                                  }`}>
                                    {sale.status === 'completed' ? 'Completed' : 
                                     sale.status === 'pending' ? 'Pending' : 
                                     'Processing'}
                                  </span>
                                </div>
                              </div>
                              
                              {/* Product Details */}
                              {sale.productSales && sale.productSales.length > 0 && (
                                <div className="px-4 pb-4">
                                  <div className="border-t border-gray-200 pt-3">
                                    <h5 className="text-sm font-medium text-gray-700 mb-2">Products Purchased:</h5>
                                    <div className="space-y-2">
                                      {sale.productSales.map((productSale, index) => (
                                        <div key={index} className="flex items-center justify-between text-sm bg-white rounded-md p-2 border">
                                          <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 bg-gray-100 rounded flex items-center justify-center">
                                              <Package className="w-4 h-4 text-gray-600" />
                                            </div>
                                            <div>
                                              <p className="font-medium text-gray-900">
                                                {productSale.product?.name || 'Unknown Product'}
                                              </p>
                                              {productSale.product?.sku && (
                                                <p className="text-xs text-gray-500">SKU: {productSale.product.sku}</p>
                                              )}
                                            </div>
                                          </div>
                                          <div className="text-right">
                                            <p className="font-medium text-gray-900">
                                              {productSale.sale_quantity}x ${productSale.sale_price?.toFixed(2) || '0.00'}
                                            </p>
                                            <p className="text-xs text-gray-500">
                                              = ${(productSale.sale_quantity * productSale.sale_price)?.toFixed(2) || '0.00'}
                                            </p>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      );
                    })()}
                  </div>

                  {/* Timeline Information */}
                  <div className="pt-6 border-t border-gray-200">
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                      Timeline Information
                    </h4>
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">
                        Member Since
                      </label>
                      <div className="text-base font-semibold text-gray-900 dark:text-white">
                        {formatDate(selectedCustomer.created_at || selectedCustomer.createdAt)}
                      </div>
                    </div>
                    </div>
                  </div>
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
              Delete Customer
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6 text-center">
              Are you sure you want to delete "{selectedCustomer.name}"? This action cannot be undone.
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

export default CustomerDetail;
