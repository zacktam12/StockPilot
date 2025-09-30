import React, { useState, useRef, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { ArrowUpDown, Check } from "lucide-react";
import Button from "../../../components/shared/Button";
import { setSortField } from "../../../store/slices/categorySlice";
import { useOutsideClick } from "../../../hooks/useOutsideClick";

const CategorySort = () => {
  const dispatch = useDispatch();
  const { sortField } = useSelector((state) => state.category);
  const [showSortMenu, setShowSortMenu] = useState(false);
  const sortRef = useRef(null);

  // Add outside click functionality
  useOutsideClick(sortRef, () => {
    if (showSortMenu) {
      setShowSortMenu(false);
    }
  });

  const handleSort = (field) => {
    dispatch(setSortField(field));
    setShowSortMenu(false);
  };

  return (
    <div className="relative" ref={sortRef}>
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
            {sortField === "name" && (
              <Check
                size={16}
                className="text-indigo-600 dark:text-indigo-400"
              />
            )}
          </button>
          <button
            className="w-full px-4 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center justify-between text-gray-700 dark:text-gray-200"
            onClick={() => handleSort("created_at")}
          >
            <span>Created Date</span>
            {sortField === "created_at" && (
              <Check
                size={16}
                className="text-indigo-600 dark:text-indigo-400"
              />
            )}
          </button>
        </div>
      )}
    </div>
  );
};

export default CategorySort;
