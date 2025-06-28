import React, { useState, useRef, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Filter,
  X,
  DollarSign,
  Package,
  AlertTriangle,
  Save,
  Check,
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
  const filterRef = useRef(null);

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

  const statusOptions = [
    { value: "", label: "All Status" },
    { value: "in_stock", label: "In Stock" },
    { value: "low_stock", label: "Low Stock" },
    { value: "out_of_stock", label: "Out of Stock" },
  ];

  return (
    <div className="relative" ref={filterRef}>
      {/* Filter Button */}
      <Button
        variant="outline"
        size="md"
        onClick={() => setIsExpanded(!isExpanded)}
        icon={<Filter size={16} />}
        className="relative"
      >
        Filters
        {activeFilterCount > 0 && (
          <Badge variant="primary" className="ml-2 text-xs">
            {activeFilterCount}
          </Badge>
        )}
      </Button>

      {/* Filter Overlay */}
      {isExpanded && (
        <div className="absolute top-full right-0 mt-2 w-80 bg-white/95 dark:bg-gray-800/95 backdrop-blur-lg rounded-lg border border-gray-200 dark:border-gray-700 shadow-xl z-50">
          {/* Filter Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2">
              <Filter size={18} className="text-gray-600 dark:text-gray-400" />
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
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClearFilters}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X size={16} />
                  Clear
                </Button>
              )}
            </div>
          </div>

          {/* Filter Content */}
          <div className="p-4 space-y-4 max-h-96 overflow-y-auto">
            {/* Category Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Category
              </label>
              <select
                value={localFilters.categoryId || ""}
                onChange={(e) =>
                  handleLocalFilterChange("categoryId", e.target.value || null)
                }
                className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm p-2"
              >
                <option value="">All Categories</option>
                {Array.isArray(categories) &&
                  categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
              </select>
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Status
              </label>
              <select
                value={localFilters.status || ""}
                onChange={(e) =>
                  handleLocalFilterChange("status", e.target.value || null)
                }
                className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm p-2"
              >
                {statusOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Price Range Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Price Range
              </label>
              <div className="grid grid-cols-2 gap-2">
                <Input
                  type="number"
                  placeholder="Min Price"
                  icon={<DollarSign size={16} />}
                  value={localFilters.priceRange?.min || ""}
                  onChange={(e) =>
                    handleLocalFilterChange("priceRange", {
                      ...localFilters.priceRange,
                      min: e.target.value ? parseFloat(e.target.value) : null,
                    })
                  }
                />
                <Input
                  type="number"
                  placeholder="Max Price"
                  icon={<DollarSign size={16} />}
                  value={localFilters.priceRange?.max || ""}
                  onChange={(e) =>
                    handleLocalFilterChange("priceRange", {
                      ...localFilters.priceRange,
                      max: e.target.value ? parseFloat(e.target.value) : null,
                    })
                  }
                />
              </div>
            </div>

            {/* Stock Range Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Stock Range
              </label>
              <div className="grid grid-cols-2 gap-2">
                <Input
                  type="number"
                  placeholder="Min Stock"
                  icon={<Package size={16} />}
                  value={localFilters.stockRange?.min || ""}
                  onChange={(e) =>
                    handleLocalFilterChange("stockRange", {
                      ...localFilters.stockRange,
                      min: e.target.value ? parseInt(e.target.value) : null,
                    })
                  }
                />
                <Input
                  type="number"
                  placeholder="Max Stock"
                  icon={<Package size={16} />}
                  value={localFilters.stockRange?.max || ""}
                  onChange={(e) =>
                    handleLocalFilterChange("stockRange", {
                      ...localFilters.stockRange,
                      max: e.target.value ? parseInt(e.target.value) : null,
                    })
                  }
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-2 p-4 border-t border-gray-200 dark:border-gray-700">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsExpanded(false)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleSaveFilters}
              isLoading={isSaving}
              icon={isSaving ? undefined : <Save size={16} />}
            >
              {isSaving ? "Saving..." : "Apply Filters"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductFilters;
