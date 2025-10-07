import React, { useState, useRef } from "react";
import { createPortal } from "react-dom";
import { 
  Calendar, 
  Filter, 
  X, 
  RotateCcw, 
  ChevronDown,
  Clock,
  Tag,
  TrendingUp,
  Check
} from "lucide-react";
import { format, subDays, startOfMonth, endOfMonth, startOfYear, endOfYear } from "date-fns";
import Button from "../../../components/shared/Button";
import Badge from "../../../components/shared/Badge";

const ReportFilters = ({ filters, onFilterChange, onClose }) => {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const filterRef = useRef(null);


  const quickDateRanges = [
    { label: "Last 7 days", value: { start: format(subDays(new Date(), 7), 'yyyy-MM-dd'), end: format(new Date(), 'yyyy-MM-dd') } },
    { label: "Last 30 days", value: { start: format(subDays(new Date(), 30), 'yyyy-MM-dd'), end: format(new Date(), 'yyyy-MM-dd') } },
    { label: "This month", value: { start: format(startOfMonth(new Date()), 'yyyy-MM-dd'), end: format(endOfMonth(new Date()), 'yyyy-MM-dd') } },
    { label: "Last month", value: { start: format(startOfMonth(subDays(new Date(), 30)), 'yyyy-MM-dd'), end: format(endOfMonth(subDays(new Date(), 30)), 'yyyy-MM-dd') } },
    { label: "This year", value: { start: format(startOfYear(new Date()), 'yyyy-MM-dd'), end: format(endOfYear(new Date()), 'yyyy-MM-dd') } }
  ];

  const categories = [
    { id: '', name: 'All Categories' },
    { id: 'electronics', name: 'Electronics' },
    { id: 'clothing', name: 'Clothing' },
    { id: 'books', name: 'Books' },
    { id: 'home', name: 'Home & Garden' },
    { id: 'sports', name: 'Sports' },
    { id: 'toys', name: 'Toys' }
  ];

  const statuses = [
    { id: '', name: 'All Status' },
    { id: 'active', name: 'Active' },
    { id: 'inactive', name: 'Inactive' },
    { id: 'pending', name: 'Pending' },
    { id: 'completed', name: 'Completed' },
    { id: 'cancelled', name: 'Cancelled' }
  ];

  const sortOptions = [
    { id: 'date', label: 'Date', icon: Calendar },
    { id: 'amount', label: 'Amount', icon: TrendingUp },
    { id: 'name', label: 'Name', icon: Tag },
    { id: 'status', label: 'Status', icon: Check }
  ];

  const handleDateRangeChange = (range) => {
    onFilterChange({ dateRange: range });
  };

  const handleCategoryChange = (categoryId) => {
    onFilterChange({ category: categoryId });
  };

  const handleStatusChange = (statusId) => {
    onFilterChange({ status: statusId });
  };

  const handleSortChange = (field) => {
    onFilterChange({ sortBy: field });
  };

  const resetFilters = () => {
    onFilterChange({
      dateRange: { start: format(subDays(new Date(), 30), 'yyyy-MM-dd'), end: format(new Date(), 'yyyy-MM-dd') },
      category: '',
      status: '',
      sortBy: 'date',
      sortOrder: 'desc'
    });
    setIsFilterOpen(false);
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.category) count++;
    if (filters.status) count++;
    if (filters.sortBy !== 'date' || filters.sortOrder !== 'desc') count++;
    return count;
  };

  return (
    <div className="relative flex-1 sm:flex-initial" ref={filterRef}>
      <button
        type="button"
        onClick={() => setIsFilterOpen(!isFilterOpen)}
        className="w-full sm:w-auto px-4 py-3 rounded-lg border border-blue-300 !text-blue-600 hover:bg-blue-50 hover:border-blue-400 hover:!text-blue-700 transition-colors relative flex items-center justify-center gap-2 bg-white"
      >
        <Filter size={16} />
        <span>Filters</span>
        {getActiveFiltersCount() > 0 && (
          <Badge variant="primary" className="text-xs px-1.5 py-0.5">
            {getActiveFiltersCount()}
          </Badge>
        )}
        <ChevronDown size={14} className={`transition-transform ${isFilterOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Filter Dropdown Menu */}
      {isFilterOpen && (
        <>
          {/* Background Overlay - Portal for full page coverage */}
          {createPortal(
            <div className="fixed inset-0 bg-black/30 z-[9998]" onClick={() => setIsFilterOpen(false)} />,
            document.body
          )}
          
          {/* Filter Dropdown - Portal for proper layering */}
          {createPortal(
            <div 
              className="fixed w-80 bg-white/95 dark:bg-gray-800/95 backdrop-blur-lg rounded-lg border border-gray-200 dark:border-gray-700 shadow-xl z-[9999]"
              style={{
                top: filterRef.current ? filterRef.current.getBoundingClientRect().bottom + 8 : 0,
                right: filterRef.current ? window.innerWidth - filterRef.current.getBoundingClientRect().right : 0
              }}
              onClick={(e) => e.stopPropagation()}
            >
            {/* Dropdown Header */}
            <div className="px-6 py-3 border-b border-gray-200">
              <h3 className="text-lg font-bold text-gray-900">Filters</h3>
              <p className="text-sm text-gray-600">Filter reports by date, category, and status</p>
            </div>

            {/* Dropdown Content */}
            <div className="p-4 space-y-4">
              {/* Date Range Filter */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Date Range</h4>
                <select
                  value={filters.dateRange.start + '|' + filters.dateRange.end}
                  onChange={(e) => {
                    const [start, end] = e.target.value.split('|');
                    handleDateRangeChange({ start, end });
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-0 focus:border-gray-300 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                >
                  {quickDateRanges.map((range) => (
                    <option key={range.label} value={range.value.start + '|' + range.value.end}>
                      {range.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Category Filter */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Category</h4>
                <select
                  value={filters.category}
                  onChange={(e) => handleCategoryChange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-0 focus:border-gray-300 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                >
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Status Filter */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Status</h4>
                <select
                  value={filters.status}
                  onChange={(e) => handleStatusChange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-0 focus:border-gray-300 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                >
                  {statuses.map((status) => (
                    <option key={status.id} value={status.id}>
                      {status.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Sort Options */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Sort By</h4>
                <div className="flex gap-2">
                  <select
                    value={filters.sortBy}
                    onChange={(e) => handleSortChange(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-0 focus:border-gray-300 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  >
                    {sortOptions.map((option) => (
                      <option key={option.id} value={option.id}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <select
                    value={filters.sortOrder}
                    onChange={(e) => onFilterChange({ sortOrder: e.target.value })}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-0 focus:border-gray-300 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  >
                    <option value="asc">Ascending ↑</option>
                    <option value="desc">Descending ↓</option>
                  </select>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-center gap-4 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={resetFilters}
                  className="px-4 py-3 rounded-lg border border-blue-300 !text-blue-600 hover:bg-blue-50 hover:border-blue-400 hover:!text-blue-700 transition-colors bg-white"
                >
                  <RotateCcw size={14} className="mr-2" />
                  Reset
                </button>
                <button
                  type="button"
                  onClick={() => setIsFilterOpen(false)}
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
                  Apply
                </button>
              </div>
            </div>
            </div>,
            document.body
          )}
        </>
      )}
    </div>
  );
};

export default ReportFilters;