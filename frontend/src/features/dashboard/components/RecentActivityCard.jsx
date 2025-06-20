// src/features/dashboard/components/RecentActivityCard.jsx
import React from "react";
import { useSelector } from "react-redux";
import { format } from "date-fns";
import { ShoppingCart, Package } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../components/shared/Card";
import CardLoaderOverlay from "../../../components/shared/CardLoaderOverlay";

const RecentActivityCard = () => {
  const { activities, loading } = useSelector((state) => state.dashboard);

  const getActivityIcon = (type) => {
    switch (type) {
      case "purchase":
        return <Package className="text-amber-600" size={20} />;
      case "sale":
        return <ShoppingCart className="text-green-600" size={20} />;
      default:
        return <Package className="text-blue-600" size={20} />;
    }
  };

  const formatTime = (timestamp) => {
    return format(new Date(timestamp), "MMM d, yyyy h:mm a");
  };

  return (
    <Card className="h-full relative">
      {loading && <CardLoaderOverlay />}
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent className="max-h-[400px] overflow-y-auto">
        <div className="divide-y divide-gray-200">
          {loading ? (
            <p className="text-gray-500 text-sm py-4">Loading activities...</p>
          ) : Array.isArray(activities) && activities.length > 0 ? (
            activities.map((activity) => (
              <div key={activity.id} className="flex items-start gap-4 py-3">
                <div className="p-2 rounded-full bg-gray-50">
                  {getActivityIcon(activity.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900">
                    {activity.type === "purchase" ? "Purchase Order" : "Sale"} -{" "}
                    {activity.relatedEntity?.name || "Anonymous"}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {formatTime(activity.date)} - ${activity.amount.toFixed(2)}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-sm py-4">No recent activities</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default RecentActivityCard;
