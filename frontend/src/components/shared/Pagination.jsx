// src/components/shared/Pagination.jsx
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { setCurrentPage as setProductCurrentPage } from "../../store/slices/productSlice";
import { setCurrentPage as setUserCurrentPage } from "../../store/slices/userSlice";
import { setCurrentPage as setCategoryCurrentPage } from "../../store/slices/categorySlice";
import { setCurrentPage as setSupplierCurrentPage } from "../../store/slices/supplierSlice";
import { setCurrentPage as setSaleCurrentPage } from "../../store/slices/salesSlice";
import { setCurrentPage as setPurchaseCurrentPage } from "../../store/slices/purchaseSlice";
import { setCurrentPage as setCustomerCurrentPage } from "../../store/slices/customerSlice";
import {
  setActivitiesCurrentPage,
  setLowStockAlertsCurrentPage,
} from "../../store/slices/dashboardSlice";

export default function Pagination({ sliceName = "product" }) {
  const dispatch = useDispatch();

  // Get the appropriate slice state based on sliceName
  const getSliceState = (state) => {
    switch (sliceName) {
      case "staff":
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
      case "dashboard-activities":
        return state.dashboard.activities;
      case "dashboard-alerts":
        return state.dashboard.lowStockAlerts;
      default:
        return state.product;
    }
  };

  // Get the appropriate setCurrentPage action based on sliceName
  const getSetCurrentPageAction = (page) => {
    switch (sliceName) {
      case "staff":
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
      case "dashboard-activities":
        return setActivitiesCurrentPage(page);
      case "dashboard-alerts":
        return setLowStockAlertsCurrentPage(page);
      default:
        return setProductCurrentPage(page);
    }
  };

  const sliceState = useSelector(getSliceState);

  // Handle different slice structures
  let currentPage, totalPages, totalItems, itemsPerPage;

  if (sliceName === "sale") {
    // Sales slice has pagination nested under pagination object
    currentPage = sliceState.pagination?.currentPage || 1;
    totalPages = sliceState.pagination?.totalPages || 0;
    totalItems = sliceState.pagination?.totalItems || 0;
    itemsPerPage = sliceState.pagination?.itemsPerPage || 5;
  } else if (
    sliceName === "dashboard-activities" ||
    sliceName === "dashboard-alerts"
  ) {
    // Dashboard slices have pagination properties directly on the state
    currentPage = sliceState.page || 1;
    totalPages = sliceState.totalPages || 0;
    totalItems = sliceState.totalItems || 0;
    itemsPerPage = sliceState.limit || 10;
  } else {
    // Other slices have pagination properties directly on the state
    currentPage = sliceState.currentPage || 1;
    totalPages = sliceState.totalPages || 0;
    totalItems = sliceState.totalItems || 0;
    itemsPerPage = sliceState.itemsPerPage || 10;
  }

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
    <div className="w-full flex items-center justify-between py-6">
      <p className="text-sm text-gray-600 dark:text-gray-400">
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

      <div className="flex items-center gap-2">
        {/* Previous Page Arrow */}
        <button
          onClick={prevPage}
          disabled={currentPage === 1}
          className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 ${
            currentPage === 1
              ? "bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed"
              : "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-300 dark:hover:border-gray-500 hover:scale-105 shadow-soft"
          }`}
          aria-label="Previous page"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        {/* Page Indicator */}
        <div className="flex items-center gap-1 px-3 py-2 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <span className="text-sm font-medium text-gray-900 dark:text-white">
            {currentPage}
          </span>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            of {totalPages}
          </span>
        </div>

        {/* Next Page Arrow */}
        <button
          onClick={nextPage}
          disabled={currentPage === totalPages}
          className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 ${
            currentPage === totalPages
              ? "bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed"
              : "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-300 dark:hover:border-gray-500 hover:scale-105 shadow-soft"
          }`}
          aria-label="Next page"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}

// Floating pagination component for table edges
export function FloatingPagination({ sliceName = "product" }) {
  const dispatch = useDispatch();

  // Get the appropriate slice state based on sliceName
  const getSliceState = (state) => {
    switch (sliceName) {
      case "staff":
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
      case "dashboard-activities":
        return state.dashboard.activities;
      case "dashboard-alerts":
        return state.dashboard.lowStockAlerts;
      default:
        return state.product;
    }
  };

  // Get the appropriate setCurrentPage action based on sliceName
  const getSetCurrentPageAction = (page) => {
    switch (sliceName) {
      case "staff":
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
      case "dashboard-activities":
        return setActivitiesCurrentPage(page);
      case "dashboard-alerts":
        return setLowStockAlertsCurrentPage(page);
      default:
        return setProductCurrentPage(page);
    }
  };

  const sliceState = useSelector(getSliceState);

  // Handle different slice structures
  let currentPage, totalPages;

  if (sliceName === "sale") {
    currentPage = sliceState.pagination?.currentPage || 1;
    totalPages = sliceState.pagination?.totalPages || 0;
  } else if (
    sliceName === "dashboard-activities" ||
    sliceName === "dashboard-alerts"
  ) {
    currentPage = sliceState.page || 1;
    totalPages = sliceState.totalPages || 0;
  } else {
    currentPage = sliceState.currentPage || 1;
    totalPages = sliceState.totalPages || 0;
  }

  const nextPage = () => {
    console.log("FloatingPagination Next page clicked:", {
      currentPage,
      totalPages,
      canGoNext: currentPage < totalPages,
    });
    if (currentPage < totalPages) {
      dispatch(getSetCurrentPageAction(currentPage + 1));
    }
  };

  const prevPage = () => {
    console.log("FloatingPagination Prev page clicked:", {
      currentPage,
      totalPages,
      canGoPrev: currentPage > 1,
    });
    if (currentPage > 1) {
      dispatch(getSetCurrentPageAction(currentPage - 1));
    }
  };

  console.log("FloatingPagination state:", {
    currentPage,
    totalPages,
    sliceName,
  });

  if (totalPages <= 1) return null;

  return (
    <div className="relative w-full h-full">
      {/* Left Floating Arrow */}
      <div className="absolute left-4 top-1/2 transform -translate-y-1/2 z-20 group">
        <button
          onClick={prevPage}
          disabled={currentPage === 1}
          className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 shadow-lg ${
            currentPage === 1
              ? "bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed opacity-50"
              : "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-300 dark:hover:border-gray-500 hover:scale-110 shadow-xl group-hover:translate-x-1"
          }`}
          aria-label="Previous page"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        {/* Tooltip */}
        <div className="absolute left-12 top-1/2 transform -translate-y-1/2 bg-gray-900 dark:bg-gray-800 text-white px-2 py-1 rounded-lg text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none whitespace-nowrap">
          Previous
        </div>
      </div>

      {/* Right Floating Arrow */}
      <div className="absolute right-4 top-1/2 transform -translate-y-1/2 z-20 group">
        <button
          onClick={nextPage}
          disabled={currentPage === totalPages}
          className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 shadow-lg ${
            currentPage === totalPages
              ? "bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed opacity-50"
              : "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-300 dark:hover:border-gray-500 hover:scale-110 shadow-xl group-hover:-translate-x-1"
          }`}
          aria-label="Next page"
        >
          <ChevronRight className="w-5 h-5" />
        </button>

        {/* Tooltip */}
        <div className="absolute right-12 top-1/2 transform -translate-y-1/2 bg-gray-900 dark:bg-gray-800 text-white px-2 py-1 rounded-lg text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none whitespace-nowrap">
          Next
        </div>
      </div>

      {/* Page Indicator (Bottom center of table) */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-20">
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-full px-3 py-1 shadow-lg">
          <span className="text-xs font-medium text-gray-900 dark:text-white">
            {currentPage}
          </span>
          <span className="text-xs text-gray-500 dark:text-gray-400 mx-1">
            /
          </span>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {totalPages}
          </span>
        </div>
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
        <span className="text-gray-600 dark:text-gray-400 font-medium">
          Page {currentPage} of {totalPages}
        </span>
      )}

      <div className="flex gap-1 sm:gap-2">
        {/* Previous Page Arrow */}
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200 ${
            currentPage === 1
              ? "bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed"
              : "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-300 dark:hover:border-gray-500 hover:scale-105 shadow-soft"
          }`}
          aria-label="Previous page"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {/* Next Page Arrow */}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200 ${
            currentPage === totalPages
              ? "bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed"
              : "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-300 dark:hover:border-gray-500 hover:scale-105 shadow-soft"
          }`}
          aria-label="Next page"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
