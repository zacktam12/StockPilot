import React, { useState, useRef } from "react";
import { useDispatch } from "react-redux";
import { Settings2, X, Check, Clock, Calendar } from "lucide-react";
import Button from "../../../components/shared/Button";
import Badge from "../../../components/shared/Badge";
import { setSort } from "../../../store/slices/customerSlice";
import { useOutsideClick } from "../../../hooks/useOutsideClick";

const CustomerFilters = () => {
  const dispatch = useDispatch();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [recentlyAdded, setRecentlyAdded] = useState(false);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const filterRef = useRef(null);

  useOutsideClick(filterRef, () => {
    if (isExpanded) setIsExpanded(false);
  });

  // Calculate active filter count
  const getActiveFilterCount = () => {
    let count = 0;
    if (recentlyAdded) count++;
    if (fromDate || toDate) count++;
    return count;
  };

  const activeFilterCount = getActiveFilterCount();

  const handleApply = async () => {
    setIsSaving(true);
    try {
      if (recentlyAdded) {
        dispatch(setSort({ field: "createdAt", order: "desc" }));
      }
      
      // Close the overlay after saving
      setTimeout(() => {
        setIsExpanded(false);
        setIsSaving(false);
      }, 500);
    } catch (error) {
      console.error("Error applying filters:", error);
      setIsSaving(false);
    }
  };

  const handleClear = () => {
    setRecentlyAdded(false);
    setFromDate("");
    setToDate("");
    dispatch(setSort({ field: "name", order: "asc" }));
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
                      onClick={handleClear}
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
              {/* Created Date Range Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Created Date Range
                </label>
                
                {/* From Date */}
                <div className="mb-3">
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                    From Date
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      value={fromDate}
                      onChange={(e) => setFromDate(e.target.value)}
                      className="w-full pl-3 pr-10 py-3 text-sm border border-gray-300 bg-white text-gray-800 rounded-lg shadow-sm transition duration-150 ease-in-out hover:border-gray-600 focus:outline-none focus:ring-0 focus:border-gray-300"
                    />
                    <Calendar size={16} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
                  </div>
                </div>

                {/* To Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                    To Date
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      value={toDate}
                      onChange={(e) => setToDate(e.target.value)}
                      className="w-full pl-3 pr-10 py-3 text-sm border border-gray-300 bg-white text-gray-800 rounded-lg shadow-sm transition duration-150 ease-in-out hover:border-gray-600 focus:outline-none focus:ring-0 focus:border-gray-300"
                    />
                    <Calendar size={16} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="recentlyAdded"
                  checked={recentlyAdded}
                  onChange={() => setRecentlyAdded((v) => !v)}
                  className="rounded border-gray-300 dark:border-gray-600"
                />
                <label
                  htmlFor="recentlyAdded"
                  className="text-sm text-gray-700 dark:text-gray-300 flex items-center gap-1 cursor-pointer"
                >
                  <Clock size={14} /> Recently Added
                </label>
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
                onClick={handleApply}
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
                {isSaving ? "Applying..." : "Apply Filters"}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default CustomerFilters;
