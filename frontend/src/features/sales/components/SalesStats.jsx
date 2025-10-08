import React from "react";
import { 
  ShoppingCart, 
  Clock, 
  CheckCircle, 
  DollarSign 
} from "lucide-react";

const SalesStats = ({ salesList = [] }) => {
  // Calculate statistics
  const totalSales = salesList.length;
  const pendingSales = salesList.filter(sale => sale.status === "pending").length;
  const completedSales = salesList.filter(sale => sale.status === "completed").length;
  const totalRevenue = salesList.reduce((sum, sale) => {
    return sum + (sale.totalPrice || sale.total_amount || 0);
  }, 0);

  const stats = [
    {
      title: "Total Sales",
      value: totalSales,
      icon: ShoppingCart,
      color: "from-blue-500 to-blue-700",
      bgColor: "bg-blue-50",
      textColor: "text-blue-600",
    },
    {
      title: "Pending",
      value: pendingSales,
      icon: Clock,
      color: "from-yellow-500 to-yellow-700",
      bgColor: "bg-yellow-50",
      textColor: "text-yellow-600",
    },
    {
      title: "Completed",
      value: completedSales,
      icon: CheckCircle,
      color: "from-green-500 to-green-700",
      bgColor: "bg-green-50",
      textColor: "text-green-600",
    },
    {
      title: "Total Revenue",
      value: `$${totalRevenue.toLocaleString()}`,
      icon: DollarSign,
      color: "from-purple-500 to-purple-700",
      bgColor: "bg-purple-50",
      textColor: "text-purple-600",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 mb-8">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <div
            key={index}
            className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-gray-200/50 dark:border-gray-700/50 shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">
                  {stat.title}
                </p>
                <p className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mt-1 sm:mt-2">
                  {stat.value}
                </p>
              </div>
              <div className={`p-2 sm:p-3 ${stat.bgColor} rounded-lg sm:rounded-xl`}>
                <Icon className={`h-5 w-5 sm:w-5 sm:h-5 ${stat.textColor}`} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default SalesStats;
