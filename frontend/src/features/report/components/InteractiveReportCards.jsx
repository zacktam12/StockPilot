import React, { useState } from "react";
import { 
  TrendingUp, 
  Package, 
  ShoppingCart, 
  DollarSign,
  AlertTriangle,
  BarChart3,
  PieChart,
  Activity,
  Zap,
  Star,
  ArrowUp,
  ArrowDown,
  Clock
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/shared/Card";
import Button from "../../../components/shared/Button";
// Using CSS animations instead of framer-motion

const InteractiveReportCards = ({ onGenerateReport, loading, currentReport }) => {
  const [expandedCard, setExpandedCard] = useState(null);

  const reportCategories = [
    {
      id: "sales",
      title: "Sales Analytics",
      description: "Comprehensive sales performance and revenue insights",
      icon: <TrendingUp size={28} className="text-white" />,
      gradient: "from-blue-500 to-blue-600",
      bgGradient: "from-blue-50 to-blue-100",
      reports: [
        { 
          id: "daily-sales", 
          name: "Daily Sales Report", 
          description: "Daily sales performance with customer insights",
          icon: <BarChart3 size={16} />,
          metrics: ["Revenue", "Orders", "Customers"],
          color: "blue"
        },
        { 
          id: "monthly-revenue", 
          name: "Monthly Revenue", 
          description: "Monthly revenue trends and growth analysis",
          icon: <TrendingUp size={16} />,
          metrics: ["Growth %", "Trends", "Forecasting"],
          color: "green"
        },
        { 
          id: "top-products", 
          name: "Top Products", 
          description: "Best performing products and sales leaders",
          icon: <Star size={16} />,
          metrics: ["Units Sold", "Revenue", "Growth"],
          color: "purple"
        }
      ]
    },
    {
      id: "inventory",
      title: "Inventory Management",
      description: "Stock levels, valuation, and inventory optimization",
      icon: <Package size={28} className="text-white" />,
      gradient: "from-green-500 to-green-600",
      bgGradient: "from-green-50 to-green-100",
      reports: [
        { 
          id: "inventory", 
          name: "Stock Status", 
          description: "Current inventory levels and status overview",
          icon: <Package size={16} />,
          metrics: ["Total Items", "Categories", "Value"],
          color: "green"
        },
        { 
          id: "low-stock", 
          name: "Low Stock Alerts", 
          description: "Items requiring immediate attention",
          icon: <AlertTriangle size={16} />,
          metrics: ["Critical Items", "Reorder Points", "Urgency"],
          color: "red"
        },
        { 
          id: "inventory-value", 
          name: "Inventory Valuation", 
          description: "Total inventory value and category breakdown",
          icon: <DollarSign size={16} />,
          metrics: ["Total Value", "Category Value", "Trends"],
          color: "blue"
        }
      ]
    },
    {
      id: "purchases",
      title: "Purchase Analytics",
      description: "Supplier performance and procurement insights",
      icon: <ShoppingCart size={28} className="text-white" />,
      gradient: "from-orange-500 to-orange-600",
      bgGradient: "from-orange-50 to-orange-100",
      reports: [
        { 
          id: "purchase-orders", 
          name: "Purchase Orders", 
          description: "Purchase order tracking and status",
          icon: <ShoppingCart size={16} />,
          metrics: ["Total Orders", "Amount", "Status"],
          color: "orange"
        },
        { 
          id: "supplier-analysis", 
          name: "Supplier Analysis", 
          description: "Supplier performance and relationship insights",
          icon: <Activity size={16} />,
          metrics: ["Performance", "Cost Analysis", "Ratings"],
          color: "purple"
        },
        { 
          id: "cost-analysis", 
          name: "Cost Analysis", 
          description: "Product cost trends and optimization opportunities",
          icon: <PieChart size={16} />,
          metrics: ["Cost Trends", "Savings", "Optimization"],
          color: "green"
        }
      ]
    }
  ];

  const getStatusIcon = (reportId) => {
    if (currentReport && currentReport.type === reportId) {
      return <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>;
    }
    return null;
  };

  const getLoadingState = (reportId) => {
    return loading === reportId;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {reportCategories.map((category, categoryIndex) => (
        <div
          key={category.id}
          className="relative animate-fade-in"
          style={{ animationDelay: `${categoryIndex * 0.1}s` }}
        >
          <Card 
            className={`group relative overflow-hidden transition-all duration-300 cursor-pointer ${
              expandedCard === category.id ? 'shadow-xl scale-[1.02]' : ''
            }`}
          >
            
            {/* Status Indicator */}
            {getStatusIcon(category.id) && (
              <div className="absolute top-4 right-4 z-10">
                {getStatusIcon(category.id)}
              </div>
            )}

            <CardHeader className="relative z-10">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-xl bg-gradient-to-br ${category.gradient} shadow-medium`}>
                  {category.icon}
                </div>
                <div className="flex-1">
                  <CardTitle className="text-lg font-bold text-gray-900 dark:text-white">
                    {category.title}
                  </CardTitle>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {category.description}
                  </p>
                </div>
              </div>
            </CardHeader>

            <CardContent className="relative z-10">
              <div className="space-y-3">
                {category.reports.map((report, reportIndex) => (
                  <div
                    key={report.id}
                    className="group/report animate-slide-up"
                    style={{ animationDelay: `${reportIndex * 0.05}s` }}
                  >
                    <Button
                      variant="outline"
                      size="sm"
                      className={`w-full justify-start transition-all duration-200 ${
                        getLoadingState(report.id) ? 'animate-pulse' : ''
                      }`}
                      onClick={() => {
                        console.log("Report card clicked:", report.id, report.name);
                        onGenerateReport(report.id);
                      }}
                      isLoading={getLoadingState(report.id)}
                      disabled={getLoadingState(report.id)}
                    >
                      <div className="flex items-center gap-3 w-full">
                        <div className={`p-1.5 rounded-lg ${
                          report.color === 'blue' ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' :
                          report.color === 'green' ? 'bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400' :
                          report.color === 'red' ? 'bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400' :
                          report.color === 'orange' ? 'bg-orange-100 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400' :
                          report.color === 'purple' ? 'bg-purple-100 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400' :
                          'bg-gray-100 dark:bg-gray-900/20 text-gray-600 dark:text-gray-400'
                        }`}>
                          {report.icon}
                        </div>
                        <div className="flex-1 text-left">
                          <div className="font-medium text-gray-900 dark:text-white">
                            {report.name}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {report.description}
                          </div>
                        </div>
                        {getLoadingState(report.id) && (
                          <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                        )}
                      </div>
                    </Button>

                    {/* Report Metrics Preview */}
                    <div className="mt-2 flex flex-wrap gap-1">
                      {report.metrics.map((metric, metricIndex) => (
                        <span
                          key={metricIndex}
                          className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-full"
                        >
                          {metric}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

            </CardContent>

            {/* Active Report Indicator */}
            {currentReport && currentReport.type === category.id && (
              <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-blue-500 to-purple-500"></div>
            )}
          </Card>
        </div>
      ))}
    </div>
  );
};

export default InteractiveReportCards;
