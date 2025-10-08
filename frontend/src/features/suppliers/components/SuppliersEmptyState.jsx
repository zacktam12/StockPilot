import React from "react";
import { Truck, Search, Filter } from "lucide-react";

const SuppliersEmptyState = ({ searchTerm, onClearSearch }) => {
  if (searchTerm) {
    return (
      <div className="flex flex-col items-center justify-center text-gray-500 py-8">
        <Search size={48} className="mb-4 text-gray-300" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          No suppliers found for "{searchTerm}"
        </h3>
        <p className="text-sm text-gray-500 mb-4">
          Try adjusting your search terms or clear the search to see all suppliers.
        </p>
        <button
          onClick={onClearSearch}
          className="px-4 py-2 text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
        >
          Clear Search
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center text-gray-500 py-12">
      <Truck size={48} className="mb-4 text-gray-300" />
      <h3 className="text-lg font-medium text-gray-900 mb-2">
        No suppliers found
      </h3>
      <p className="text-sm text-gray-500 mb-4">
        Get started by adding your first supplier to the system.
      </p>
      <div className="flex items-center gap-2 text-xs text-gray-400">
        <Filter size={14} />
        <span>Try adjusting your filters or search terms</span>
      </div>
    </div>
  );
};

export default SuppliersEmptyState;
