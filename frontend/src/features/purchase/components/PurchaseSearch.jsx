import React from "react";
import { Search, Filter, ArrowUpDown, Check } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import Input from "../../../components/shared/Input";
import Button from "../../../components/shared/Button";
import { useOutsideClick } from "../../../hooks/useOutsideClick";

const PurchaseSearch = ({ 
  searchTerm, 
  onSearchChange, 
  onSort, 
  sortField, 
  filterOptions, 
  onFilterChange 
}) => {
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [showSortMenu, setShowSortMenu] = useState(false);
  const filterRef = useRef(null);
  const sortRef = useRef(null);

  // Add outside click functionality
  useOutsideClick(filterRef, () => {
    if (showFilterMenu) {
      setShowFilterMenu(false);
    }
  });

  useOutsideClick(sortRef, () => {
    if (showSortMenu) {
      setShowSortMenu(false);
    }
  });

  const sortFields = [
    { value: "id", label: "ID" },
    { value: "created_at", label: "Created Date" },
    { value: "total_amount", label: "Total Amount" },
    { value: "status", label: "Status" },
  ];

  return (
    <div className="flex flex-col sm:flex-row gap-4">
      <div className="relative flex-1">
        <Input
          placeholder="Search by PO number, supplier..."
          icon={<Search size={18} className="text-gray-400" />}
          value={searchTerm}
          onChange={onSearchChange}
          className="w-full"
        />
      </div>

      <div className="relative" ref={filterRef}>
        <Button
          variant="outline"
          icon={<Filter size={16} />}
          onClick={() => setShowFilterMenu(!showFilterMenu)}
        >
          Filter
        </Button>

        {showFilterMenu && (
          <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 p-4 z-50 dark:bg-gray-800 dark:border-gray-700">
            <div className="space-y-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={filterOptions.hasPhone}
                  onChange={(e) =>
                    onFilterChange({
                      ...filterOptions,
                      hasPhone: e.target.checked,
                    })
                  }
                  className="rounded border-gray-300 dark:border-gray-600"
                />
                <span className="text-sm">Has Phone Number</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={filterOptions.hasAddress}
                  onChange={(e) =>
                    onFilterChange({
                      ...filterOptions,
                      hasAddress: e.target.checked,
                    })
                  }
                  className="rounded border-gray-300 dark:border-gray-600"
                />
                <span className="text-sm">Has Address</span>
              </label>
            </div>
          </div>
        )}
      </div>

      <div className="relative" ref={sortRef}>
        <Button
          variant="outline"
          icon={<ArrowUpDown size={16} />}
          onClick={() => setShowSortMenu(!showSortMenu)}
        >
          Sort
        </Button>

        {showSortMenu && (
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden z-50 dark:bg-gray-800 dark:border-gray-700">
            {sortFields.map((field) => (
              <button
                key={field.value}
                className="w-full px-4 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center justify-between"
                onClick={() => onSort(field.value)}
              >
                <span>{field.label}</span>
                {sortField === field.value && (
                  <Check size={16} className="text-blue-600" />
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PurchaseSearch;
