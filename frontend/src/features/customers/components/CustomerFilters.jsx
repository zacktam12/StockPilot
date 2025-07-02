import React, { useState, useRef } from "react";
import { useDispatch } from "react-redux";
import { Filter, X, Check, Clock } from "lucide-react";
import Button from "../../../components/shared/Button";
import Input from "../../../components/shared/Input";
import { setSearchTerm, setSort } from "../../../store/slices/customerSlice";
import { useOutsideClick } from "../../../hooks/useOutsideClick";

const CustomerFilters = () => {
  const dispatch = useDispatch();
  const [isExpanded, setIsExpanded] = useState(false);
  const [localSearch, setLocalSearch] = useState("");
  const [recentlyAdded, setRecentlyAdded] = useState(false);
  const filterRef = useRef(null);

  useOutsideClick(filterRef, () => {
    if (isExpanded) setIsExpanded(false);
  });

  const handleApply = () => {
    dispatch(setSearchTerm(localSearch));
    if (recentlyAdded) {
      dispatch(setSort({ field: "createdAt", order: "desc" }));
    }
    setIsExpanded(false);
  };

  const handleClear = () => {
    setLocalSearch("");
    setRecentlyAdded(false);
    dispatch(setSearchTerm(""));
    dispatch(setSort({ field: "name", order: "asc" }));
    setIsExpanded(false);
  };

  return (
    <div className="relative" ref={filterRef}>
      <Button
        variant="outline"
        size="md"
        onClick={() => setIsExpanded(!isExpanded)}
        icon={<Filter size={16} />}
        className="relative"
      >
        Filters
      </Button>
      {isExpanded && (
        <div className="absolute top-full right-0 mt-2 w-72 bg-white/95 dark:bg-gray-800/95 backdrop-blur-lg rounded-lg border border-gray-200 dark:border-gray-700 shadow-xl z-50">
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
            <span className="font-medium text-gray-900 dark:text-white">
              Customer Filters
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClear}
              className="text-gray-500 hover:text-gray-700"
            >
              <X size={16} />
              Clear
            </Button>
          </div>
          <div className="p-4 space-y-4 max-h-96 overflow-y-auto">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Name or Email
              </label>
              <Input
                value={localSearch}
                onChange={(e) => setLocalSearch(e.target.value)}
                placeholder="Search by name or email"
              />
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
            <div className="flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={handleClear}>
                Clear
              </Button>
              <Button variant="primary" size="sm" onClick={handleApply}>
                <Check size={16} className="mr-1" /> Apply
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerFilters;
