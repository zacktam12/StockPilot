import React, { useState, useRef, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Settings2,
  X,
  Phone,
  MapPin,
  Mail,
  Building,
  Save,
  Check,
  Search,
  ChevronDown,
} from "lucide-react";
import Button from "../../../components/shared/Button";
import Input from "../../../components/shared/Input";
import Badge from "../../../components/shared/Badge";
import {
  setFilterOptions,
  clearFilters,
} from "../../../store/slices/supplierSlice";
import { useOutsideClick } from "../../../hooks/useOutsideClick";

const SuppliersFilters = () => {
  const dispatch = useDispatch();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [localFilters, setLocalFilters] = useState({});
  const filterRef = useRef(null);

  const {
    hasPhone,
    hasAddress,
    hasEmail,
    hasCompany,
  } = useSelector((state) => state.supplier.filters?.options || {});

  // Initialize local filters with current Redux state
  useEffect(() => {
    setLocalFilters({
      hasPhone,
      hasAddress,
      hasEmail,
      hasCompany,
    });
  }, [hasPhone, hasAddress, hasEmail, hasCompany]);

  // Add outside click functionality
  useOutsideClick(filterRef, () => {
    if (isExpanded) {
      setIsExpanded(false);
    }
  });

  // Calculate active filter count
  const getActiveFilterCount = () => {
    let count = 0;
    if (localFilters.hasPhone) count++;
    if (localFilters.hasAddress) count++;
    if (localFilters.hasEmail) count++;
    if (localFilters.hasCompany) count++;
    return count;
  };

  const activeFilterCount = getActiveFilterCount();

  const handleLocalFilterChange = (key, value) => {
    setLocalFilters((prev) => ({
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
      hasPhone: false,
      hasAddress: false,
      hasEmail: false,
      hasCompany: false,
    });
    dispatch(clearFilters());
  };

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
              {/* Quick Filters */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Quick Filters
                </h4>
                <div className="space-y-3">
                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={localFilters.hasPhone || false}
                      onChange={(e) => handleLocalFilterChange("hasPhone", e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <Phone size={16} className="text-gray-500" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      With Phone Contact
                    </span>
                  </label>

                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={localFilters.hasEmail || false}
                      onChange={(e) => handleLocalFilterChange("hasEmail", e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <Mail size={16} className="text-gray-500" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      With Email Contact
                    </span>
                  </label>

                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={localFilters.hasAddress || false}
                      onChange={(e) => handleLocalFilterChange("hasAddress", e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <MapPin size={16} className="text-gray-500" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      With Physical Address
                    </span>
                  </label>

                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={localFilters.hasCompany || false}
                      onChange={(e) => handleLocalFilterChange("hasCompany", e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <Building size={16} className="text-gray-500" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      Company Suppliers
                    </span>
                  </label>
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

export default SuppliersFilters;
