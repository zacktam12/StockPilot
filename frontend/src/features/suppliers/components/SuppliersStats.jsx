import React from "react";
import { useSelector } from "react-redux";
import { Truck, MapPin, Building, Users } from "lucide-react";

const SuppliersStats = () => {
  const { items } = useSelector((state) => state.supplier);

  // Helper function to safely check if field has value
  const hasValue = (value) => {
    return value && value.toString().trim() !== "";
  };

  // Use items as data source
  const dataSource = items || [];
  
  // Calculate statistics
  const totalSuppliers = dataSource.length;
  
  // Separate suppliers by contact completeness
  const suppliersWithAddress = dataSource.filter(supplier => 
    hasValue(supplier.address)
  );
  
  const suppliersWithCompany = dataSource.filter(supplier => 
    hasValue(supplier.companyName)
  );

  // Calculate complete suppliers (have all contact info)
  const completeSuppliers = dataSource.filter(supplier => 
    hasValue(supplier.name) && 
    hasValue(supplier.email) && 
    hasValue(supplier.phone)
  );

  // Calculate incomplete suppliers
  const incompleteSuppliers = totalSuppliers - completeSuppliers.length;

  const stats = [
    {
      title: "Total Suppliers",
      value: totalSuppliers,
      icon: Users,
      iconBg: "bg-gradient-to-br from-blue-500 to-blue-700",
      iconColor: "text-white",
      valueColor: "text-gray-900",
      description: "All suppliers in your network"
    },
    {
      title: "With Address",
      value: suppliersWithAddress.length,
      icon: MapPin,
      iconBg: "bg-purple-100",
      iconColor: "text-purple-600",
      valueColor: "text-purple-600",
      description: "Suppliers with physical addresses"
    },
    {
      title: "Company Suppliers",
      value: suppliersWithCompany.length,
      icon: Building,
      iconBg: "bg-orange-100",
      iconColor: "text-orange-600",
      valueColor: "text-orange-600",
      description: "Suppliers with company names"
    },
    {
      title: "Complete Profiles",
      value: completeSuppliers.length,
      icon: Truck,
      iconBg: "bg-emerald-100",
      iconColor: "text-emerald-600",
      valueColor: "text-emerald-600",
      description: "Suppliers with name, email, and phone"
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
                {stat.title !== "Total Suppliers" && (
                  <p className="text-xs text-gray-400 mt-1">
                    {totalSuppliers > 0 ? Math.round((stat.value / totalSuppliers) * 100) : 0}%
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

export default SuppliersStats;
