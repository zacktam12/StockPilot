import React from "react";
import { useSelector } from "react-redux";
import { 
  ShoppingCart, 
  Clock, 
  CheckCircle, 
  DollarSign
} from "lucide-react";

const PurchaseStats = ({ filteredItems }) => {
  const { items } = useSelector((state) => state.purchases || {});

  // Helper function to safely parse numeric values
  const safeNumber = (value, defaultValue = 0) => {
    const num = Number(value);
    return isNaN(num) ? defaultValue : num;
  };

  // Use consistent data source - prefer filteredItems for all calculations
  const dataSource = (filteredItems && Array.isArray(filteredItems) && filteredItems.length > 0) ? filteredItems : (items || []);
  
  // Calculate basic statistics
  const totalPurchases = dataSource.length;
  
  // Separate purchases by status
  const pendingPurchases = dataSource.filter(purchase => purchase.status === 'pending');
  const receivedPurchases = dataSource.filter(purchase => purchase.status === 'received');
  
  // Calculate cost statistics
  const totalCost = dataSource.reduce((sum, purchase) => {
    return sum + safeNumber(purchase.totalCost);
  }, 0);

  const stats = [
    {
      title: "Total Purchases",
      value: totalPurchases,
      icon: ShoppingCart,
      iconBg: "bg-gradient-to-br from-blue-500 to-blue-700",
      iconColor: "text-white",
      valueColor: "text-gray-900",
      description: "All purchase orders"
    },
    {
      title: "Pending",
      value: pendingPurchases.length,
      icon: Clock,
      iconBg: "bg-yellow-100",
      iconColor: "text-yellow-600",
      valueColor: "text-yellow-600",
      description: "Purchase orders awaiting processing"
    },
    {
      title: "Received",
      value: receivedPurchases.length,
      icon: CheckCircle,
      iconBg: "bg-green-100",
      iconColor: "text-green-600",
      valueColor: "text-green-600",
      description: "Successfully received purchase orders"
    },
    {
      title: "Total Value",
      value: `$${totalCost.toLocaleString()}`,
      icon: DollarSign,
      iconBg: "bg-emerald-100",
      iconColor: "text-emerald-600",
      valueColor: "text-emerald-600",
      description: "Total value of all purchases"
    }
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 mb-8">
      {stats.map((stat, index) => {
        const IconComponent = stat.icon;
        return (
          <div
            key={index}
            className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-gray-200/50 dark:border-gray-700/50 shadow-lg hover:shadow-xl transition-all duration-300"
            title={stat.description}
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">
                  {stat.title}
                </p>
                <p className={`text-2xl sm:text-3xl font-bold ${stat.valueColor} mt-1 sm:mt-2`}>
                  {stat.value}
                </p>
                {/* Show percentage of total for count-based stats */}
                {stat.title !== "Total Purchases" && 
                 stat.title !== "Total Value" && (
                  <p className="text-xs text-gray-400 mt-1">
                    {totalPurchases > 0 ? Math.round((stat.value / totalPurchases) * 100) : 0}% of total
                  </p>
                )}
              </div>
              <div className={`p-2 sm:p-3 ${stat.iconBg} rounded-lg sm:rounded-xl`}>
                <IconComponent size={20} className={`${stat.iconColor} sm:w-5 sm:h-5 w-5 h-5`} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default PurchaseStats;
