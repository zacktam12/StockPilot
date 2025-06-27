// src/features/dashboard/components/ProductAlertCard.jsx
import React from "react";
import { useSelector } from "react-redux";
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

const ProductAlertCard = ({ compact = false }) => {
  const { lowStockProducts, loading } = useSelector((state) => state.dashboard);

  return (
    <Card className="h-full relative cursor-pointer transition-all duration-300 ease-in-out hover:shadow-lg hover:scale-[1.02] hover:bg-blue-50 dark:hover:bg-gray-800">
      {loading && <CardLoaderOverlay />}
      <CardHeader
        className={`flex flex-row items-center justify-between ${
          compact ? "p-3 pb-2" : "p-6"
        }`}
      >
        <CardTitle
          className={`transition-colors duration-300 hover:text-blue-600 dark:hover:text-blue-400 ${
            compact ? "text-sm" : "text-base"
          }`}
        >
          Low Stock Alerts
        </CardTitle>
        <Badge
          variant="danger"
          className={`transition-all duration-300 hover:scale-110 ${
            compact ? "text-xs px-2 py-1" : ""
          }`}
        >
          {loading ? "..." : lowStockProducts.length} products
        </Badge>
      </CardHeader>

      <CardContent className={compact ? "p-3 pt-0" : "p-6"}>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead
                className={`transition-colors duration-300 hover:text-blue-600 dark:hover:text-blue-400 ${
                  compact ? "text-xs py-2" : ""
                }`}
              >
                Product
              </TableHead>
              <TableHead
                className={`transition-colors duration-300 hover:text-blue-600 dark:hover:text-blue-400 ${
                  compact ? "text-xs py-2" : ""
                }`}
              >
                Status
              </TableHead>
              <TableHead
                className={`transition-colors duration-300 hover:text-blue-600 dark:hover:text-blue-400 ${
                  compact ? "text-xs py-2" : ""
                }`}
              >
                Qty
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {lowStockProducts.length > 0 ? (
              lowStockProducts.slice(0, compact ? 4 : 8).map((product) => (
                <TableRow
                  key={product.id}
                  className="cursor-pointer transition-all duration-300 hover:bg-blue-50 dark:hover:bg-gray-700 hover:scale-[1.01]"
                >
                  <TableCell
                    className={`font-medium text-gray-900 transition-colors duration-300 hover:text-blue-700 dark:hover:text-blue-300 ${
                      compact ? "text-xs py-1" : ""
                    }`}
                  >
                    {product.name}
                  </TableCell>
                  <TableCell className={compact ? "py-1" : ""}>
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
                      compact ? "text-xs py-1" : ""
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
                    compact ? "py-3 text-xs" : "py-6"
                  }`}
                >
                  No low stock products found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default ProductAlertCard;
