import React from "react";
import { Users, Search } from "lucide-react";

const CustomerEmptyState = ({ searchTerm, onClearSearch }) => {
  if (searchTerm) {
    return (
      <div className="flex flex-col items-center justify-center text-gray-500 py-8">
        <Search size={48} className="mb-4 text-gray-300" />
        <h3 className="text-lg font-medium mb-2">No customers found</h3>
        <p className="text-sm mb-4">
          No customers match your search for "{searchTerm}"
        </p>
        <button
          onClick={onClearSearch}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Clear Search
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center text-gray-500 py-8">
      <Users size={48} className="mb-4 text-gray-300" />
      <h3 className="text-lg font-medium mb-2">No customers yet</h3>
      <p className="text-sm">
        Get started by adding your first customer
      </p>
    </div>
  );
};

export default CustomerEmptyState;
