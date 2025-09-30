import React, { useState, useRef, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Filter } from "lucide-react";
import Button from "../../../components/shared/Button";
import { setFilterOptions } from "../../../store/slices/categorySlice";
import { useOutsideClick } from "../../../hooks/useOutsideClick";

const CategoryFilters = () => {
  const dispatch = useDispatch();
  const { filterOptions } = useSelector((state) => state.category);
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const filterRef = useRef(null);

  // Add outside click functionality
  useOutsideClick(filterRef, () => {
    if (showFilterMenu) {
      setShowFilterMenu(false);
    }
  });

  const handleFilterChange = (key, value) => {
    dispatch(setFilterOptions({ [key]: value }));
  };

  return (
    <div className="relative" ref={filterRef}>
      <Button
        variant="outline"
        icon={<Filter size={16} />}
        onClick={() => setShowFilterMenu(!showFilterMenu)}
      >
        Filter
      </Button>
      {showFilterMenu && (
        <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-4 z-50">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={filterOptions?.hasDescription || false}
              onChange={(e) =>
                handleFilterChange("hasDescription", e.target.checked)
              }
              className="rounded border-gray-300 dark:border-gray-600"
            />
            <span className="text-sm text-gray-700 dark:text-gray-200">
              Has Description
            </span>
          </label>
        </div>
      )}
    </div>
  );
};

export default CategoryFilters;
