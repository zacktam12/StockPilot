import React, { useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Plus, Download, Upload, Search, FileCog, Users, FileText, AlertCircle } from "lucide-react";
import Button from "../../../components/shared/Button";
import Input from "../../../components/shared/Input";
import CustomerFilters from "./CustomerFilters";
import { openCreateModal, importCustomers } from "../../../store/slices/customerSlice";
import { useOutsideClick } from "../../../hooks/useOutsideClick";
import { parseCSV, validateCSVData, convertCSVToCustomers, REQUIRED_CUSTOMER_CSV_FIELDS } from "../../../utils/csvUtils";
import { showToast } from "../../../store/slices/uiSlice";

const CustomerHeader = ({ onExportCSV, searchTerm, onSearchChange }) => {
  const dispatch = useDispatch();
  const [isActionsOpen, setIsActionsOpen] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const actionsRef = useRef(null);
  const fileInputRef = useRef(null);
  const { items, selectedItems } = useSelector((state) => state.customer);

  // Close dropdown when clicking outside
  useOutsideClick(actionsRef, () => {
    if (isActionsOpen) {
      setIsActionsOpen(false);
    }
  });

  // Handle export with selected items
  const handleExport = () => {
    if (selectedItems && selectedItems.length > 0) {
      // Export only selected items
      const customersToExport = items.filter((customer) => 
        selectedItems.includes(customer.id)
      );
      onExportCSV(customersToExport);
    } else {
      // Export all items
      onExportCSV(items);
    }
    setIsActionsOpen(false);
  };

  // Handle import file selection
  const handleImportClick = () => {
    fileInputRef.current?.click();
    setIsActionsOpen(false);
  };

  // Handle file upload and processing
  const handleFileSelect = async (event) => {
    const selectedFile = event.target.files[0];
    if (!selectedFile) return;

    // Validate file type
    if (!selectedFile.name.endsWith(".csv")) {
      dispatch(showToast({ message: "Please select a valid CSV file", type: "error" }));
      return;
    }

    setIsImporting(true);

    try {
      const text = await selectedFile.text();
      const parsed = parseCSV(text);
      
      // Validate the data
      const errors = validateCSVData(parsed.data, REQUIRED_CUSTOMER_CSV_FIELDS);
      if (errors.length > 0) {
        dispatch(showToast({ 
          message: `CSV validation failed: ${errors.join(", ")}`, 
          type: "error" 
        }));
        return;
      }

      // Convert and import customers
      const customers = convertCSVToCustomers(parsed.data);
      const result = await dispatch(importCustomers(customers)).unwrap();
      
      dispatch(showToast({ 
        message: `Successfully imported ${result.importedCount || customers.length} customers!`, 
        type: "success" 
      }));

    } catch (err) {
      dispatch(showToast({ 
        message: err.message || "Failed to import customers", 
        type: "error" 
      }));
    } finally {
      setIsImporting(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className="flex flex-col gap-4 mb-6">
      {/* Top row with title and create button */}
      <div className="flex flex-row items-center justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-700 rounded-lg flex items-center justify-center">
              <Users size={20} className="text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Customers
            </h1>
          </div>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
            Manage Your Customer Base
          </p>
        </div>
        <div className="flex-shrink-0">
          <Button
            variant="primary"
            size="md"
            icon={<Plus size={18} />}
            onClick={() => dispatch(openCreateModal())}
            className="px-4 py-3 rounded-lg flex items-center justify-center focus:outline-none focus:ring-0 focus:shadow-none active:shadow-none"
            style={{
              backgroundColor: '#3b82f6',
              borderColor: '#3b82f6',
              color: '#ffffff',
              transition: 'background-color 0.2s ease',
              transform: 'none',
              boxShadow: 'none',
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
            Create Customer
          </Button>
        </div>
      </div>

      {/* Bottom row with search and action buttons */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        {/* Search bar */}
        <div className="relative w-96">
          <Input
            placeholder="Search customers..."
            icon={<Search size={18} className="text-gray-400" />}
            value={searchTerm}
            onChange={onSearchChange}
            className="w-full bg-white"
          />
        </div>

        {/* Action buttons */}
        <div className="flex gap-2">
          <CustomerFilters />
          
          {/* Actions Dropdown */}
          <div className="relative" ref={actionsRef}>
            <Button
              variant="outline"
              size="md"
              icon={<FileCog size={16} />}
              onClick={() => setIsActionsOpen(!isActionsOpen)}
              className="px-4 py-3 rounded-lg border-blue-300 !text-blue-600 hover:bg-blue-50 hover:border-blue-400 hover:!text-blue-700 transition-colors"
            >
              Actions
            </Button>

            {/* Actions Dropdown Menu */}
            {isActionsOpen && (
              <>
                {/* Background Overlay */}
                <div className="fixed inset-0 bg-black/30 z-[9998]" onClick={() => setIsActionsOpen(false)} />
                
                {/* Actions Dropdown */}
                <div className="absolute top-full right-0 mt-2 w-80 bg-white/95 dark:bg-gray-800/95 backdrop-blur-lg rounded-lg border border-gray-200 dark:border-gray-700 shadow-xl z-[9999]">
                  {/* Dropdown Header */}
                  <div className="px-6 py-3 border-b border-gray-200">
                    <h3 className="text-lg font-bold text-gray-900">Actions</h3>
                    <p className="text-sm text-gray-600">Customer Actions</p>
                  </div>

                  {/* Dropdown Content */}
                  <div className="p-3 space-y-2 flex flex-col items-center">
                    <button
                      onClick={handleImportClick}
                      disabled={isImporting}
                      className="w-[85%] !px-6 py-3 text-center text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-colors rounded-lg whitespace-nowrap"
                    >
                      {isImporting ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span className="text-sm">Importing...</span>
                        </>
                      ) : (
                        <>
                          <Download size={16} />
                          <span className="text-sm">Import Customers</span>
                        </>
                      )}
                    </button>
                    
                    <button
                      onClick={handleExport}
                      className="w-[85%] !px-6 py-3 text-center text-white bg-blue-600 hover:bg-blue-700 flex items-center justify-center gap-2 transition-colors rounded-lg whitespace-nowrap"
                    >
                      <Upload size={16} />
                      <span className="text-sm">
                        Export Customers ({selectedItems && selectedItems.length > 0 ? selectedItems.length : items?.length || 0})
                      </span>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Hidden file input for CSV import */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".csv"
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  );
};

export default CustomerHeader;
