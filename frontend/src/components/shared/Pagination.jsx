// src/components/shared/Pagination.jsx
import { HiChevronLeft, HiChevronRight } from "react-icons/hi2";
import { useDispatch, useSelector } from "react-redux";
import { setCurrentPage as setProductCurrentPage } from "../../store/slices/productSlice";
import { setCurrentPage as setUserCurrentPage } from "../../store/slices/userSlice";
import { setCurrentPage as setCategoryCurrentPage } from "../../store/slices/categorySlice";
import { setCurrentPage as setSupplierCurrentPage } from "../../store/slices/supplierSlice";
import { setCurrentPage as setSaleCurrentPage } from "../../store/slices/salesSlice";
import { setCurrentPage as setPurchaseCurrentPage } from "../../store/slices/purchaseSlice";
import { setCurrentPage as setCustomerCurrentPage } from "../../store/slices/customerSlice";

export default function Pagination({ sliceName = "product" }) {
  const dispatch = useDispatch();

  // Get the appropriate slice state based on sliceName
  const getSliceState = (state) => {
    switch (sliceName) {
      case "user":
        return state.user;
      case "category":
        return state.category;
      case "supplier":
        return state.supplier;
      case "sale":
        return state.sales;
      case "purchase":
        return state.purchase;
      case "customer":
        return state.customer;
      default:
        return state.product;
    }
  };

  // Get the appropriate setCurrentPage action based on sliceName
  const getSetCurrentPageAction = (page) => {
    switch (sliceName) {
      case "user":
        return setUserCurrentPage(page);
      case "category":
        return setCategoryCurrentPage(page);
      case "supplier":
        return setSupplierCurrentPage(page);
      case "sale":
        return setSaleCurrentPage(page);
      case "purchase":
        return setPurchaseCurrentPage(page);
      case "customer":
        return setCustomerCurrentPage(page);
      default:
        return setProductCurrentPage(page);
    }
  };

  const { currentPage, totalPages, totalItems, itemsPerPage } =
    useSelector(getSliceState);

  const nextPage = () => {
    if (currentPage < totalPages) {
      dispatch(getSetCurrentPageAction(currentPage + 1));
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      dispatch(getSetCurrentPageAction(currentPage - 1));
    }
  };

  if (totalPages <= 1) return null;

  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <div className="w-full flex items-center justify-between py-4">
      <p className="text-sm md:text-base text-gray-600 dark:text-gray-400">
        Showing{" "}
        <span className="font-semibold text-gray-900 dark:text-white">
          {startItem}
        </span>{" "}
        to{" "}
        <span className="font-semibold text-gray-900 dark:text-white">
          {endItem}
        </span>{" "}
        of{" "}
        <span className="font-semibold text-gray-900 dark:text-white">
          {totalItems}
        </span>{" "}
        results
      </p>

      <div className="flex gap-2">
        <button
          onClick={prevPage}
          disabled={currentPage === 1}
          className={`flex items-center gap-1 px-3 py-2 rounded-md text-sm font-medium transition-colors
            ${
              currentPage === 1
                ? "bg-gray-100 text-gray-400 cursor-not-allowed dark:bg-gray-700 dark:text-gray-500"
                : "bg-gray-100 hover:bg-blue-600 hover:text-white dark:bg-gray-700 dark:hover:bg-blue-600"
            }`}
        >
          <HiChevronLeft className="h-4 w-4" />
          <span>Previous</span>
        </button>

        <button
          onClick={nextPage}
          disabled={currentPage === totalPages}
          className={`flex items-center gap-1 px-3 py-2 rounded-md text-sm font-medium transition-colors
            ${
              currentPage === totalPages
                ? "bg-gray-100 text-gray-400 cursor-not-allowed dark:bg-gray-700 dark:text-gray-500"
                : "bg-gray-100 hover:bg-blue-600 hover:text-white dark:bg-gray-700 dark:hover:bg-blue-600"
            }`}
        >
          <span>Next</span>
          <HiChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

// Simple pagination component for dashboard cards
export function SimplePagination({
  currentPage,
  totalPages,
  onPageChange,
  compact = false,
  showInfo = true,
}) {
  if (totalPages <= 1) return null;

  return (
    <div
      className={`flex items-center justify-between ${
        compact ? "mt-2" : "mt-4"
      } ${compact ? "text-xs" : "text-sm"}`}
    >
      {showInfo && (
        <span className="text-gray-600 dark:text-gray-400">
          Page {currentPage} of {totalPages}
        </span>
      )}

      <div className="flex gap-1 sm:gap-2">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={`flex items-center gap-1 px-2 py-1 sm:px-3 sm:py-2 rounded-md font-medium transition-all duration-300 ${
            currentPage === 1
              ? "bg-gray-100 text-gray-400 cursor-not-allowed"
              : "bg-gray-100 hover:bg-blue-600 hover:text-white hover:scale-105"
          } ${compact ? "text-xs" : "text-sm"}`}
        >
          <HiChevronLeft className={`${compact ? "h-3 w-3" : "h-4 w-4"}`} />
          <span className={compact ? "hidden sm:inline" : ""}>Prev</span>
        </button>

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={`flex items-center gap-1 px-2 py-1 sm:px-3 sm:py-2 rounded-md font-medium transition-all duration-300 ${
            currentPage === totalPages
              ? "bg-gray-100 text-gray-400 cursor-not-allowed"
              : "bg-gray-100 hover:bg-blue-600 hover:text-white hover:scale-105"
          } ${compact ? "text-xs" : "text-sm"}`}
        >
          <span className={compact ? "hidden sm:inline" : ""}>Next</span>
          <HiChevronRight className={`${compact ? "h-3 w-3" : "h-4 w-4"}`} />
        </button>
      </div>
    </div>
  );
}
