import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import useIsMobile from "../../hooks/useIsMobile";

const EnhancedPagination = ({
  currentPage,
  totalPages,
  onPageChange,
  totalItems,
  itemsPerPage,
  onPageSizeChange,
  pageSizeOptions = [5, 10, 25, 50, 100],
  className = "",
  showPageSizeSelector = true,
  showItemCount = true,
}) => {
  const { isMobile } = useIsMobile();
  
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  const handlePageChange = (page) => {
    if (page !== currentPage && page >= 1 && page <= totalPages) {
      onPageChange(page);
    }
  };

  const handlePageSizeChange = (newPageSize) => {
    if (onPageSizeChange) {
      onPageSizeChange(newPageSize);
    }
  };

  const renderPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = isMobile ? 3 : 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    // Show first page if not in range
    if (startPage > 1) {
      pages.push(
        <button
          key={1}
          onClick={() => handlePageChange(1)}
          className="w-8 h-8 flex items-center justify-center text-sm rounded-lg bg-white border border-gray-200 text-gray-600 hover:border-blue-600 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200 shadow-sm"
        >
          1
        </button>
      );

      if (startPage > 2) {
        pages.push(
          <span key="ellipsis-start" className="px-2 text-gray-500">
            ...
          </span>
        );
      }
    }

    // Show middle pages
    for (let i = startPage; i <= endPage; i++) {
      const isCurrentPage = i === currentPage;
      pages.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={`w-8 h-8 flex items-center justify-center text-sm rounded-lg transition-all duration-200 ${
            isCurrentPage
              ? "bg-blue-600 text-white font-medium shadow-md"
              : "bg-white text-gray-600 border border-gray-200 hover:border-blue-600 hover:text-blue-600 hover:bg-blue-50 shadow-sm"
          }`}
        >
          {i}
        </button>
      );
    }

    // Show last page if not in range
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        pages.push(
          <span key="ellipsis-end" className="px-2 text-gray-500">
            ...
          </span>
        );
      }

      pages.push(
        <button
          key={totalPages}
          onClick={() => handlePageChange(totalPages)}
          className="w-8 h-8 flex items-center justify-center text-sm rounded-lg bg-white border border-gray-200 text-gray-600 hover:border-blue-600 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200 shadow-sm"
        >
          {totalPages}
        </button>
      );
    }

    return pages;
  };

  // Always show pagination if there are items, even if only one page
  if (totalItems === 0) return null;

  return (
    <div className={`flex flex-col sm:flex-row items-center justify-between gap-4 py-4 px-4 bg-white ${className}`}>
      {/* Left side - Item count and page size selector */}
      <div className="flex flex-col sm:flex-row items-center gap-4">
        {showItemCount && (
          <div className="text-sm text-gray-600">
            <span className="font-medium text-gray-900">{startItem}-{endItem}</span> of <span className="font-medium text-gray-900">{totalItems}</span>
          </div>
        )}
        
        {showPageSizeSelector && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">Rows per page:</span>
            <select
              value={itemsPerPage}
              onChange={(e) => handlePageSizeChange(Number(e.target.value))}
              className="px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-gray-400 bg-white"
            >
              {pageSizeOptions.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Right side - Pagination controls */}
      <div className="flex items-center gap-2">
        {/* Previous button */}
        <button
          onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className={`w-8 h-8 flex items-center justify-center text-sm rounded-lg transition-all duration-200 ${
            currentPage === 1
              ? "bg-gray-100 text-gray-400 cursor-not-allowed"
              : "bg-white border border-gray-200 text-gray-600 hover:border-blue-600 hover:text-blue-600 hover:bg-blue-50 shadow-sm"
          }`}
          aria-label="Previous page"
        >
          <ChevronLeft size={14} />
        </button>

        {/* Page numbers */}
        {!isMobile && renderPageNumbers()}
        
        {/* Mobile page indicator */}
        {isMobile && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">
              Page {currentPage} of {totalPages}
            </span>
          </div>
        )}

        {/* Next button */}
        <button
          onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          className={`w-8 h-8 flex items-center justify-center text-sm rounded-lg transition-all duration-200 ${
            currentPage === totalPages
              ? "bg-gray-100 text-gray-400 cursor-not-allowed"
              : "bg-white border border-gray-200 text-gray-600 hover:border-blue-600 hover:text-blue-600 hover:bg-blue-50 shadow-sm"
          }`}
          aria-label="Next page"
        >
          <ChevronRight size={14} />
        </button>
      </div>
    </div>
  );
};

export default EnhancedPagination;
