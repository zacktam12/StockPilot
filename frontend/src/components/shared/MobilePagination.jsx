import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const MobilePagination = ({
  currentPage,
  totalPages,
  onPageChange,
  totalItems,
  itemsPerPage,
  className = "",
}) => {
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  const handlePrevious = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  // Always show pagination if there are items, even if only one page
  if (totalItems === 0) return null;

  return (
    <div className={`flex items-center justify-between w-full px-4 py-3 bg-white border-t border-gray-200 ${className}`}>
      <div className="flex items-center gap-4">
        {/* Previous button */}
        <button
          onClick={handlePrevious}
          disabled={currentPage === 1}
          className={`w-10 h-10 flex items-center justify-center rounded-lg border transition-all duration-200 ${
            currentPage === 1
              ? "bg-gray-100 text-gray-400 cursor-not-allowed border-gray-200"
              : "bg-white text-gray-600 border-gray-300 hover:bg-gray-50 hover:border-blue-500"
          }`}
          aria-label="Previous page"
        >
          <ChevronLeft size={16} />
        </button>

        {/* Current page indicator */}
        <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-gray-100 text-gray-700 font-medium">
          {currentPage}
        </div>

        {/* Next button */}
        <button
          onClick={handleNext}
          disabled={currentPage === totalPages}
          className={`w-10 h-10 flex items-center justify-center rounded-lg border transition-all duration-200 ${
            currentPage === totalPages
              ? "bg-gray-100 text-gray-400 cursor-not-allowed border-gray-200"
              : "bg-white text-gray-600 border-gray-300 hover:bg-gray-50 hover:border-blue-500"
          }`}
          aria-label="Next page"
        >
          <ChevronRight size={16} />
        </button>
      </div>

      {/* Results count */}
      <div className="text-sm text-gray-600">
        {totalItems} Result{totalItems !== 1 && 's'}
      </div>
    </div>
  );
};

export default MobilePagination;
