// src/features/dashboard/components/ProductAlertCard.jsx
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../components/shared/Card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../components/shared/Table";
import Badge from "../../../components/shared/Badge";
import CardLoaderOverlay from "../../../components/shared/CardLoaderOverlay";
import { SimplePagination } from "../../../components/shared/Pagination";
import { fetchLowStockAlerts } from "../../../store/slices/dashboardSlice";
import { AlertTriangle, Package, TrendingDown } from "lucide-react";

const ProductAlertCard = ({ compact = false }) => {
  const dispatch = useDispatch();
  const { lowStockAlerts, lowStockLoading, lowStockProducts } = useSelector(
    (state) => state.dashboard
  );

  useEffect(() => {
    dispatch(
      fetchLowStockAlerts({
        page: lowStockAlerts.page,
        limit: compact ? 3 : 6,
      })
    );
  }, [dispatch, lowStockAlerts.page, compact]);

  const handlePageChange = (newPage) => {
    dispatch(fetchLowStockAlerts({ page: newPage, limit: compact ? 6 : 10 }));
  };

  // Use only real data from the API
  const displayData = lowStockAlerts.data || [];

  const getStatusColor = (status) => {
    switch (status) {
      case "out-of-stock":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 border-red-200 dark:border-red-800";
      case "low-stock":
        return "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300 border-amber-200 dark:border-amber-800";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300 border-gray-200 dark:border-gray-800";
    }
  };

  const getQuantityColor = (quantity, status) => {
    if (status === "out-of-stock") {
      return "text-red-600 dark:text-red-400 font-bold";
    }
    if (quantity <= 5) {
      return "text-amber-600 dark:text-amber-400 font-semibold";
    }
    return "text-gray-900 dark:text-white";
  };

  return (
    <div className="h-full">
      {lowStockLoading && <CardLoaderOverlay />}

      <div className="space-y-4">
        {lowStockLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto mb-3"></div>
              <div className="text-gray-600 dark:text-gray-400 text-sm font-medium">
                Loading alerts...
              </div>
            </div>
          </div>
        ) : displayData && displayData.length > 0 ? (
          displayData.map((product) => (
            <div
              key={product.id}
              className="relative p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 transition-all duration-300 hover:shadow-medium hover:scale-[1.01] group"
            >
              <div className="flex items-center space-x-4">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center">
                    <Package className="w-5 h-5 text-red-600 dark:text-red-400" />
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                      {product.name}
                    </h4>
                    <div className="flex items-center space-x-2">
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                          product.status
                        )}`}
                      >
                        {product.status === "out-of-stock" ? (
                          <AlertTriangle className="w-3 h-3 mr-1" />
                        ) : (
                          <TrendingDown className="w-3 h-3 mr-1" />
                        )}
                        {product.status.replace("-", " ")}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 text-sm">
                      <div className="flex items-center space-x-1 text-gray-600 dark:text-gray-400">
                        <span>Quantity:</span>
                        <span
                          className={`font-semibold ${getQuantityColor(
                            product.quantity,
                            product.status
                          )}`}
                        >
                          {product.quantity}
                        </span>
                      </div>
                      {product.category && (
                        <div className="text-gray-500 dark:text-gray-400">
                          {product.category}
                        </div>
                      )}
                    </div>

                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {product.status === "out-of-stock"
                        ? "Restock needed"
                        : "Low inventory"}
                    </div>
                  </div>
                </div>
              </div>

              {/* Subtle hover effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent to-red-50/30 dark:to-red-900/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
            </div>
          ))
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <Package className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              All Stock Levels Good
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              No low stock alerts at the moment
            </p>
          </div>
        )}
      </div>

      {/* Enhanced Pagination */}
      {lowStockAlerts.totalPages > 1 &&
        lowStockAlerts.data &&
        lowStockAlerts.data.length > 0 && (
          <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
            <SimplePagination
              currentPage={lowStockAlerts.page}
              totalPages={lowStockAlerts.totalPages}
              onPageChange={handlePageChange}
              compact={compact}
              showInfo={!compact}
            />
          </div>
        )}
    </div>
  );
};

export default ProductAlertCard;
