import React, { useState, useRef, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Settings2,
  X,
  DollarSign,
  Package,
  AlertTriangle,
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
} from "../../../store/slices/productSlice";
import { useOutsideClick } from "../../../hooks/useOutsideClick";

const ProductFilters = () => {
  const dispatch = useDispatch();
  const { categories } = useSelector((state) => state.product);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [localFilters, setLocalFilters] = useState({});
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [categorySearch, setCategorySearch] = useState("");
  const [isStatusOpen, setIsStatusOpen] = useState(false);
  const [statusSearch, setStatusSearch] = useState("");
  const filterRef = useRef(null);
  const categoryRef = useRef(null);
  const statusRef = useRef(null);

  const {
    categoryId,
    status,
    priceRange,
    stockRange,
    hasImage,
    hasBarcode,
    hasSku,
  } = useSelector((state) => state.product.filters || {});

  // Initialize local filters with current Redux state
  useEffect(() => {
    setLocalFilters({
      categoryId,
      status,
      priceRange,
      stockRange,
      hasImage,
      hasBarcode,
      hasSku,
    });
  }, [
    categoryId,
    status,
    priceRange,
    stockRange,
    hasImage,
    hasBarcode,
    hasSku,
  ]);

  // Add outside click functionality
  useOutsideClick(filterRef, () => {
    if (isExpanded) {
      setIsExpanded(false);
    }
  });

  useOutsideClick(categoryRef, () => {
    setIsCategoryOpen(false);
    setCategorySearch("");
  });

  useOutsideClick(statusRef, () => {
    setIsStatusOpen(false);
    setStatusSearch("");
  });

  const statusOptions = [
    { value: "", label: "All Status" },
    { value: "in_stock", label: "In Stock" },
    { value: "low_stock", label: "Low Stock" },
    { value: "out_of_stock", label: "Out of Stock" },
  ];

  // Filter categories based on search
  const filteredCategories = categories?.filter(category =>
    category.name.toLowerCase().includes(categorySearch.toLowerCase())
  ) || [];

  // Filter status options based on search
  const filteredStatusOptions = statusOptions?.filter(option =>
    option.label.toLowerCase().includes(statusSearch.toLowerCase())
  ) || [];

  // Calculate active filter count
  const getActiveFilterCount = () => {
    let count = 0;
    if (localFilters.categoryId) count++;
    if (localFilters.status) count++;
    if (localFilters.priceRange?.min || localFilters.priceRange?.max) count++;
    if (localFilters.stockRange?.min || localFilters.stockRange?.max) count++;
    if (localFilters.hasImage) count++;
    if (localFilters.hasBarcode) count++;
    if (localFilters.hasSku) count++;
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
      categoryId: null,
      status: null,
      priceRange: { min: null, max: null },
      stockRange: { min: null, max: null },
      hasImage: false,
      hasBarcode: false,
      hasSku: false,
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
            {/* Category Filter */}
            <div className="relative" ref={categoryRef}>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Select category..."
                  value={categorySearch || (localFilters.categoryId ? categories?.find(cat => cat.id === localFilters.categoryId)?.name || "" : "")}
                  onChange={(e) => {
                    setCategorySearch(e.target.value);
                    setIsCategoryOpen(true);
                    // Clear selection if user types something different
                    if (localFilters.categoryId && e.target.value !== categories?.find(cat => cat.id === localFilters.categoryId)?.name) {
                      handleLocalFilterChange("categoryId", null);
                    }
                  }}
                  onFocus={() => {
                    if (isCategoryOpen) {
                      setIsCategoryOpen(false);
                    } else {
                      setIsCategoryOpen(true);
                      setCategorySearch("");
                    }
                  }}
                  className="w-full pl-12 pr-12 py-3 text-sm border border-gray-300 bg-white text-gray-800 rounded-lg shadow-sm transition duration-150 ease-in-out hover:border-gray-600 focus:outline-none focus:ring-0 focus:border-gray-300"
                />
                <ChevronDown size={16} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              </div>
              
              {isCategoryOpen && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                  <button
                    type="button"
                    onClick={() => {
                      handleLocalFilterChange("categoryId", null);
                      setCategorySearch("");
                      setIsCategoryOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    All Categories
                  </button>
                  {filteredCategories.map((category) => (
                    <button
                      key={category.id}
                      type="button"
                      onClick={() => {
                        handleLocalFilterChange("categoryId", category.id);
                        setCategorySearch(category.name);
                        setIsCategoryOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      {category.name}
                    </button>
                  ))}
                  {filteredCategories.length === 0 && categorySearch && (
                    <div className="px-4 py-2 text-sm text-gray-500">
                      No categories found
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
                      handleLocalFilterChange("status", null);
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
                        handleLocalFilterChange("status", option.value);
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

            {/* Price Range Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Price Range
              </label>
              <div className="grid grid-cols-2 gap-2">
                <div className="relative">
                  <DollarSign size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="number"
                    placeholder="Min Price"
                    value={localFilters.priceRange?.min || ""}
                    onChange={(e) =>
                      handleLocalFilterChange("priceRange", {
                        ...localFilters.priceRange,
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
                    value={localFilters.priceRange?.max || ""}
                    onChange={(e) =>
                      handleLocalFilterChange("priceRange", {
                        ...localFilters.priceRange,
                        max: e.target.value ? parseFloat(e.target.value) : null,
                      })
                    }
                    className="w-full pl-8 pr-4 py-3 text-sm border border-gray-300 bg-white text-gray-800 rounded-lg shadow-sm transition duration-150 ease-in-out hover:border-gray-600 focus:outline-none focus:ring-0 focus:border-gray-300"
                  />
                </div>
              </div>
            </div>

            {/* Stock Range Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Stock Range
              </label>
              <div className="grid grid-cols-2 gap-2">
                <div className="relative">
                  <Package size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="number"
                    placeholder="Min Stock"
                    value={localFilters.stockRange?.min || ""}
                    onChange={(e) =>
                      handleLocalFilterChange("stockRange", {
                        ...localFilters.stockRange,
                        min: e.target.value ? parseInt(e.target.value) : null,
                      })
                    }
                    className="w-full pl-8 pr-4 py-3 text-sm border border-gray-300 bg-white text-gray-800 rounded-lg shadow-sm transition duration-150 ease-in-out hover:border-gray-600 focus:outline-none focus:ring-0 focus:border-gray-300"
                  />
                </div>
                <div className="relative">
                  <Package size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="number"
                    placeholder="Max Stock"
                    value={localFilters.stockRange?.max || ""}
                    onChange={(e) =>
                      handleLocalFilterChange("stockRange", {
                        ...localFilters.stockRange,
                        max: e.target.value ? parseInt(e.target.value) : null,
                      })
                    }
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

export default ProductFilters;
