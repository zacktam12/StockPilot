import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import jsPDF from 'jspdf';
import {
  ArrowLeft,
  ArrowUp,
  Edit,
  Trash2,
  Truck,
  Mail,
  Phone,
  MapPin,
  Building,
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
} from "lucide-react";
import { fetchSupplierById, updateSupplier, deleteSupplier } from "../../../store/slices/supplierSlice";
import { fetchPurchases } from "../../../store/slices/purchaseSlice";
import { showToast } from "../../../store/slices/uiSlice";
import Button from "../../../components/shared/Button";
import Input from "../../../components/shared/Input";

const SupplierDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { selectedSupplier, loading, error } = useSelector((state) => state.supplier);
  const { items: purchases = [] } = useSelector((state) => state.purchases);

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    if (id && id !== 'undefined' && id !== 'null' && id !== '' && id !== 'NaN') {
      dispatch(fetchSupplierById(id));
      // Fetch purchases for this supplier
      dispatch(fetchPurchases({ supplierId: id, limit: 100 }));
    } else {
      // If no valid ID, redirect to suppliers list
      navigate('/suppliers');
    }
  }, [dispatch, id, navigate]);

  const updateFormDataFromSupplier = useCallback((supplier) => {
    setFormData({
      name: supplier.name || "",
      contactName: supplier.contactName || "",
      companyName: supplier.companyName || "",
      email: supplier.email || "",
      phone: supplier.phone || "",
      address: supplier.address || "",
    });
  }, []);

  useEffect(() => {
    if (selectedSupplier) {
      updateFormDataFromSupplier(selectedSupplier);
    }
  }, [selectedSupplier, updateFormDataFromSupplier]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: undefined }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name?.trim()) newErrors.name = "Supplier name is required";
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
      const supplierData = {
        name: formData.name.trim(),
        contactName: formData.contactName.trim() || null,
        companyName: formData.companyName.trim() || null,
        email: formData.email.trim() || null,
        phone: formData.phone.trim() || null,
        address: formData.address.trim() || null,
      };

      // Remove null/undefined values
      Object.keys(supplierData).forEach(key => {
        if (supplierData[key] === null || supplierData[key] === undefined || supplierData[key] === '') {
          delete supplierData[key];
        }
      });

      const updatedSupplier = await dispatch(updateSupplier({ id, ...supplierData })).unwrap();
      updateFormDataFromSupplier(updatedSupplier);
      dispatch(showToast({ message: "Supplier updated successfully!", type: "success" }));
      setIsEditing(false);
    } catch (err) {
      dispatch(showToast({ message: err.message || "Failed to update supplier", type: "error" }));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    setIsSubmitting(true);
    try {
      await dispatch(deleteSupplier(id));
      navigate("/suppliers");
    } catch (error) {
      console.error("Failed to delete supplier:", error);
    } finally {
      setIsSubmitting(false);
    }
  };


  const handlePrint = () => {
    window.print();
  };

  const handleExport = async () => {
    if (!selectedSupplier) return;
    
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
      yPosition = addText('SUPPLIER PROFILE', 20, yPosition, { fontSize: 20, fontStyle: 'bold' });
      yPosition = addText(`Generated: ${new Date().toLocaleDateString()}`, 20, yPosition);
      yPosition += 10;
      
      // Supplier Information
      yPosition = addText('SUPPLIER INFORMATION', 20, yPosition, { fontSize: 16, fontStyle: 'bold' });
      yPosition = addText(`Name: ${selectedSupplier.name || 'Not provided'}`, 20, yPosition);
      yPosition = addText(`Contact: ${selectedSupplier.contactName || 'Not provided'}`, 20, yPosition);
      yPosition = addText(`Company: ${selectedSupplier.companyName || 'Not provided'}`, 20, yPosition);
      yPosition = addText(`Email: ${selectedSupplier.email || 'Not provided'}`, 20, yPosition);
      yPosition = addText(`Phone: ${selectedSupplier.phone || 'Not provided'}`, 20, yPosition);
      yPosition = addText(`Address: ${selectedSupplier.address || 'Not provided'}`, 20, yPosition);
      yPosition += 10;
      
      // Purchase History
      const supplierPurchases = purchases.filter(p => p.supplierId === id);
      yPosition = addText('PURCHASE HISTORY', 20, yPosition, { fontSize: 16, fontStyle: 'bold' });
      yPosition += 5;
      
      if (supplierPurchases.length > 0) {
        // Table headers
        const tableHeaders = ['PO Number', 'Date', 'Status', 'Total Cost'];
        const colPositions = [20, 60, 100, 140];
        
        // Draw table header background
        pdf.setFillColor(240, 240, 240);
        pdf.rect(20, yPosition - 5, pageWidth - 40, 10, 'F');
        
        // Add table headers
        tableHeaders.forEach((header, index) => {
          addText(header, colPositions[index], yPosition, { fontSize: 10, fontStyle: 'bold' });
        });
        yPosition += 10;
        
        // Add purchase records with product details
        supplierPurchases.slice(0, 20).forEach((purchase) => {
          // Check if we need a new page
          if (yPosition > pageHeight - 50) {
            pdf.addPage();
            yPosition = 20;
          }
          
          // Purchase header
          addText(purchase.poNumber || `PO-${purchase.id.slice(0, 8)}`, colPositions[0], yPosition, { fontSize: 9, fontStyle: 'bold' });
          addText(formatDate(purchase.createdAt), colPositions[1], yPosition, { fontSize: 9 });
          addText(purchase.status || 'Unknown', colPositions[2], yPosition, { fontSize: 9 });
          addText(`$${purchase.totalCost?.toFixed(2) || '0.00'}`, colPositions[3], yPosition, { fontSize: 9 });
          yPosition += 8;
          
          // Product details
          if (purchase.productPurchases && purchase.productPurchases.length > 0) {
            purchase.productPurchases.forEach((productPurchase) => {
              if (yPosition > pageHeight - 30) {
                pdf.addPage();
                yPosition = 20;
              }
              
              const productName = productPurchase.product?.name || 'Unknown Product';
              const quantity = productPurchase.purchase_quantity || 0;
              const price = productPurchase.purchase_price || 0;
              const total = quantity * price;
              
              addText(`  └─ ${productName}`, colPositions[0], yPosition, { fontSize: 8, color: '#666666' });
              addText(`${quantity}x $${price.toFixed(2)}`, colPositions[2], yPosition, { fontSize: 8, color: '#666666' });
              addText(`$${total.toFixed(2)}`, colPositions[3], yPosition, { fontSize: 8, color: '#666666' });
              yPosition += 6;
            });
            yPosition += 4; // Extra space after each purchase
          }
        });
        
        // Summary
        yPosition += 10;
        yPosition = addLine(yPosition);
        const totalPurchases = supplierPurchases.length;
        const totalValue = supplierPurchases.reduce((sum, p) => sum + (p.totalCost || 0), 0);
        yPosition = addText(`Total Purchases: ${totalPurchases}`, 20, yPosition, { fontSize: 12, fontStyle: 'bold' });
        yPosition = addText(`Total Value: $${totalValue.toFixed(2)}`, 20, yPosition, { fontSize: 12, fontStyle: 'bold' });
      } else {
        yPosition = addText('No purchase history found', 20, yPosition);
      }
      
      // Footer
      yPosition = pageHeight - 20;
      addText(`Generated on ${new Date().toLocaleString()}`, 20, yPosition, { fontSize: 8, color: '#666666' });
      
      // Save the PDF
      pdf.save(`supplier-${selectedSupplier.name || selectedSupplier.id}.pdf`);
      
      dispatch(showToast({
        type: 'success',
        message: 'Supplier details exported successfully'
      }));
    } catch (error) {
      dispatch(showToast({
        type: 'error',
        message: 'Failed to export supplier details'
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
  if (loading && !selectedSupplier) {
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
  if (error || (!selectedSupplier && !loading)) {
    const errorMessage = error || 'Supplier not found';
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
                onClick={() => navigate("/suppliers")}
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
                  {isInvalidId ? 'Invalid Supplier ID' : 'Error Loading Supplier'}
                </h1>
                <p className="text-sm font-medium text-gray-600">
                  {isInvalidId ? 'The supplier ID is invalid or malformed' : 'Unable to load supplier details'}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 rounded-lg p-8 text-center">
            <p className="text-sm font-medium text-gray-600">
              {isInvalidId 
                ? `The supplier ID "${id}" you're trying to access is invalid. Please check the URL or go back to the suppliers list.`
                : `There was an error loading the supplier: ${errorMessage}`
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
                  Selected Supplier: {JSON.stringify(selectedSupplier ? 'exists' : 'null')}
                </p>
              </div>
            )}
            <div className="flex gap-3 mt-4 justify-center">
              <button
                onClick={() => navigate("/suppliers")}
                className="h-11 px-4 py-3 rounded-lg bg-blue-600 text-white"
              >
                Go Back
              </button>
              {!isInvalidId && (
                <button
                  onClick={() => {
                    if (id && id !== 'undefined' && id !== 'null') {
                      dispatch(fetchSupplierById(id));
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

  if (!selectedSupplier) {
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
              onClick={() => navigate("/suppliers")}
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
                {selectedSupplier.name}
              </h1>
              <p className="text-sm font-medium text-gray-600">
                View and manage supplier information
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
          {/* Left Column - Supplier Information */}
          <div>
            <div 
              className="bg-white dark:bg-gray-800 rounded-lg h-fit"
              style={{ border: '2px solid rgba(229, 231, 235, 0.7)' }}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: 'none' }}>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white m-0">
                  Supplier Information
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
                        Supplier Name *
                      </label>
                      <input
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="Supplier Name..."
                        className="w-full h-11 px-3 py-2 text-base border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:border-gray-400 dark:hover:border-gray-500 focus:border-gray-400 dark:focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-400 dark:focus:ring-gray-500"
                      />
                      {errors.name && (
                        <p className="text-red-500 text-sm mt-1">{errors.name}</p>
                      )}
                    </div>

                    <div className="ml-2 mr-2">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Contact Name
                      </label>
                      <input
                        name="contactName"
                        value={formData.contactName}
                        onChange={handleInputChange}
                        placeholder="Contact Name..."
                        className="w-full h-11 px-3 py-2 text-base border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:border-gray-400 dark:hover:border-gray-500 focus:border-gray-400 dark:focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-400 dark:focus:ring-gray-500"
                      />
                    </div>

                    <div className="ml-2 mr-2">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Company Name
                      </label>
                      <input
                        name="companyName"
                        value={formData.companyName}
                        onChange={handleInputChange}
                        placeholder="Company Name..."
                        className="w-full h-11 px-3 py-2 text-base border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:border-gray-400 dark:hover:border-gray-500 focus:border-gray-400 dark:focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-400 dark:focus:ring-gray-500"
                      />
                    </div>

                    <div className="ml-2 mr-2">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Email Address
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
                  <div className="space-y-4">

                    {/* Supplier Name */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Building className="w-4 h-4 text-gray-500" />
                        <span className="text-xs font-normal text-gray-500">Supplier Name</span>
                      </div>
                      <div>
                        <span className="text-base font-semibold text-gray-900">
                            {formData.name || selectedSupplier.name || ""}
                          </span>
                        </div>
                      </div>

                    {/* Contact Name */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-gray-500" />
                        <span className="text-xs font-normal text-gray-500">Contact Name</span>
                      </div>
                      <div>
                        <span className="text-base font-semibold text-gray-900">
                            {formData.contactName || selectedSupplier.contactName || "Not provided"}
                          </span>
                        </div>
                      </div>

                    {/* Company Name */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Building className="w-4 h-4 text-gray-500" />
                        <span className="text-xs font-normal text-gray-500">Company</span>
                      </div>
                      <div>
                        <span className="text-base font-semibold text-gray-900">
                            {formData.companyName || selectedSupplier.companyName || "Not provided"}
                          </span>
                        </div>
                      </div>

                    {/* Email */}
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <Mail className="w-4 h-4 text-gray-500" />
                        <span className="text-xs font-normal text-gray-500">Email</span>
                      </div>
                      <div className="text-right min-w-0 flex-1">
                        <span className="text-base font-semibold text-gray-900 break-words">
                            {formData.email || selectedSupplier.email || "Not provided"}
                          </span>
                        </div>
                      </div>

                    {/* Phone */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-gray-500" />
                        <span className="text-xs font-normal text-gray-500">Phone</span>
                      </div>
                      <div>
                        <span className="text-base font-semibold text-gray-900">
                            {formData.phone || selectedSupplier.phone || "Not provided"}
                          </span>
                        </div>
                      </div>

                    {/* Address */}
                    {formData.address || selectedSupplier.address ? (
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-gray-500" />
                          <span className="text-xs font-normal text-gray-500">Address</span>
                        </div>
                        <div className="text-right">
                          <span className="text-base font-semibold text-gray-900">
                            {formData.address || selectedSupplier.address}
                          </span>
                        </div>
                      </div>
                    ) : null}
                  </div>
                )}
              </div>
              
              {/* Remove Supplier Button - Inside Card (only show when not editing) */}
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
                      <span>Remove Supplier</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Purchase History & Statistics */}
          <div className="lg:col-span-2" style={{ marginRight: '0px' }}>
            <div 
              className="bg-white dark:bg-gray-800 rounded-lg h-fit"
              style={{ border: '2px solid rgba(229, 231, 235, 0.7)' }}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: 'none' }}>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white m-0">
                  Purchase History & Statistics
                </h3>
              </div>
              
              {/* Body */}
              <div className="px-6 pb-12" style={{ paddingTop: '4px' }}>
                <div className="ml-2 mr-2" style={{ paddingTop: '24px' }}>
                  {/* Purchase Statistics */}
                  <div className="mb-6">
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                      Purchase Statistics
                    </h4>
                    {(() => {
                      const supplierPurchases = purchases.filter(p => p.supplierId === id);
                      const totalPurchases = supplierPurchases.length;
                      const totalValue = supplierPurchases.reduce((sum, p) => sum + (p.totalCost || 0), 0);
                      const avgPurchaseValue = totalPurchases > 0 ? totalValue / totalPurchases : 0;
                      const recentPurchases = supplierPurchases.filter(p => {
                        const purchaseDate = new Date(p.createdAt);
                        const thirtyDaysAgo = new Date();
                        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
                        return purchaseDate >= thirtyDaysAgo;
                      }).length;

                      return (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                          <div className="bg-blue-50 rounded-lg p-4">
                            <div className="flex items-center gap-2 mb-2">
                              <ShoppingCart className="w-5 h-5 text-blue-600" />
                              <span className="text-sm font-medium text-blue-800">Total Purchases</span>
                            </div>
                            <div className="text-2xl font-bold text-blue-900">{totalPurchases}</div>
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
                              <span className="text-sm font-medium text-purple-800">Avg Purchase</span>
                            </div>
                            <div className="text-2xl font-bold text-purple-900">${avgPurchaseValue.toFixed(2)}</div>
                          </div>
                          
                          <div className="bg-orange-50 rounded-lg p-4">
                            <div className="flex items-center gap-2 mb-2">
                              <Calendar className="w-5 h-5 text-orange-600" />
                              <span className="text-sm font-medium text-orange-800">Last 30 Days</span>
                            </div>
                            <div className="text-2xl font-bold text-orange-900">{recentPurchases}</div>
                          </div>
                        </div>
                      );
                    })()}
                  </div>

                  {/* Recent Purchases */}
                  <div className="mb-6">
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                      Recent Purchases
                    </h4>
                    {(() => {
                      const supplierPurchases = purchases.filter(p => p.supplierId === id);
                      const recentPurchases = supplierPurchases
                        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                        .slice(0, 5);

                      if (recentPurchases.length === 0) {
                        return (
                          <div className="text-center py-8">
                            <ShoppingCart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                            <p className="text-gray-500">No purchase history found</p>
                          </div>
                        );
                      }

                      return (
                        <div className="space-y-3">
                          {recentPurchases.map((purchase) => (
                            <div key={purchase.id} className="bg-gray-50 rounded-lg">
                              {/* Purchase Header */}
                              <div className="flex items-center justify-between p-4">
                                <div className="flex items-center gap-3">
                                  <div className="p-2 bg-blue-50 rounded-lg">
                                    <ShoppingCart className="w-5 h-5 text-blue-600" />
                                  </div>
                                  <div>
                                    <p className="font-medium text-gray-900">
                                      {purchase.poNumber || `PO-${purchase.id.slice(0, 8)}`}
                                    </p>
                                    <p className="text-sm text-gray-600">
                                      {formatDate(purchase.createdAt)}
                                    </p>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <p className="font-semibold text-gray-900">
                                    ${purchase.totalCost?.toFixed(2) || '0.00'}
                                  </p>
                                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${
                                    purchase.status === 'received' 
                                      ? 'bg-green-100 text-green-800' 
                                      : purchase.status === 'pending' 
                                      ? 'bg-yellow-100 text-yellow-800' 
                                      : 'bg-red-100 text-red-800'
                                  }`}>
                                    {purchase.status === 'received' ? 'Received' : 
                                     purchase.status === 'pending' ? 'Pending' : 
                                     'Cancelled'}
                                  </span>
                                </div>
                              </div>
                              
                              {/* Product Details */}
                              {purchase.productPurchases && purchase.productPurchases.length > 0 && (
                                <div className="px-4 pb-4">
                                  <div className="border-t border-gray-200 pt-3">
                                    <h5 className="text-sm font-medium text-gray-700 mb-2">Products Purchased:</h5>
                                    <div className="space-y-2">
                                      {purchase.productPurchases.map((productPurchase, index) => (
                                        <div key={index} className="flex items-center justify-between text-sm bg-white rounded-md p-2 border">
                                          <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 bg-gray-100 rounded flex items-center justify-center">
                                              <Package className="w-4 h-4 text-gray-600" />
                                            </div>
                                            <div>
                                              <p className="font-medium text-gray-900">
                                                {productPurchase.product?.name || 'Unknown Product'}
                                              </p>
                                              {productPurchase.product?.sku && (
                                                <p className="text-xs text-gray-500">SKU: {productPurchase.product.sku}</p>
                                              )}
                                            </div>
                                          </div>
                                          <div className="text-right">
                                            <p className="font-medium text-gray-900">
                                              {productPurchase.purchase_quantity}x ${productPurchase.purchase_price?.toFixed(2) || '0.00'}
                                            </p>
                                            <p className="text-xs text-gray-500">
                                              = ${(productPurchase.purchase_quantity * productPurchase.purchase_price)?.toFixed(2) || '0.00'}
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
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-normal text-gray-500 mb-1">
                        Created
                      </label>
                      <div className="text-base font-bold text-gray-900 dark:text-white">
                        {formatDate(selectedSupplier.created_at || selectedSupplier.createdAt)}
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-xs font-normal text-gray-500 mb-1">
                        Last Updated
                      </label>
                      <div className="text-base font-bold text-gray-900 dark:text-white">
                        {formatDate(selectedSupplier.updated_at || selectedSupplier.updatedAt)}
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
              Delete Supplier
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6 text-center">
              Are you sure you want to delete "{selectedSupplier.name}"? This action cannot be undone.
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

export default SupplierDetail;
