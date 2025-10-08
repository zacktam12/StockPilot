import React, { useRef } from "react";
import { Search, Filter, ArrowUpDown, ChevronUp, ChevronDown, X, Shield, User, Check } from "lucide-react";
import Input from "../../../components/shared/Input";
import Button from "../../../components/shared/Button";
import Badge from "../../../components/shared/Badge";
import { useOutsideClick } from "../../../hooks/useOutsideClick";

const UsersSearch = ({ 
  searchTerm, 
  onSearchChange, 
  onClearSearch,
  statusFilter, 
  onStatusFilter,
  roleFilter,
  onRoleFilter,
  roles,
  sortField,
  sortOrder,
  onSort,
  onClearFilters,
  showFilterMenu,
  setShowFilterMenu,
  showSortMenu,
  setShowSortMenu
}) => {
  const filterMenuRef = useRef(null);
  const sortMenuRef = useRef(null);

  // Add outside click functionality for filter menu
  useOutsideClick(filterMenuRef, () => {
    if (showFilterMenu) setShowFilterMenu(false);
  });

  // Add outside click functionality for sort menu
  useOutsideClick(sortMenuRef, () => {
    if (showSortMenu) setShowSortMenu(false);
  });

  const getActiveFiltersCount = () => {
    let count = 0;
    if (statusFilter) count++;
    if (roleFilter) count++;
    return count;
  };

  const getFilterSummary = () => {
    const filters = [];
    if (statusFilter) {
      filters.push(`Status: ${statusFilter}`);
    }
    if (roleFilter) {
      const role = roles.find((r) => r.id === roleFilter);
      filters.push(`Role: ${role ? role.role_type : "Unknown"}`);
    }
    return filters;
  };

  const getSortIcon = (field) => {
    if (sortField === field) {
      return sortOrder === "asc" ? (
        <ChevronUp size={16} className="text-blue-600" />
      ) : (
        <ChevronDown size={16} className="text-blue-600" />
      );
    }
    return <ArrowUpDown size={16} className="text-gray-400" />;
  };

  return (
    <>
      {/* Search and Filters */}
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-gray-200/50 dark:border-gray-700/50 shadow-lg relative z-20 mt-2">
        <div className="flex flex-col lg:flex-row gap-2 sm:gap-3">
          <div className="relative flex-1">
            <div className="relative">
              <Input
                placeholder="Search users by name, email, or phone..."
                icon={<Search size={18} className="text-gray-400" />}
                value={searchTerm}
                onChange={onSearchChange}
                className="w-full bg-white/50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400"
              />
              {searchTerm && (
                <button
                  onClick={onClearSearch}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X size={16} />
                </button>
              )}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative" ref={filterMenuRef}>
              <Button
                variant="outline"
                icon={<Filter size={16} />}
                onClick={() => {
                  setShowFilterMenu(!showFilterMenu);
                  setShowSortMenu(false);
                }}
                className="relative bg-white/50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-600 hover:bg-white dark:hover:bg-gray-700 shadow-sm"
              >
                Filter
                {getActiveFiltersCount() > 0 && (
                  <span className="absolute -top-1 -right-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center shadow-lg">
                    {getActiveFiltersCount()}
                  </span>
                )}
              </Button>

              {showFilterMenu && (
                <div className="absolute right-0 mt-3 w-80 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-2xl shadow-2xl border border-gray-200/50 dark:border-gray-700/50 p-6 z-[999999]">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Filter Users
                    </h3>
                    <button
                      onClick={() => setShowFilterMenu(false)}
                      className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    >
                      <X size={20} />
                    </button>
                  </div>

                  {/* Status Filter */}
                  <div className="mb-6">
                    <div className="flex items-center gap-2 mb-3">
                      <Shield size={16} className="text-gray-500" />
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
                        Status
                      </label>
                    </div>
                    <select
                      value={statusFilter}
                      onChange={(e) => onStatusFilter(e.target.value)}
                      className="w-full rounded-xl border border-gray-200 dark:border-gray-600 bg-white/50 dark:bg-gray-700/50 text-gray-900 dark:text-white shadow-sm p-3 focus:border-blue-500 dark:focus:border-blue-400 transition-colors"
                    >
                      <option value="">All Statuses</option>
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                      <option value="Deactivated">Deactivated</option>
                      <option value="Banned">Banned</option>
                    </select>
                  </div>

                  {/* Role Filter */}
                  <div className="mb-6">
                    <div className="flex items-center gap-2 mb-3">
                      <User size={16} className="text-gray-500" />
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
                        Role
                      </label>
                    </div>
                    <select
                      value={roleFilter}
                      onChange={(e) => onRoleFilter(e.target.value)}
                      className="w-full rounded-xl border border-gray-200 dark:border-gray-600 bg-white/50 dark:bg-gray-700/50 text-gray-900 dark:text-white shadow-sm p-3 focus:border-blue-500 dark:focus:border-blue-400 transition-colors"
                    >
                      <option value="">All Roles</option>
                      {roles.map((role) => (
                        <option key={role.id} value={role.id}>
                          {role.role_type}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Clear Filters */}
                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      onClick={onClearFilters}
                      className="flex-1 bg-white/50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-600 hover:bg-white dark:hover:bg-gray-700"
                    >
                      Clear Filters
                    </Button>
                    <Button
                      variant="primary"
                      onClick={() => setShowFilterMenu(false)}
                      className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                    >
                      Apply
                    </Button>
                  </div>
                </div>
              )}
            </div>

            <div className="relative" ref={sortMenuRef}>
              <Button
                variant="outline"
                icon={<ArrowUpDown size={16} />}
                onClick={() => {
                  setShowSortMenu(!showSortMenu);
                  setShowFilterMenu(false);
                }}
                className="bg-white/50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-600 hover:bg-white dark:hover:bg-gray-700 shadow-sm"
              >
                Sort
              </Button>

              {showSortMenu && (
                <div className="absolute right-0 mt-3 w-64 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-2xl shadow-2xl border border-gray-200/50 dark:border-gray-700/50 p-4 z-[999999]">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Sort By
                    </h3>
                    <button
                      onClick={() => setShowSortMenu(false)}
                      className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    >
                      <X size={20} />
                    </button>
                  </div>

                  {[
                    { field: "firstName", label: "Name" },
                    { field: "email", label: "Email" },
                    { field: "status", label: "Status" },
                    { field: "createdAt", label: "Created Date" },
                  ].map(({ field, label }) => (
                    <button
                      key={field}
                      className={`w-full flex items-center justify-between p-3 rounded-xl transition-all duration-200 mb-2 ${
                        sortField === field
                          ? "bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 text-blue-700 dark:text-blue-300 font-semibold"
                          : "hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200"
                      }`}
                      onClick={() => onSort(field)}
                    >
                      <span className="flex items-center gap-2">
                        {label}
                        {sortField === field &&
                          (sortOrder === "asc" ? (
                            <ChevronUp
                              size={16}
                              className="text-blue-600"
                            />
                          ) : (
                            <ChevronDown
                              size={16}
                              className="text-blue-600"
                            />
                          ))}
                      </span>
                      {sortField === field && (
                        <Check
                          size={16}
                          className="text-indigo-600 dark:text-indigo-400"
                        />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Active Filters Summary */}
      {getActiveFiltersCount() > 0 && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 backdrop-blur-sm rounded-xl sm:rounded-2xl p-3 border border-blue-200/50 dark:border-blue-800/50 shadow-lg mt-2">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-sm font-semibold text-blue-700 dark:text-blue-300 flex items-center gap-2">
              <Filter size={16} />
              Active Filters:
            </span>
            {getFilterSummary().map((filter, index) => (
              <Badge
                key={index}
                variant="primary"
                className="text-xs bg-blue-600 text-white shadow-sm"
              >
                {filter}
              </Badge>
            ))}
            <button
              onClick={onClearFilters}
              className="ml-auto text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 font-medium px-3 py-1 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
            >
              Clear All
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default UsersSearch;
