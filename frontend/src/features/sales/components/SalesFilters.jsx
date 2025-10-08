import React, { useState, useRef, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Settings2,
  X,
  DollarSign,
  ShoppingCart,
  AlertTriangle,
  Save,
  Check,
  Search,
  ChevronDown,
  Calendar,
  User,
} from "lucide-react";
import Button from "../../../components/shared/Button";
import Input from "../../../components/shared/Input";
import Badge from "../../../components/shared/Badge";
import {
  setFilterOptions,
  clearFilters,
  fetchCustomers,
} from "../../../store/slices/salesSlice";
import { useOutsideClick } from "../../../hooks/useOutsideClick";

const SalesFilters = () => {
  const dispatch = useDispatch();
  const { customers = [] } = useSelector((state) => state.sales || {});
  const [isExpanded, setIsExpanded] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [localFilters, setLocalFilters] = useState({});
  const [isCustomerOpen, setIsCustomerOpen] = useState(false);
  const [customerSearch, setCustomerSearch] = useState("");
  const [isStatusOpen, setIsStatusOpen] = useState(false);
  const [statusSearch, setStatusSearch] = useState("");
  const [isDateRangeOpen, setIsDateRangeOpen] = useState(false);
  const filterRef = useRef(null);
  const customerRef = useRef(null);
  const statusRef = useRef(null);
  const dateRangeRef = useRef(null);

  const {
    customerId,
    status,
    totalPriceRange,
    dateRange,
    paymentMethod,
  } = useSelector((state) => state.sales.filters || {});

  // Fetch customers on component mount
  useEffect(() => {
    dispatch(fetchCustomers());
  }, [dispatch]);

  // Initialize local filters with current Redux state
  useEffect(() => {
    setLocalFilters({
      customerId,
      status,
      totalPriceRange,
      dateRange,
      paymentMethod,
    });
  }, [
    customerId,
    status,
    totalPriceRange,
    dateRange,
    paymentMethod,
  ]);

  // Add outside click functionality
  useOutsideClick(filterRef, () => {
    if (isExpanded) {
      setIsExpanded(false);
    }
  });

  useOutsideClick(customerRef, () => {
    setIsCustomerOpen(false);
    setCustomerSearch("");
  });

  useOutsideClick(statusRef, () => {
    setIsStatusOpen(false);
    setStatusSearch("");
  });

  useOutsideClick(dateRangeRef, () => {
    setIsDateRangeOpen(false);
  });

  const statusOptions = [
    { value: "", label: "All Status" },
    { value: "pending", label: "Pending" },
    { value: "completed", label: "Completed" },
    { value: "cancelled", label: "Cancelled" },
  ];

  const paymentMethodOptions = [
    { value: "", label: "All Payment Methods" },
    { value: "cash", label: "Cash" },
    { value: "card", label: "Card" },
    { value: "bank_transfer", label: "Bank Transfer" },
    { value: "check", label: "Check" },
  ];

  // Filter customers based on search - ensure customers is an array
  const filteredCustomers = Array.isArray(customers)
    ? customers.filter(customer =>
        customer.name?.toLowerCase().includes(customerSearch.toLowerCase()) ||
        customer.email?.toLowerCase().includes(customerSearch.toLowerCase())
      )
    : [];

  // Filter status options based on search
  const filteredStatusOptions = Array.isArray(statusOptions)
    ? statusOptions.filter(option =>
        option.label.toLowerCase().includes(statusSearch.toLowerCase())
      )
    : [];

  // Calculate active filter count
  const getActiveFilterCount = () => {
    let count = 0;
    if (localFilters.customerId) count++;
    if (localFilters.status) count++;
    if (localFilters.totalPriceRange?.min || localFilters.totalPriceRange?.max) count++;
    if (localFilters.dateRange?.start || localFilters.dateRange?.end) count++;
    if (localFilters.paymentMethod) count++;
    return count;
  };

  const activeFilterCount = getActiveFilterCount();

  const handleFilterChange = (key, value) => {
    setLocalFilters(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSaveFilters = async () => {
    setIsSaving(true);
    try {
      // Apply all local filters to Redux state
      Object.entries(localFilters).forEach(([key, value]) => {
        dispatch(setFilterOptions({ [key]: value }));
      });

      // Close the overlay after saving
      setTimeout(() => {
        setIsExpanded(false);
        setIsSaving(false);
      }, 500);
    } catch (error) {
      console.error("Error saving filters:", error);
      setIsSaving(false);
    }
  };

  const handleClearFilters = () => {
    setLocalFilters({
      customerId: null,
      status: null,
      totalPriceRange: { min: null, max: null },
      dateRange: { start: null, end: null },
      paymentMethod: null,
    });
    dispatch(clearFilters());
  };

  const selectedCustomer = Array.isArray(customers)
    ? customers.find(c => c.id === localFilters.customerId)
    : null;
  const selectedStatus = statusOptions.find(s => s.value === localFilters.status);
  const selectedPaymentMethod = paymentMethodOptions.find(p => p.value === localFilters.paymentMethod);

  return (
    <div className="relative" ref={filterRef}>
      {/* Filter Button */}
      <div className="relative">
        <Button
          variant="outline"
          size="md"
          onClick={() => setIsExpanded(!isExpanded)}
          icon={<Settings2 size={16} />}
          className="w-full px-4 py-3 rounded-lg border-blue-300 !text-blue-600 hover:bg-blue-50 hover:border-blue-400 hover:!text-blue-700 transition-colors"
        >
          Filters
        </Button>
        {activeFilterCount > 0 && (
          <Badge variant="primary" className="absolute -top-2 -right-2 text-xs min-w-[20px] h-5 flex items-center justify-center">
            {activeFilterCount}
          </Badge>
        )}
      </div>

      {/* Filter Overlay */}
      {isExpanded && (
        <>
          {/* Background Overlay */}
          <div className="fixed inset-0 bg-black/30 z-[9998]" onClick={() => setIsExpanded(false)} />
          
          {/* Filter Dropdown */}
          <div className="absolute top-full right-0 sm:right-0 left-0 sm:left-auto mt-2 w-80 sm:w-80 max-w-[calc(100vw-2rem)] bg-white/95 dark:bg-gray-800/95 backdrop-blur-lg rounded-lg border border-gray-200 dark:border-gray-700 shadow-xl z-[9999]">
          {/* Filter Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2">
              <Settings2 size={18} className="text-gray-600 dark:text-gray-400" />
              <span className="font-medium text-gray-900 dark:text-white">
                Filters
              </span>
              {activeFilterCount > 0 && (
                <Badge variant="primary" className="ml-2">
                  {activeFilterCount}
                </Badge>
              )}
            </div>

            <div className="flex items-center gap-2">
              {activeFilterCount > 0 && (
                  <button
                    type="button"
                    onClick={handleClearFilters}
                    className="px-4 py-3 rounded-lg border border-blue-300 !text-blue-600 hover:bg-blue-50 hover:border-blue-400 hover:!text-blue-700 transition-colors flex items-center gap-2 text-sm"
                  >
                    <X size={16} />
                    Remove All
                  </button>
              )}
            </div>
          </div>

          {/* Filter Content */}
          <div className="p-4 space-y-4 max-h-96 overflow-y-auto">
            {/* Customer Filter */}
            <div className="relative" ref={customerRef}>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Customer
              </label>
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Select customer..."
                  value={customerSearch || (localFilters.customerId && Array.isArray(customers) ? customers.find(c => c.id === localFilters.customerId)?.name || "" : "")}
                  onChange={(e) => {
                    setCustomerSearch(e.target.value);
                    setIsCustomerOpen(true);
                    // Clear selection if user types something different
                    if (localFilters.customerId && Array.isArray(customers) && e.target.value !== customers.find(c => c.id === localFilters.customerId)?.name) {
                      handleFilterChange("customerId", "");
                    }
                  }}
                  onFocus={() => {
                    if (isCustomerOpen) {
                      setIsCustomerOpen(false);
                    } else {
                      setIsCustomerOpen(true);
                      setCustomerSearch("");
                    }
                  }}
                  className="w-full pl-12 pr-12 py-3 text-sm border border-gray-300 bg-white text-gray-800 rounded-lg shadow-sm transition duration-150 ease-in-out hover:border-gray-600 focus:outline-none focus:ring-0 focus:border-gray-300"
                />
                <ChevronDown size={16} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              </div>
              
              {isCustomerOpen && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                  <button
                    type="button"
                    onClick={() => {
                      handleFilterChange("customerId", "");
                      setCustomerSearch("");
                      setIsCustomerOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    All Customers
                  </button>
                  {filteredCustomers.map((customer) => (
                    <button
                      key={customer.id}
                      type="button"
                      onClick={() => {
                        handleFilterChange("customerId", customer.id);
                        setCustomerSearch(customer.name);
                        setIsCustomerOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      {customer.name}
                    </button>
                  ))}
                  {filteredCustomers.length === 0 && customerSearch && (
                    <div className="px-4 py-2 text-sm text-gray-500">
                      No customers found
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Status Filter */}
            <div className="relative" ref={statusRef}>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Select status..."
                  value={statusSearch || (localFilters.status ? statusOptions?.find(opt => opt.value === localFilters.status)?.label || "" : "")}
                  onChange={(e) => {
                    setStatusSearch(e.target.value);
                    setIsStatusOpen(true);
                    // Clear selection if user types something different
                    if (localFilters.status && e.target.value !== statusOptions?.find(opt => opt.value === localFilters.status)?.label) {
                      handleFilterChange("status", "");
                    }
                  }}
                  onFocus={() => {
                    if (isStatusOpen) {
                      setIsStatusOpen(false);
                    } else {
                      setIsStatusOpen(true);
                      setStatusSearch("");
                    }
                  }}
                  className="w-full pl-12 pr-12 py-3 text-sm border border-gray-300 bg-white text-gray-800 rounded-lg shadow-sm transition duration-150 ease-in-out hover:border-gray-600 focus:outline-none focus:ring-0 focus:border-gray-300"
                />
                <ChevronDown size={16} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              </div>
              
              {isStatusOpen && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                  {filteredStatusOptions.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => {
                        handleFilterChange("status", option.value);
                        setStatusSearch(option.label);
                        setIsStatusOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      {option.label}
                    </button>
                  ))}
                  {filteredStatusOptions.length === 0 && statusSearch && (
                    <div className="px-4 py-2 text-sm text-gray-500">
                      No status found
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Payment Method Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Payment Method
              </label>
              <select
                value={localFilters.paymentMethod || ""}
                onChange={(e) => handleFilterChange("paymentMethod", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                {paymentMethodOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Total Price Range Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Total Price Range
              </label>
              <div className="grid grid-cols-2 gap-2">
                <div className="relative">
                  <DollarSign size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="number"
                    placeholder="Min Price"
                    value={localFilters.totalPriceRange?.min || ""}
                    onChange={(e) =>
                      handleFilterChange("totalPriceRange", {
                        ...localFilters.totalPriceRange,
                        min: e.target.value ? parseFloat(e.target.value) : null,
                      })
                    }
                    className="w-full pl-8 pr-4 py-3 text-sm border border-gray-300 bg-white text-gray-800 rounded-lg shadow-sm transition duration-150 ease-in-out hover:border-gray-600 focus:outline-none focus:ring-0 focus:border-gray-300"
                  />
                </div>
                <div className="relative">
                  <DollarSign size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="number"
                    placeholder="Max Price"
                    value={localFilters.totalPriceRange?.max || ""}
                    onChange={(e) =>
                      handleFilterChange("totalPriceRange", {
                        ...localFilters.totalPriceRange,
                        max: e.target.value ? parseFloat(e.target.value) : null,
                      })
                    }
                    className="w-full pl-8 pr-4 py-3 text-sm border border-gray-300 bg-white text-gray-800 rounded-lg shadow-sm transition duration-150 ease-in-out hover:border-gray-600 focus:outline-none focus:ring-0 focus:border-gray-300"
                  />
                </div>
              </div>
            </div>

            {/* Date Range Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Date Range
              </label>
              <div className="grid grid-cols-2 gap-2">
                <div className="relative">
                  <Calendar size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="date"
                    placeholder="Start Date"
                    value={localFilters.dateRange?.start || ""}
                    onChange={(e) => handleFilterChange("dateRange", {
                      ...localFilters.dateRange,
                      start: e.target.value
                    })}
                    className="w-full pl-8 pr-4 py-3 text-sm border border-gray-300 bg-white text-gray-800 rounded-lg shadow-sm transition duration-150 ease-in-out hover:border-gray-600 focus:outline-none focus:ring-0 focus:border-gray-300"
                  />
                </div>
                <div className="relative">
                  <Calendar size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="date"
                    placeholder="End Date"
                    value={localFilters.dateRange?.end || ""}
                    onChange={(e) => handleFilterChange("dateRange", {
                      ...localFilters.dateRange,
                      end: e.target.value
                    })}
                    className="w-full pl-8 pr-4 py-3 text-sm border border-gray-300 bg-white text-gray-800 rounded-lg shadow-sm transition duration-150 ease-in-out hover:border-gray-600 focus:outline-none focus:ring-0 focus:border-gray-300"
                  />
                </div>
              </div>
            </div>
            </div>

          {/* Action Buttons */}
          <div className="flex justify-center gap-4 p-4 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={() => setIsExpanded(false)}
              disabled={isSaving}
              className="px-4 py-3 rounded-lg border border-blue-300 !text-blue-600 hover:bg-blue-50 hover:border-blue-400 hover:!text-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed bg-white"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSaveFilters}
              disabled={isSaving}
              className="px-4 py-3 rounded-lg flex items-center justify-center focus:outline-none focus:ring-0 focus:shadow-none active:shadow-none disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                backgroundColor: isSaving ? '#9ca3af' : '#3b82f6',
                borderColor: isSaving ? '#9ca3af' : '#3b82f6',
                color: '#ffffff',
                transition: 'background-color 0.2s ease',
                transform: 'none',
                boxShadow: 'none',
              }}
              onMouseEnter={(e) => {
                if (!isSaving) {
                  e.currentTarget.style.backgroundColor = '#2563eb';
                  e.currentTarget.style.borderColor = '#2563eb';
                }
              }}
              onMouseLeave={(e) => {
                if (!isSaving) {
                  e.currentTarget.style.backgroundColor = '#3b82f6';
                  e.currentTarget.style.borderColor = '#3b82f6';
                }
              }}
            >
              {isSaving ? "Saving..." : "Apply Filters"}
            </button>
          </div>
          </div>
        </>
      )}
    </div>
  );
};

export default SalesFilters;
