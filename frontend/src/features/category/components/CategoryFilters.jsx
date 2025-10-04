import React, { useState, useRef, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Settings2,
  X,
  Save,
  Check,
} from "lucide-react";
import Button from "../../../components/shared/Button";
import Badge from "../../../components/shared/Badge";
import {
  setFilterOptions,
  toggleDescriptionFilter,
  setDateRangeFilter,
  clearDateRangeFilter,
} from "../../../store/slices/categorySlice";
import { useOutsideClick } from "../../../hooks/useOutsideClick";

const CategoryFilters = () => {
  const dispatch = useDispatch();
  const { filters } = useSelector((state) => state.category);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [localFilters, setLocalFilters] = useState({});
  const filterRef = useRef(null);

  const {
    hasDescription,
  } = filters?.options || {};
  
  const { dateRange } = filters || {};

  // Initialize local filters with current Redux state
  useEffect(() => {
    setLocalFilters({
      hasDescription: hasDescription || false,
      dateRange: {
        from: dateRange?.from || "",
        to: dateRange?.to || "",
      },
    });
  }, [hasDescription, dateRange]);

  // Add outside click functionality
  useOutsideClick(filterRef, () => {
    if (isExpanded) {
      setIsExpanded(false);
    }
  });

  // Calculate active filter count
  const getActiveFilterCount = () => {
    let count = 0;
    if (localFilters.hasDescription) count++;
    if (localFilters.dateRange?.from || localFilters.dateRange?.to) count++;
    return count;
  };

  const activeFilterCount = getActiveFilterCount();

  const handleLocalFilterChange = (key, value) => {
    setLocalFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleDateRangeChange = (field, value) => {
    setLocalFilters((prev) => ({
      ...prev,
      dateRange: {
        ...prev.dateRange,
        [field]: value,
      },
    }));
  };

  const handleSaveFilters = async () => {
    setIsSaving(true);
    try {
      // Apply all local filters to Redux state
      Object.entries(localFilters).forEach(([key, value]) => {
        if (key === 'hasDescription') {
          dispatch(setFilterOptions({ hasDescription: value }));
        } else if (key === 'dateRange') {
          dispatch(setDateRangeFilter(value));
        }
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
      hasDescription: false,
      dateRange: { from: "", to: "" },
    });
    dispatch(setFilterOptions({ hasDescription: false }));
    dispatch(clearDateRangeFilter());
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
          className="px-4 py-3 rounded-lg border-blue-300 !text-blue-600 hover:bg-blue-50 hover:border-blue-400 hover:!text-blue-700 transition-colors"
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
          <div className="absolute top-full right-0 mt-2 w-80 bg-white/95 dark:bg-gray-800/95 backdrop-blur-lg rounded-lg border border-gray-200 dark:border-gray-700 shadow-xl z-[9999]">
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
              {/* Has Description Filter */}
              <div>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={localFilters.hasDescription || false}
                    onChange={(e) => handleLocalFilterChange("hasDescription", e.target.checked)}
                    className="rounded border-gray-300 dark:border-gray-600"
                  />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Has Description
                  </span>
                </label>
              </div>

              {/* Created Date Range Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Created Date Range
                </label>
                <div className="space-y-2">
                  <div>
                    <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                      From Date
                    </label>
                    <input
                      type="date"
                      value={localFilters.dateRange?.from || ""}
                      onChange={(e) => handleDateRangeChange("from", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                      To Date
                    </label>
                    <input
                      type="date"
                      value={localFilters.dateRange?.to || ""}
                      onChange={(e) => handleDateRangeChange("to", e.target.value)}
                      min={localFilters.dateRange?.from || ""}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  {(localFilters.dateRange?.from || localFilters.dateRange?.to) && (
                    <button
                      type="button"
                      onClick={() => {
                        handleDateRangeChange("from", "");
                        handleDateRangeChange("to", "");
                      }}
                      className="text-xs text-red-600 hover:text-red-700 flex items-center gap-1"
                    >
                      <X size={12} />
                      Clear Date Range
                    </button>
                  )}
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

export default CategoryFilters;
