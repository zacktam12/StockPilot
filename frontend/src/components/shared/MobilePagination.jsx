import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const MobilePagination = ({
  currentPage,
  totalPages,
  onPageChange,
  totalItems,
  itemsPerPage,
  onPageSizeChange,
  pageSizeOptions = [5, 10, 25, 50, 100],
  showPageSizeSelector = true,
  showItemCount = true,
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
    <div className={`w-full bg-white border-t border-gray-200 ${className}`}>
      {/* Top section - Rows per page and item count */}
      <div className="px-4 py-3 border-b border-gray-100">
        <div className="flex flex-col gap-3">
          {/* Rows per page selector */}
          {showPageSizeSelector && onPageSizeChange && (
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Rows per page</span>
              <select
                value={itemsPerPage}
                onChange={(e) => onPageSizeChange(Number(e.target.value))}
                className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-white min-w-[80px]"
              >
                {pageSizeOptions.map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Results count */}
          {showItemCount && (
            <div className="text-sm text-gray-600 text-center">
              Showing <span className="font-medium text-gray-900">{startItem}-{endItem}</span> of <span className="font-medium text-gray-900">{totalItems}</span> results
            </div>
          )}
        </div>
      </div>

      {/* Bottom section - Navigation controls */}
      <div className="px-4 py-3">
        <div className="flex items-center justify-center gap-2">
          {/* Previous button */}
          <button
            onClick={handlePrevious}
            disabled={currentPage === 1}
            className={`w-10 h-10 flex items-center justify-center rounded-lg border transition-all duration-200 ${
              currentPage === 1
                ? "bg-gray-100 text-gray-400 cursor-not-allowed border-gray-200"
                : "bg-white text-gray-600 border-gray-300 hover:bg-blue-50 hover:border-blue-500 hover:text-blue-600 shadow-sm"
            }`}
            aria-label="Previous page"
          >
            <ChevronLeft size={16} />
          </button>

          {/* Page numbers */}
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              className={`w-10 h-10 flex items-center justify-center rounded-lg border transition-all duration-200 ${
                page === currentPage
                  ? "bg-blue-600 text-white border-blue-600 shadow-md"
                  : "bg-white text-gray-600 border-gray-300 hover:bg-blue-50 hover:border-blue-500 hover:text-blue-600 shadow-sm"
              }`}
              aria-label={`Go to page ${page}`}
            >
              {page}
            </button>
          ))}

          {/* Next button */}
          <button
            onClick={handleNext}
            disabled={currentPage === totalPages}
            className={`w-10 h-10 flex items-center justify-center rounded-lg border transition-all duration-200 ${
              currentPage === totalPages
                ? "bg-gray-100 text-gray-400 cursor-not-allowed border-gray-200"
                : "bg-white text-gray-600 border-gray-300 hover:bg-blue-50 hover:border-blue-500 hover:text-blue-600 shadow-sm"
            }`}
            aria-label="Next page"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default MobilePagination;
