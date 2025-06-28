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

const ProductAlertCard = ({ compact = false }) => {
  const dispatch = useDispatch();
  const { lowStockAlerts, lowStockLoading, lowStockProducts } = useSelector(
    (state) => state.dashboard
  );

  useEffect(() => {
    dispatch(
      fetchLowStockAlerts({
        page: lowStockAlerts.page,
        limit: compact ? 3 : 5,
      })
    );
  }, [dispatch, lowStockAlerts.page, compact]);

  const handlePageChange = (newPage) => {
    dispatch(fetchLowStockAlerts({ page: newPage, limit: compact ? 5 : 10 }));
  };

  // Mock data for demonstration when backend is not available
  const mockLowStockProducts = [
    {
      id: 1,
      name: "Laptop Charger",
      status: "low-stock",
      quantity: 3,
    },
    {
      id: 2,
      name: "Wireless Mouse",
      status: "out-of-stock",
      quantity: 0,
    },
    {
      id: 3,
      name: "USB Cable",
      status: "low-stock",
      quantity: 5,
    },
  ];

  // Use lowStockAlerts.data if available, otherwise fall back to lowStockProducts or mock data
  const displayData =
    lowStockAlerts.data && lowStockAlerts.data.length > 0
      ? lowStockAlerts.data
      : lowStockProducts && lowStockProducts.length > 0
      ? lowStockProducts
      : mockLowStockProducts;

  return (
    <Card className="h-full relative cursor-pointer transition-all duration-300 ease-in-out hover:shadow-lg hover:scale-[1.02] hover:bg-blue-50 dark:hover:bg-gray-800">
      {lowStockLoading && <CardLoaderOverlay />}
      <CardHeader
        className={`flex flex-row items-center justify-between ${
          compact ? "p-2 sm:p-3 pb-1 sm:pb-2" : "p-4 sm:p-6"
        }`}
      >
        <CardTitle
          className={`transition-colors duration-300 hover:text-blue-600 dark:hover:text-blue-400 ${
            compact ? "text-xs sm:text-sm" : "text-sm sm:text-base"
          }`}
        >
          Low Stock Alerts
        </CardTitle>
        <Badge
          variant="danger"
          className={`transition-all duration-300 hover:scale-110 ${
            compact ? "text-xs px-1 sm:px-2 py-0.5 sm:py-1" : ""
          }`}
        >
          {lowStockLoading ? "..." : displayData.length} products
        </Badge>
      </CardHeader>

      <CardContent className={compact ? "p-2 sm:p-3 pt-0" : "p-4 sm:p-6"}>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead
                className={`transition-colors duration-300 hover:text-blue-600 dark:hover:text-blue-400 ${
                  compact ? "text-xs py-1 sm:py-2" : ""
                }`}
              >
                Product
              </TableHead>
              <TableHead
                className={`transition-colors duration-300 hover:text-blue-600 dark:hover:text-blue-400 ${
                  compact ? "text-xs py-1 sm:py-2" : ""
                }`}
              >
                Status
              </TableHead>
              <TableHead
                className={`transition-colors duration-300 hover:text-blue-600 dark:hover:text-blue-400 ${
                  compact ? "text-xs py-1 sm:py-2" : ""
                }`}
              >
                Qty
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {displayData.length > 0 ? (
              displayData.map((product) => (
                <TableRow
                  key={product.id}
                  className="cursor-pointer transition-all duration-300 hover:bg-blue-50 dark:hover:bg-gray-700 hover:scale-[1.01]"
                >
                  <TableCell
                    className={`font-medium text-gray-900 transition-colors duration-300 hover:text-blue-700 dark:hover:text-blue-300 truncate ${
                      compact ? "text-xs py-0.5 sm:py-1" : ""
                    }`}
                  >
                    {product.name}
                  </TableCell>
                  <TableCell className={compact ? "py-0.5 sm:py-1" : ""}>
                    <Badge
                      variant={
                        product.status === "out-of-stock" ? "danger" : "warning"
                      }
                      className={`transition-all duration-300 hover:scale-110 ${
                        compact ? "text-xs px-1 py-0.5" : ""
                      }`}
                    >
                      {product.status}
                    </Badge>
                  </TableCell>
                  <TableCell
                    className={`font-medium transition-colors duration-300 hover:text-blue-700 dark:hover:text-blue-300 ${
                      compact ? "text-xs py-0.5 sm:py-1" : ""
                    }`}
                  >
                    {product.quantity}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={3}
                  className={`text-center text-gray-500 transition-colors duration-300 hover:text-blue-600 dark:hover:text-blue-400 ${
                    compact ? "py-2 sm:py-3 text-xs" : "py-6"
                  }`}
                >
                  No low stock products found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        {/* Pagination - only show if we have real data with multiple pages */}
        {lowStockAlerts.totalPages > 1 &&
          lowStockAlerts.data &&
          lowStockAlerts.data.length > 0 && (
            <SimplePagination
              currentPage={lowStockAlerts.page}
              totalPages={lowStockAlerts.totalPages}
              onPageChange={handlePageChange}
              compact={compact}
              showInfo={!compact}
            />
          )}
      </CardContent>
    </Card>
  );
};

export default ProductAlertCard;
