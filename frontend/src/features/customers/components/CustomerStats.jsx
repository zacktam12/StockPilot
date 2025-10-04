import React from "react";
import { useSelector } from "react-redux";
import { Users, UserPlus, Phone, MapPin } from "lucide-react";

const CustomerStats = () => {
  const { items } = useSelector((state) => state.customer);

  // Helper function to safely parse values
  const safeValue = (value, defaultValue = null) => {
    return value !== null && value !== undefined && value !== "" ? value : defaultValue;
  };

  // Use consistent data source
  const dataSource = items || [];
  
  // Calculate statistics
  const totalCustomers = dataSource.length;
  
  // Separate customers by different criteria
  const customersWithPhone = dataSource.filter(customer => {
    const phone = safeValue(customer.phone);
    return phone && phone.trim() !== "";
  });
  
  const customersWithAddress = dataSource.filter(customer => {
    const address = safeValue(customer.address);
    return address && address.trim() !== "";
  });
  
  const customersWithEmail = dataSource.filter(customer => {
    const email = safeValue(customer.email);
    return email && email.trim() !== "";
  });

  // Calculate recently added customers (last 30 days)
  const recentlyAddedCustomers = dataSource.filter(customer => {
    const createdAt = new Date(customer.createdAt);
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return createdAt >= thirtyDaysAgo;
  });

  const stats = [
    {
      title: "Total Customers",
      value: totalCustomers,
      icon: Users,
      iconBg: "bg-gradient-to-br from-blue-500 to-blue-700",
      iconColor: "text-white",
      valueColor: "text-gray-900",
      description: "All customers in the database"
    },
    {
      title: "With Phone",
      value: customersWithPhone.length,
      icon: Phone,
      iconBg: "bg-green-100",
      iconColor: "text-green-600",
      valueColor: "text-green-600",
      description: "Customers with phone numbers"
    },
    {
      title: "With Address",
      value: customersWithAddress.length,
      icon: MapPin,
      iconBg: "bg-orange-100",
      iconColor: "text-orange-600",
      valueColor: "text-orange-600",
      description: "Customers with complete addresses"
    },
    {
      title: "Recently Added",
      value: recentlyAddedCustomers.length,
      icon: UserPlus,
      iconBg: "bg-purple-100",
      iconColor: "text-purple-600",
      valueColor: "text-purple-600",
      description: "New customers in the last 30 days"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {stats.map((stat, index) => {
        const IconComponent = stat.icon;
        return (
          <div
            key={index}
            className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 dark:bg-gray-800 dark:border-gray-700 hover:shadow-md transition-shadow duration-200"
            title={stat.description} // Tooltip with description
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                  {stat.title}
                </p>
                <p className={`text-3xl font-bold ${stat.valueColor}`}>
                  {stat.value}
                </p>
                {/* Show percentage of total for better context */}
                {stat.title !== "Total Customers" && (
                  <p className="text-xs text-gray-400 mt-1">
                    {totalCustomers > 0 ? Math.round((stat.value / totalCustomers) * 100) : 0}% of total
                  </p>
                )}
              </div>
              <div className={`w-12 h-12 ${stat.iconBg} rounded-lg flex items-center justify-center`}>
                <IconComponent size={24} className={stat.iconColor} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default CustomerStats;
