import React from "react";
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Users, 
  Package, 
  AlertTriangle,
  ArrowUp,
  ArrowDown,
  Target,
  Zap,
  Star,
  Activity
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/shared/Card";
// Using CSS animations instead of framer-motion

const ReportInsights = ({ report, data }) => {
  if (!report || !data) return null;

  const calculateInsights = () => {
    const insights = {
      totalRevenue: 0,
      totalOrders: 0,
      averageOrderValue: 0,
      growthRate: 0,
      topPerformer: null,
      criticalAlerts: 0,
      totalValue: 0,
      categoryBreakdown: {}
    };

    switch (report.type) {
      case 'sales':
        insights.totalRevenue = data.reduce((sum, item) => sum + (item.total_amount || 0), 0);
        insights.totalOrders = data.length;
        insights.averageOrderValue = insights.totalOrders > 0 ? insights.totalRevenue / insights.totalOrders : 0;
        insights.growthRate = 12.5; // Mock growth rate
        insights.topPerformer = data.reduce((max, item) => 
          (item.total_amount || 0) > (max?.total_amount || 0) ? item : max, data[0]);
        break;

      case 'inventory':
        insights.totalValue = data.reduce((sum, item) => sum + (item.total_value || 0), 0);
        insights.criticalAlerts = data.filter(item => (item.quantity || 0) < 10).length;
        insights.totalOrders = data.length;
        break;

      case 'purchases':
        insights.totalRevenue = data.reduce((sum, item) => sum + (item.total_amount || 0), 0);
        insights.totalOrders = data.length;
        insights.averageOrderValue = insights.totalOrders > 0 ? insights.totalRevenue / insights.totalOrders : 0;
        break;

      case 'revenue':
        insights.totalRevenue = data.reduce((sum, item) => sum + (item.total || 0), 0);
        insights.growthRate = 8.3; // Mock growth rate
        break;

      case 'products':
        insights.totalOrders = data.reduce((sum, item) => sum + (item.total_sold || 0), 0);
        insights.topPerformer = data.reduce((max, item) => 
          (item.total_sold || 0) > (max?.total_sold || 0) ? item : max, data[0]);
        break;

      case 'alerts':
        insights.criticalAlerts = data.length;
        insights.totalOrders = data.reduce((sum, item) => sum + (item.quantity || 0), 0);
        break;

      case 'valuation':
        insights.totalValue = data.reduce((sum, item) => sum + (item.total_value || 0), 0);
        insights.totalOrders = data.length;
        break;

      case 'suppliers':
        insights.totalOrders = data.reduce((sum, item) => sum + (item.total_orders || 0), 0);
        insights.totalRevenue = data.reduce((sum, item) => sum + (item.total_spent || 0), 0);
        break;

      case 'costs':
        insights.totalRevenue = data.reduce((sum, item) => sum + (item.total_cost || 0), 0);
        insights.totalOrders = data.reduce((sum, item) => sum + (item.total_purchased || 0), 0);
        insights.averageOrderValue = insights.totalOrders > 0 ? insights.totalRevenue / insights.totalOrders : 0;
        break;
    }

    return insights;
  };

  const insights = calculateInsights();

  const insightCards = [
    {
      title: "Total Revenue",
      value: `$${insights.totalRevenue.toLocaleString()}`,
      change: insights.growthRate > 0 ? `+${insights.growthRate}%` : `${insights.growthRate}%`,
      trend: insights.growthRate > 0 ? 'up' : 'down',
      icon: DollarSign,
      color: "green",
      description: "Revenue generated"
    },
    {
      title: "Total Orders",
      value: insights.totalOrders.toLocaleString(),
      change: "+5.2%",
      trend: 'up',
      icon: Package,
      color: "blue",
      description: "Orders processed"
    },
    {
      title: "Average Value",
      value: `$${insights.averageOrderValue.toFixed(2)}`,
      change: "+2.1%",
      trend: 'up',
      icon: Target,
      color: "purple",
      description: "Per order average"
    },
    {
      title: "Critical Alerts",
      value: insights.criticalAlerts.toString(),
      change: insights.criticalAlerts > 0 ? "Needs attention" : "All good",
      trend: insights.criticalAlerts > 0 ? 'down' : 'up',
      icon: AlertTriangle,
      color: insights.criticalAlerts > 0 ? "red" : "green",
      description: "Items requiring action"
    }
  ];

  const getTrendIcon = (trend) => {
    return trend === 'up' ? <ArrowUp size={16} /> : <ArrowDown size={16} />;
  };

  const getTrendColor = (trend, color) => {
    if (trend === 'up') {
      return color === 'red' ? 'text-red-600' : 'text-green-600';
    }
    return color === 'red' ? 'text-red-600' : 'text-red-600';
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {insightCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <div
              key={card.title}
              className="animate-slide-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <Card className="group hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-3 rounded-xl bg-${card.color}-100 dark:bg-${card.color}-900/20`}>
                      <Icon className={`w-6 h-6 text-${card.color}-600 dark:text-${card.color}-400`} />
                    </div>
                    <div className={`flex items-center gap-1 text-sm font-medium ${
                      card.trend === 'up' && card.color !== 'red' 
                        ? 'text-green-600 dark:text-green-400' 
                        : card.color === 'red' 
                          ? 'text-red-600 dark:text-red-400'
                          : 'text-red-600 dark:text-red-400'
                    }`}>
                      {getTrendIcon(card.trend)}
                      <span>{card.change}</span>
                    </div>
                  </div>
                  
                  <div className="space-y-1">
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                      {card.value}
                    </h3>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      {card.title}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-500">
                      {card.description}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          );
        })}
      </div>

      {/* Top Performers & Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Performer */}
        {insights.topPerformer && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Star className="w-5 h-5 text-yellow-500" />
                Top Performer
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-xl">
                <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl flex items-center justify-center">
                  <Zap className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 dark:text-white">
                    {insights.topPerformer.product_name || insights.topPerformer.customer?.name || insights.topPerformer.supplier_name || 'N/A'}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {report.type === 'products' ? 'Units Sold' : 
                     report.type === 'sales' ? 'Revenue Generated' : 
                     'Total Orders'}: {insights.topPerformer.total_sold || insights.topPerformer.total_amount || insights.topPerformer.total_orders || 'N/A'}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                    #{1}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    Rank
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Activity className="w-5 h-5 text-blue-500" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <button className="w-full flex items-center gap-3 p-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors">
                <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <div className="font-medium text-gray-900 dark:text-white">Export Data</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Download as PDF or Excel</div>
                </div>
              </button>
              
              <button className="w-full flex items-center gap-3 p-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors">
                <div className="w-8 h-8 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
                  <Target className="w-4 h-4 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <div className="font-medium text-gray-900 dark:text-white">Set Alerts</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Configure notifications</div>
                </div>
              </button>
              
              <button className="w-full flex items-center gap-3 p-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors">
                <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
                  <Activity className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <div className="font-medium text-gray-900 dark:text-white">Schedule Report</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Automate report generation</div>
                </div>
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ReportInsights;
