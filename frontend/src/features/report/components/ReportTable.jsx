import React from "react";
import { format } from "date-fns";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../components/shared/Card";

const ReportTable = ({ currentReport }) => {
  if (!currentReport) return null;

  const renderTableRow = (item, index) => {
    switch (currentReport.title) {
      case "Daily Sales Report":
        return (
          <tr key={index}>
            <td className="px-6 py-4 whitespace-nowrap">
              {format(new Date(item.created_at), "yyyy-MM-dd")}
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
              {item.id}
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
              {item.customer?.name || item.customer_name || "Unknown"}
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
              ${Number(item.total_amount).toFixed(2)}
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
              <span
                className={`px-2 py-1 text-xs rounded-full ${
                  item.status === "completed"
                    ? "bg-green-100 text-green-800"
                    : "bg-yellow-100 text-yellow-800"
                }`}
              >
                {item.status}
              </span>
            </td>
          </tr>
        );

      case "Inventory Status Report":
        return (
          <tr key={index}>
            <td className="px-6 py-4 whitespace-nowrap">
              {item.name}
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
              {item.category_name || "Uncategorized"}
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
              {item.quantity}
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
              ${Number(item.price).toFixed(2)}
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
              {item.quantity < 10 ? (
                <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800">
                  Low Stock
                </span>
              ) : (
                <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                  In Stock
                </span>
              )}
            </td>
          </tr>
        );

      case "Purchase Orders Report":
        return (
          <tr key={index}>
            <td className="px-6 py-4 whitespace-nowrap">
              {format(new Date(item.created_at), "yyyy-MM-dd")}
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
              {item.id}
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
              {item.supplier_name || "Unknown"}
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
              ${Number(item.total_amount).toFixed(2)}
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
              <span
                className={`px-2 py-1 text-xs rounded-full ${
                  item.status === "completed"
                    ? "bg-green-100 text-green-800"
                    : "bg-yellow-100 text-yellow-800"
                }`}
              >
                {item.status}
              </span>
            </td>
          </tr>
        );

      case "Monthly Revenue Report":
        return (
          <tr key={index}>
            <td className="px-6 py-4 whitespace-nowrap">
              {item.month}
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
              ${Number(item.total).toFixed(2)}
            </td>
          </tr>
        );

      case "Top Selling Products Report":
        return (
          <tr key={index}>
            <td className="px-6 py-4 whitespace-nowrap">
              {item.product_name}
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
              {item.total_sold}
            </td>
          </tr>
        );

      case "Low Stock Items Report":
        return (
          <tr key={index}>
            <td className="px-6 py-4 whitespace-nowrap">
              {item.name}
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
              {item.category_name || "Uncategorized"}
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
              {item.quantity}
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
              <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800">
                Low Stock
              </span>
            </td>
          </tr>
        );

      case "Inventory Valuation Report":
        return (
          <tr key={index}>
            <td className="px-6 py-4 whitespace-nowrap">
              {item.name}
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
              {item.category_name || "Uncategorized"}
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
              {item.quantity}
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
              ${item.price.toFixed(2)}
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
              ${item.total_value.toFixed(2)}
            </td>
          </tr>
        );

      case "Supplier Analysis Report":
        return (
          <tr key={index}>
            <td className="px-6 py-4 whitespace-nowrap">
              {item.supplier_name}
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
              {item.total_orders}
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
              ${item.total_spent.toFixed(2)}
            </td>
          </tr>
        );

      case "Cost Analysis Report":
        return (
          <tr key={index}>
            <td className="px-6 py-4 whitespace-nowrap">
              {item.product_name}
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
              {item.total_purchased}
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
              ${item.total_cost.toFixed(2)}
            </td>
          </tr>
        );

      default:
        return null;
    }
  };

  return (
    <Card className="mt-6 bg-white text-gray-800 dark:bg-gray-800 dark:text-gray-200">
      <CardHeader className="flex flex-row items-center justify-between bg-white dark:bg-gray-800">
        <CardTitle className="text-gray-800 dark:text-white">
          {currentReport.title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 bg-white text-gray-800 dark:bg-gray-800 dark:text-gray-200">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                {currentReport.columns.map((column, index) => (
                  <th
                    key={index}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-200 uppercase tracking-wider"
                  >
                    {column}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
              {currentReport.data.map((item, index) => renderTableRow(item, index))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};

export default ReportTable;
