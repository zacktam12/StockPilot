import React from "react";
import { Package } from "lucide-react";
import Button from "../../../components/shared/Button";

const ProductEmptyState = ({ searchTerm, onClearSearch }) => {
  return (
    <div className="flex flex-col items-center gap-2 text-gray-500">
      <Package size={40} className="text-gray-300" />
      <p>No products found</p>
      {searchTerm && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onClearSearch}
        >
          Clear search
        </Button>
      )}
    </div>
  );
};

export default ProductEmptyState;
