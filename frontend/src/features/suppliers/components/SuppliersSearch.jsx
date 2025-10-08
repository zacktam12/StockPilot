import React, { useRef } from "react";
import { Search, Filter, ArrowUpDown, ChevronUp, ChevronDown } from "lucide-react";
import Input from "../../../components/shared/Input";
import Button from "../../../components/shared/Button";
import { useOutsideClick } from "../../../hooks/useOutsideClick";

const SuppliersSearch = ({ 
  searchTerm, 
  onSearchChange, 
  filters, 
  onTogglePhoneFilter,
  onToggleAddressFilter,
  onToggleEmailFilter,
  onToggleCompanyFilter,
  onSetSort,
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

  const handleSort = (field) => {
    onSetSort({ field });
    setShowSortMenu(false);
  };

  const getSortIcon = (field) => {
    if (filters?.sortField !== field) return null;
    return filters?.sortOrder === "asc" ? (
      <ChevronUp size={16} />
    ) : (
      <ChevronDown size={16} />
    );
  };

  return (
    <div className="flex flex-col sm:flex-row gap-4 items-center">
      <div className="relative flex-1">
        <Input
          placeholder="Search suppliers..."
          icon={<Search size={18} className="text-gray-400" />}
          value={searchTerm}
          onChange={onSearchChange}
          className="w-full"
        />
      </div>
      
      {/* Filter Menu */}
      <div className="relative" ref={filterMenuRef}>
        <Button
          variant="outline"
          icon={<Filter size={16} />}
          onClick={() => setShowFilterMenu(!showFilterMenu)}
        >
          Filter
        </Button>
        {showFilterMenu && (
          <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-4 z-50 flex flex-col gap-2">
            <div className="grid grid-cols-2 gap-2 mb-2">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={filters?.options?.hasPhone || false}
                  onChange={onTogglePhoneFilter}
                  className="rounded border-gray-300 dark:border-gray-600"
                />
                <span className="text-sm text-gray-700 dark:text-gray-200">
                  Has Phone
                </span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={filters?.options?.hasAddress || false}
                  onChange={onToggleAddressFilter}
                  className="rounded border-gray-300 dark:border-gray-600"
                />
                <span className="text-sm text-gray-700 dark:text-gray-200">
                  Has Address
                </span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={filters?.options?.hasEmail || false}
                  onChange={onToggleEmailFilter}
                  className="rounded border-gray-300 dark:border-gray-600"
                />
                <span className="text-sm text-gray-700 dark:text-gray-200">
                  Has Email
                </span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={filters?.options?.hasCompany || false}
                  onChange={onToggleCompanyFilter}
                  className="rounded border-gray-300 dark:border-gray-600"
                />
                <span className="text-sm text-gray-700 dark:text-gray-200">
                  Has Company
                </span>
              </label>
            </div>
            <label className="flex items-center gap-2 mb-2">
              <input
                type="checkbox"
                checked={
                  filters?.sortField === "createdAt" &&
                  filters?.sortOrder === "desc"
                }
                onChange={(e) =>
                  onSetSort({
                    field: "createdAt",
                    order: e.target.checked ? "desc" : "asc",
                  })
                }
                className="rounded border-gray-300 dark:border-gray-600"
              />
              <span className="text-sm text-gray-700 dark:text-gray-200">
                Recently Added
              </span>
            </label>
            <Button
              variant="outline"
              size="sm"
              className="mt-2"
              onClick={onClearFilters}
            >
              Clear Filters
            </Button>
          </div>
        )}
      </div>

      {/* Sort Menu */}
      <div className="relative" ref={sortMenuRef}>
        <Button
          variant="outline"
          icon={<ArrowUpDown size={16} />}
          onClick={() => setShowSortMenu(!showSortMenu)}
        >
          Sort
        </Button>
        {showSortMenu && (
          <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden z-50">
            <button
              className="w-full px-4 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center justify-between text-gray-700 dark:text-gray-200"
              onClick={() => handleSort("name")}
            >
              <span>Name</span>
              {getSortIcon("name")}
            </button>
            <button
              className="w-full px-4 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center justify-between text-gray-700 dark:text-gray-200"
              onClick={() => handleSort("createdAt")}
            >
              <span>Created Date</span>
              {getSortIcon("createdAt")}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SuppliersSearch;
