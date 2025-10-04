import React from "react";
import { useSelector } from "react-redux";
import { Tag, FileText, Calendar, TrendingUp } from "lucide-react";

const CategoryStats = () => {
  const { items, filteredItems } = useSelector((state) => state.category);

  // Use consistent data source - prefer filteredItems for all calculations
  // This ensures all stats are calculated from the same dataset
  const dataSource = filteredItems && filteredItems.length > 0 ? filteredItems : items || [];
  
  // Calculate statistics with proper validation and consistent data source
  const totalCategories = dataSource.length;
  
  // Separate categories by description status
  const categoriesWithDescription = dataSource.filter(category => 
    category.description && category.description.trim() !== ""
  );
  
  const categoriesWithoutDescription = dataSource.filter(category => 
    !category.description || category.description.trim() === ""
  );

  // Calculate recently created categories (last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  const recentCategories = dataSource.filter(category => {
    const createdAt = new Date(category.createdAt || category.created_at);
    return createdAt >= thirtyDaysAgo;
  });

  // Calculate recently updated categories (last 7 days)
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  
  const recentlyUpdated = dataSource.filter(category => {
    const updatedAt = new Date(category.updatedAt || category.updated_at);
    return updatedAt >= sevenDaysAgo;
  });

  // Debug logging (remove in production)
  if (process.env.NODE_ENV === 'development') {
    console.log('CategoryStats Debug:', {
      totalCategories,
      categoriesWithDescription: categoriesWithDescription.length,
      categoriesWithoutDescription: categoriesWithoutDescription.length,
      recentCategories: recentCategories.length,
      recentlyUpdated: recentlyUpdated.length,
      dataSource: dataSource.length,
      verification: categoriesWithDescription.length + categoriesWithoutDescription.length
    });
  }

  const stats = [
    {
      title: "Total Categories",
      value: totalCategories,
      icon: Tag,
      iconBg: "bg-gradient-to-br from-blue-500 to-blue-700",
      iconColor: "text-white",
      valueColor: "text-gray-900",
      description: "All categories in the system"
    },
    {
      title: "With Description",
      value: categoriesWithDescription.length,
      icon: FileText,
      iconBg: "bg-green-100",
      iconColor: "text-green-600",
      valueColor: "text-green-600",
      description: "Categories with detailed descriptions"
    },
    {
      title: "Recently Created",
      value: recentCategories.length,
      icon: Calendar,
      iconBg: "bg-orange-100",
      iconColor: "text-orange-600",
      valueColor: "text-orange-600",
      description: "Categories created in the last 30 days"
    },
    {
      title: "Recently Updated",
      value: recentlyUpdated.length,
      icon: TrendingUp,
      iconBg: "bg-purple-100",
      iconColor: "text-purple-600",
      valueColor: "text-purple-600",
      description: "Categories updated in the last 7 days"
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
                {stat.title !== "Total Categories" && (
                  <p className="text-xs text-gray-400 mt-1">
                    {totalCategories > 0 ? Math.round((stat.value / totalCategories) * 100) : 0}% of total
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

export default CategoryStats;
