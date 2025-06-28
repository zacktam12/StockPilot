import React, { useState } from "react";
import { format } from "date-fns";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../components/shared/Card";
import { TrendingUp, Package, ShoppingCart, Download } from "lucide-react";
import Button from "../../../components/shared/Button";
import LoadingOverlay from "../../../components/shared/LoadingOverlay";
import { API_URL } from "../../../config";

const ReportsPage = () => {
  const [loading, setLoading] = useState(null);
  const [isLoading, setIsLoading] = useState(false); // new
  const [currentReport, setCurrentReport] = useState(null);
  const generateReport = async (reportType) => {
    setLoading(reportType);
    setIsLoading(true); // show overlay
    try {
      let endpoint, columns, title;

      switch (reportType) {
        case "daily-sales":
          endpoint = `${API_URL}/sales-orders`;
          columns = ["Date", "Order ID", "Customer", "Amount", "Status"];
          title = "Daily Sales Report";
          break;

        case "inventory":
          endpoint = `${API_URL}/reports/inventory`;
          columns = ["Product Name", "Category", "Quantity", "Price", "Status"];
          title = "Inventory Status Report";
          break;

        case "purchase-orders":
          endpoint = `${API_URL}/reports/purchases`;
          columns = ["Date", "Order ID", "Supplier", "Amount", "Status"];
          title = "Purchase Orders Report";
          break;

        case "monthly-revenue":
          endpoint = `${API_URL}/reports/monthly-revenue`;
          columns = ["Month", "Total Revenue"];
          title = "Monthly Revenue Report";
          break;

        case "top-products":
          endpoint = `${API_URL}/reports/top-products`;
          columns = ["Product Name", "Units Sold"];
          title = "Top Selling Products Report";
          break;

        case "low-stock":
          endpoint = `${API_URL}/reports/low-stock`;
          columns = ["Product Name", "Category", "Quantity", "Status"];
          title = "Low Stock Items Report";
          break;

        case "inventory-value":
          endpoint = `${API_URL}/reports/inventory-value`;
          columns = [
            "Product Name",
            "Category",
            "Quantity",
            "Price",
            "Total Value",
          ];
          title = "Inventory Valuation Report";
          break;

        case "supplier-analysis":
          endpoint = `${API_URL}/reports/supplier-analysis`;
          columns = ["Supplier", "Total Orders", "Total Spent"];
          title = "Supplier Analysis Report";
          break;

        case "cost-analysis":
          endpoint = `${API_URL}/reports/cost-analysis`;
          columns = ["Product Name", "Total Purchased", "Total Cost"];
          title = "Cost Analysis Report";
          break;

        default:
          throw new Error("Invalid report type");
      }

      // Replace the existing fetch call with this enhanced version
      const response = await fetch(endpoint);
      const contentType = response.headers.get("content-type");

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Server error:", errorText);
        throw new Error(
          `HTTP error ${response.status}: ${response.statusText}`
        );
      }

      if (!contentType || !contentType.includes("application/json")) {
        const errorText = await response.text();
        console.error("Expected JSON but got:", errorText);
        throw new Error("Received non-JSON response");
      }

      const data = await response.json();
      setCurrentReport({ title, data, columns });
    } catch (error) {
      console.error("Error generating report:", error.message);
      alert(`Failed to generate report: ${error.message}`);
    } finally {
      setLoading(null);
      setIsLoading(false); // hide overlay
    }
  };

  const downloadPDF = () => {
    if (!currentReport) return;

    const doc = new jsPDF();
    const title = currentReport.title;
    const date = format(new Date(), "yyyy-MM-dd HH:mm:ss");

    doc.setFontSize(18);
    doc.text(title, 14, 20);
    doc.setFontSize(12);
    doc.text(`Generated on: ${date}`, 14, 30);

    autoTable(doc, {
      head: [currentReport.columns],
      body: currentReport.data.map((item) => {
        switch (currentReport.title) {
          case "Daily Sales Report":
            return [
              format(new Date(item.created_at), "yyyy-MM-dd"),
              item.id,
              item.customer?.name || item.customer_name || "Unknown",
              `$${Number(item.total_amount).toFixed(2)}`,
              item.status,
            ];
          case "Inventory Status Report":
            return [
              item.name,
              item.category_name || "Uncategorized",
              item.quantity,
              `$${Number(item.price).toFixed(2)}`,
              item.quantity < 10 ? "Low Stock" : "In Stock",
            ];
          case "Purchase Orders Report":
            return [
              format(new Date(item.created_at), "yyyy-MM-dd"),
              item.id,
              item.supplier_name || "Unknown",
              `$${Number(item.total_amount).toFixed(2)}`,
              item.status,
            ];
          case "Monthly Revenue Report":
            return [
              format(new Date(item.month), "yyyy-MM"),
              `$${Number(item.total).toFixed(2)}`,
            ];
          case "Top Selling Products Report":
            return [item.product_name, item.total_sold];
          case "Low Stock Items Report":
            return [
              item.name,
              item.category_name || "Uncategorized",
              item.quantity,
              "Low Stock",
            ];
          case "Inventory Valuation Report":
            return [
              item.name,
              item.category_name || "Uncategorized",
              item.quantity,
              `$${item.price.toFixed(2)}`,
              `$${item.total_value.toFixed(2)}`,
            ];
          case "Supplier Analysis Report":
            return [
              item.supplier_name,
              item.total_orders,
              `$${item.total_spent.toFixed(2)}`,
            ];
          case "Cost Analysis Report":
            return [
              item.product_name,
              item.total_purchased,
              `$${item.total_cost.toFixed(2)}`,
            ];
          default:
            return [];
        }
      }),

      startY: 40,
    });

    doc.save(`${title.toLowerCase().replace(/\s+/g, "-")}-${date}.pdf`);
  };

  const reports = [
    {
      title: "Sales Reports",
      description: "View detailed sales analytics and trends",
      icon: <TrendingUp size={24} className="text-indigo-600" />,
      options: [
        { name: "Daily Sales", id: "daily-sales" },
        { name: "Monthly Revenue", id: "monthly-revenue" },
        { name: "Top Selling Products", id: "top-products" },
      ],
    },
    {
      title: "Inventory Reports",
      description: "Monitor stock levels and product movement",
      icon: <Package size={24} className="text-blue-600" />,
      options: [
        { name: "Stock Status", id: "inventory" },
        { name: "Low Stock Items", id: "low-stock" },
        { name: "Inventory Valuation", id: "inventory-value" },
      ],
    },
    {
      title: "Purchase Reports",
      description: "Track purchase orders and supplier performance",
      icon: <ShoppingCart size={24} className="text-orange-600" />,
      options: [
        { name: "Purchase Orders", id: "purchase-orders" },
        { name: "Supplier Analysis", id: "supplier-analysis" },
        { name: "Cost Analysis", id: "cost-analysis" },
      ],
    },
  ];

  if (isLoading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
        <LoadingOverlay title="Reports" description="Loading report data..." />
      </div>
    );
  }

  return (
    <div className="space-y-6 min-h-screen bg-white text-gray-800 dark:bg-gray-900 dark:text-gray-200">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
          Reports
        </h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reports.map((report, index) => (
          <Card
            key={index}
            className="hover:shadow-lg transition-shadow duration-200 bg-white text-gray-800 dark:bg-gray-800 dark:text-gray-200"
          >
            <CardHeader className="flex flex-row items-center gap-4 bg-white dark:bg-gray-800">
              <div className="p-2 rounded-lg bg-gray-50 dark:bg-gray-900">
                {report.icon}
              </div>
              <div>
                <CardTitle className="text-lg text-gray-800 dark:text-white">
                  {report.title}
                </CardTitle>
                <p className="text-sm text-gray-500 dark:text-gray-300 mt-1">
                  {report.description}
                </p>
              </div>
            </CardHeader>

            <CardContent>
              <div className="space-y-2">
                {report.options.map((option) => (
                  <Button
                    key={option.id}
                    variant="outline"
                    size="sm"
                    className="w-full justify-start"
                    onClick={() => generateReport(option.id)}
                    isLoading={loading === option.id}
                  >
                    {option.name}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {currentReport && (
        <Card className="mt-6 bg-white text-gray-800 dark:bg-gray-800 dark:text-gray-200">
          <CardHeader className="flex flex-row items-center justify-between bg-white dark:bg-gray-800">
            <CardTitle className="text-gray-800 dark:text-white">
              {currentReport.title}
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              icon={<Download size={16} />}
              onClick={downloadPDF}
            >
              Download PDF
            </Button>
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
                  {currentReport.data.map((item, index) => (
                    <tr key={index}>
                      {currentReport.title === "Daily Sales Report" && (
                        <>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {format(new Date(item.created_at), "yyyy-MM-dd")}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {item.id}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {item.customer?.name ||
                              item.customer_name ||
                              "Unknown"}
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
                        </>
                      )}
                      {currentReport.title === "Inventory Status Report" && (
                        <>
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
                        </>
                      )}
                      {currentReport.title === "Purchase Orders Report" && (
                        <>
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
                        </>
                      )}
                      {currentReport.title === "Monthly Revenue Report" && (
                        <>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {item.month}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            ${Number(item.total).toFixed(2)}
                          </td>
                        </>
                      )}
                      {currentReport.title ===
                        "Top Selling Products Report" && (
                        <>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {item.product_name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {item.total_sold}
                          </td>
                        </>
                      )}
                      {currentReport.title === "Low Stock Items Report" && (
                        <>
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
                        </>
                      )}
                      {currentReport.title === "Inventory Valuation Report" && (
                        <>
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
                        </>
                      )}
                      {currentReport.title === "Supplier Analysis Report" && (
                        <>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {item.supplier_name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {item.total_orders}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            ${item.total_spent.toFixed(2)}
                          </td>
                        </>
                      )}
                      {currentReport.title === "Cost Analysis Report" && (
                        <>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {item.product_name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {item.total_purchased}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            ${item.total_cost.toFixed(2)}
                          </td>
                        </>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ReportsPage;
