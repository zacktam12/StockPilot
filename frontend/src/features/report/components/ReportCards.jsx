import React from "react";
import { TrendingUp, Package, ShoppingCart } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../components/shared/Card";
import Button from "../../../components/shared/Button";

const ReportCards = ({ onGenerateReport, loading }) => {
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

  return (
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
                  onClick={() => onGenerateReport(option.id)}
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
  );
};

export default ReportCards;
