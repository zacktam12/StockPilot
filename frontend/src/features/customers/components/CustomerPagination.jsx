import React from "react";
import { useDispatch } from "react-redux";
import { setCurrentPage } from "../../../store/slices/customerSlice";

const CustomerPagination = ({ pagination }) => {
  const dispatch = useDispatch();

  if (!pagination || pagination.pages <= 1) {
    return null;
  }

  return (
    <div className="flex justify-center">
      <div className="w-full flex items-center justify-between py-4">
        <p className="text-sm md:text-base text-gray-600 dark:text-gray-400">
          Showing
          <span className="font-semibold text-gray-900 dark:text-white">
            {pagination.page}
          </span>
          of
          <span className="font-semibold text-gray-900 dark:text-white">
            {pagination.pages}
          </span>
          pages
        </p>
        <div className="flex gap-2">
          <button
            onClick={() =>
              dispatch(setCurrentPage(Math.max(1, pagination.page - 1)))
            }
            disabled={pagination.page === 1}
            className={`flex items-center gap-1 px-3 py-2 rounded-md text-sm font-medium transition-colors
              ${
                pagination.page === 1
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed dark:bg-gray-700 dark:text-gray-500"
                  : "bg-gray-100 hover:bg-blue-600 hover:text-white dark:bg-gray-700 dark:hover:bg-blue-600"
              }`}
          >
            Previous
          </button>
          <button
            onClick={() =>
              dispatch(
                setCurrentPage(
                  Math.min(pagination.pages, pagination.page + 1)
                )
              )
            }
            disabled={pagination.page === pagination.pages}
            className={`flex items-center gap-1 px-3 py-2 rounded-md text-sm font-medium transition-colors
              ${
                pagination.page === pagination.pages
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed dark:bg-gray-700 dark:text-gray-500"
                  : "bg-gray-100 hover:bg-blue-600 hover:text-white dark:bg-gray-700 dark:hover:bg-blue-600"
              }`}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default CustomerPagination;
