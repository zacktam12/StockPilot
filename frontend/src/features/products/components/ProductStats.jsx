import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Package, CheckCircle, AlertTriangle, XCircle } from "lucide-react";
import { fetchSettings, selectLowStockThreshold } from "../../../store/slices/settingsSlice";

const ProductStats = () => {
  const dispatch = useDispatch();
  const { items, filteredItems } = useSelector((state) => state.product);
  const lowStockThreshold = useSelector(selectLowStockThreshold);

  // Fetch settings on component mount
  useEffect(() => {
    dispatch(fetchSettings());
  }, [dispatch]);

  // Helper function to safely parse numeric values
  const safeNumber = (value, defaultValue = 0) => {
    const num = Number(value);
    return isNaN(num) ? defaultValue : num;
  };

  // Use consistent data source - prefer filteredItems for all calculations
  // This ensures all stats are calculated from the same dataset
  const dataSource = filteredItems && filteredItems.length > 0 ? filteredItems : items || [];
  
  // Calculate statistics with proper validation and consistent data source
  const totalProducts = dataSource.length;
  
  // Separate products by stock status
  const productsWithStock = dataSource.filter(product => {
    const quantity = safeNumber(product.quantity);
    return quantity > 0;
  });
  
  const outOfStockProducts = dataSource.filter(product => {
    const quantity = safeNumber(product.quantity);
    return quantity === 0;
  });
  
  const lowStockProducts = productsWithStock.filter(product => {
    const quantity = safeNumber(product.quantity);
    const minStock = safeNumber(product.minStock, lowStockThreshold);
    // Use product's minStock if available, otherwise use global threshold
    const threshold = product.minStock != null ? minStock : lowStockThreshold;
    return quantity > 0 && quantity <= threshold;
  });
  
  const inStockProducts = productsWithStock.length - lowStockProducts.length;

  // Debug logging (remove in production)
  if (process.env.NODE_ENV === 'development') {
  }

  const stats = [
    {
      title: "Total Products",
      value: totalProducts,
      icon: Package,
      iconBg: "bg-gradient-to-br from-blue-500 to-blue-700",
      iconColor: "text-white",
      valueColor: "text-gray-900",
      description: "All products in inventory"
    },
    {
      title: "In Stock",
      value: inStockProducts,
      icon: CheckCircle,
      iconBg: "bg-green-100",
      iconColor: "text-green-600",
      valueColor: "text-green-600",
      description: "Products with adequate stock levels"
    },
    {
      title: "Low Stock",
      value: lowStockProducts.length,
      icon: AlertTriangle,
      iconBg: "bg-orange-100",
      iconColor: "text-orange-600",
      valueColor: "text-orange-600",
      description: `Products at or below ${lowStockThreshold} units`
    },
    {
      title: "Out of Stock",
      value: outOfStockProducts.length,
      icon: XCircle,
      iconBg: "bg-red-100",
      iconColor: "text-red-600",
      valueColor: "text-red-600",
      description: "Products with zero inventory"
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
            title={stat.description} // Tooltip with description
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">
                  {stat.title}
                </p>
                <p className={`text-2xl sm:text-3xl font-bold ${stat.valueColor} mt-1 sm:mt-2`}>
                  {stat.value}
                </p>
                {/* Show percentage of total for better context */}
                {stat.title !== "Total Products" && (
                  <p className="text-xs text-gray-400 mt-1">
                    {totalProducts > 0 ? Math.round((stat.value / totalProducts) * 100) : 0}% of total
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

export default ProductStats;
