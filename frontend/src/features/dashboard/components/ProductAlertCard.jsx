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

const ProductAlertCard = () => {
  const { lowStockProducts, loading } = useSelector((state) => state.dashboard);

  return (
    <Card className="h-full relative">
      {loading && <CardLoaderOverlay />}
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Low Stock Alerts</CardTitle>
        <Badge variant="danger">
          {loading ? "..." : lowStockProducts.length} products
        </Badge>
      </CardHeader>

      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Quantity</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {lowStockProducts.length > 0 ? (
              lowStockProducts.map((product) => (
                <TableRow key={product.id}>
                  <TableCell className="font-medium text-gray-900">
                    {product.name}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        product.status === "out-of-stock" ? "danger" : "warning"
                      }
                    >
                      {product.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-medium">
                    {product.quantity}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={3}
                  className="text-center py-6 text-gray-500"
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
