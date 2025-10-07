import React from "react";
import { ShoppingCart, Search, X } from "lucide-react";
import Button from "../../../components/shared/Button";

const PurchaseEmptyState = ({ searchTerm, onClearSearch }) => {
  if (searchTerm) {
    return (
      <div className="flex flex-col items-center justify-center text-gray-500 py-8">
        <Search size={48} className="mb-4 text-gray-400" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          No purchases found
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 text-center">
          No purchase orders match your search for "{searchTerm}"
        </p>
        <Button
          variant="outline"
          size="sm"
          icon={<X size={16} />}
          onClick={onClearSearch}
          className="text-gray-600 hover:text-gray-800"
        >
          Clear Search
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center text-gray-500 py-8">
      <ShoppingCart size={48} className="mb-4 text-gray-400" />
      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
        No purchase orders found
      </h3>
      <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
        Get started by creating your first purchase order
      </p>
    </div>
  );
};

export default PurchaseEmptyState;
