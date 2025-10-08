import React from "react";
import { UserCircle, Check, Shield, X } from "lucide-react";

const UsersStats = ({ users = [] }) => {
  const activeUsers = users.filter((user) => user.status === "Active").length;
  const adminUsers = users.filter((user) => user.role?.role_type === "admin").length;
  const inactiveUsers = users.filter((user) => user.status !== "Active").length;

  const stats = [
    {
      title: "Total Users",
      value: users.length,
      icon: UserCircle,
      iconBg: "bg-blue-100 dark:bg-blue-900/30",
      iconColor: "text-blue-600 dark:text-blue-400",
      valueColor: "text-gray-900 dark:text-white",
    },
    {
      title: "Active Users",
      value: activeUsers,
      icon: Check,
      iconBg: "bg-green-100 dark:bg-green-900/30",
      iconColor: "text-green-600 dark:text-green-400",
      valueColor: "text-green-600 dark:text-green-400",
    },
    {
      title: "Admin Users",
      value: adminUsers,
      icon: Shield,
      iconBg: "bg-purple-100 dark:bg-purple-900/30",
      iconColor: "text-purple-600 dark:text-purple-400",
      valueColor: "text-purple-600 dark:text-purple-400",
    },
    {
      title: "Inactive Users",
      value: inactiveUsers,
      icon: X,
      iconBg: "bg-orange-100 dark:bg-orange-900/30",
      iconColor: "text-orange-600 dark:text-orange-400",
      valueColor: "text-orange-600 dark:text-orange-400",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 mb-8">
      {stats.map((stat, index) => {
        const IconComponent = stat.icon;
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
                <p className={`text-2xl sm:text-3xl font-bold ${stat.valueColor} mt-1 sm:mt-2`}>
                  {stat.value}
                </p>
              </div>
              <div className={`p-2 sm:p-3 ${stat.iconBg} rounded-lg sm:rounded-xl`}>
                <IconComponent className={`${stat.iconColor} sm:w-5 sm:h-5 w-5 h-5`} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default UsersStats;
