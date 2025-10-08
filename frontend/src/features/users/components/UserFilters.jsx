import React, { useState, useRef } from "react";
import { Filter, ChevronDown, X, Shield, User, Check } from "lucide-react";
import Button from "../../../components/shared/Button";
import Badge from "../../../components/shared/Badge";
import { useOutsideClick } from "../../../hooks/useOutsideClick";

const UserFilters = ({ 
  statusFilter, 
  onStatusFilter,
  roleFilter,
  onRoleFilter,
  roles,
  onClearFilters
}) => {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const filterRef = useRef(null);

  // Close dropdown when clicking outside
  useOutsideClick(filterRef, () => {
    if (isFilterOpen) {
      setIsFilterOpen(false);
    }
  });

  const getActiveFiltersCount = () => {
    let count = 0;
    if (statusFilter) count++;
    if (roleFilter) count++;
    return count;
  };

  const handleFilterSelect = (type, value) => {
    if (type === 'status') {
      onStatusFilter(value);
    } else if (type === 'role') {
      onRoleFilter(value);
    }
    setIsFilterOpen(false);
  };

  const handleClearFilters = () => {
    onClearFilters();
    setIsFilterOpen(false);
  };

  return (
    <div className="relative" ref={filterRef}>
      <Button
        variant="outline"
        size="md"
        icon={<Filter size={16} />}
        onClick={() => setIsFilterOpen(!isFilterOpen)}
        className="w-full px-4 py-3 rounded-lg border-blue-300 !text-blue-600 hover:bg-blue-50 hover:border-blue-400 hover:!text-blue-700 transition-colors relative"
      >
        <div className="flex items-center gap-2">
          <span>Filters</span>
          {getActiveFiltersCount() > 0 && (
            <Badge variant="primary" className="text-xs px-1.5 py-0.5">
              {getActiveFiltersCount()}
            </Badge>
          )}
          <ChevronDown size={14} className={`transition-transform ${isFilterOpen ? 'rotate-180' : ''}`} />
        </div>
      </Button>

      {/* Filter Dropdown Menu */}
      {isFilterOpen && (
        <>
          {/* Background Overlay */}
          <div className="fixed inset-0 bg-black/30 z-[9998]" onClick={() => setIsFilterOpen(false)} />
          
          {/* Filter Dropdown */}
          <div className="absolute top-full right-0 sm:right-0 left-0 sm:left-auto mt-2 w-80 sm:w-80 max-w-[calc(100vw-2rem)] bg-white/95 dark:bg-gray-800/95 backdrop-blur-lg rounded-lg border border-gray-200 dark:border-gray-700 shadow-xl z-[9999]">
            {/* Dropdown Header */}
            <div className="px-6 py-3 border-b border-gray-200">
              <h3 className="text-lg font-bold text-gray-900">Filters</h3>
              <p className="text-sm text-gray-600">Filter users by status and role</p>
            </div>

            {/* Dropdown Content */}
            <div className="p-4 space-y-4">
              {/* Status Filter */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Status</h4>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => handleFilterSelect('status', '')}
                    className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                      !statusFilter 
                        ? 'bg-blue-100 text-blue-700 border border-blue-200' 
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    All
                  </button>
                  <button
                    onClick={() => handleFilterSelect('status', 'Active')}
                    className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                      statusFilter === 'Active' 
                        ? 'bg-green-100 text-green-700 border border-green-200' 
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    <div className="flex items-center gap-1.5">
                      <Check size={12} />
                      Active
                    </div>
                  </button>
                  <button
                    onClick={() => handleFilterSelect('status', 'Inactive')}
                    className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                      statusFilter === 'Inactive' 
                        ? 'bg-red-100 text-red-700 border border-red-200' 
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    <div className="flex items-center gap-1.5">
                      <X size={12} />
                      Inactive
                    </div>
                  </button>
                </div>
              </div>

              {/* Role Filter */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Role</h4>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => handleFilterSelect('role', '')}
                    className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                      !roleFilter 
                        ? 'bg-blue-100 text-blue-700 border border-blue-200' 
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    All
                  </button>
                  {roles.map((role) => (
                    <button
                      key={role.id}
                      onClick={() => handleFilterSelect('role', role.id)}
                      className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                        roleFilter === role.id 
                          ? 'bg-purple-100 text-purple-700 border border-purple-200' 
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      <div className="flex items-center gap-1.5">
                        <Shield size={12} />
                        {role.role_type}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Clear Filters */}
              {getActiveFiltersCount() > 0 && (
                <div className="pt-3 border-t border-gray-200">
                  <button
                    onClick={handleClearFilters}
                    className="w-full px-4 py-2 text-center text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    <X size={16} />
                    Clear All Filters
                  </button>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default UserFilters;
