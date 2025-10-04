import React from "react";
import { Tag } from "lucide-react";
import Button from "../../../components/shared/Button";

const CategoryEmptyState = ({ searchTerm, onClearSearch }) => {
  return (
    <div className="flex flex-col items-center gap-2 text-gray-500">
      <Tag size={40} className="text-gray-300" />
      <p>No categories found</p>
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

export default CategoryEmptyState;
