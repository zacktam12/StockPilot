// src/features/dashboard/components/RecentActivityCard.jsx
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { format } from "date-fns";
import { ShoppingCart, Package } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../components/shared/Card";
import CardLoaderOverlay from "../../../components/shared/CardLoaderOverlay";
import { SimplePagination } from "../../../components/shared/Pagination";
import { fetchActivities } from "../../../store/slices/dashboardSlice";

const RecentActivityCard = ({ compact = false }) => {
  const dispatch = useDispatch();
  const { activities, activitiesLoading } = useSelector(
    (state) => state.dashboard
  );

  useEffect(() => {
    dispatch(
      fetchActivities({ page: activities.page, limit: compact ? 2 : 5 })
    );
  }, [dispatch, activities.page, compact]);

  const handlePageChange = (newPage) => {
    dispatch(fetchActivities({ page: newPage, limit: compact ? 2 : 5 }));
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case "purchase":
        return (
          <Package
            className="text-amber-600 transition-colors duration-300 hover:text-amber-700"
            size={compact ? 14 : 16}
          />
        );
      case "sale":
        return (
          <ShoppingCart
            className="text-green-600 transition-colors duration-300 hover:text-green-700"
            size={compact ? 14 : 16}
          />
        );
      default:
        return (
          <Package
            className="text-blue-600 transition-colors duration-300 hover:text-blue-700"
            size={compact ? 14 : 16}
          />
        );
    }
  };

  const formatTime = (timestamp) => {
    return format(new Date(timestamp), "MMM d, yyyy h:mm a");
  };

  // Mock data for demonstration when backend is not available
  const mockActivities = [
    {
      id: 1,
      type: "sale",
      date: new Date().toISOString(),
      amount: 1250.0,
      relatedEntity: { name: "John Doe" },
    },
    {
      id: 2,
      type: "purchase",
      date: new Date(Date.now() - 86400000).toISOString(),
      amount: 850.0,
      relatedEntity: { name: "ABC Suppliers" },
    },
  ];

  // Use mock data if no real data is available
  const displayData =
    activities.data && activities.data.length > 0
      ? activities.data
      : mockActivities;

  return (
    <Card className="h-full relative cursor-pointer transition-all duration-300 ease-in-out hover:shadow-lg hover:scale-[1.02] hover:bg-blue-50 dark:hover:bg-gray-800">
      {activitiesLoading && <CardLoaderOverlay />}
      <CardHeader
        className={compact ? "p-2 sm:p-3 pb-1 sm:pb-2" : "p-4 sm:p-6"}
      >
        <CardTitle
          className={`transition-colors duration-300 hover:text-blue-600 dark:hover:text-blue-400 ${
            compact ? "text-xs sm:text-sm" : "text-sm sm:text-base"
          }`}
        >
          Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent
        className={`overflow-y-auto ${
          compact
            ? "p-2 sm:p-3 pt-0 max-h-[120px] sm:max-h-[150px]"
            : "p-4 sm:p-6 max-h-[300px] sm:max-h-[400px]"
        }`}
      >
        <div className="divide-y divide-gray-200">
          {activitiesLoading ? (
            <p
              className={`text-gray-500 py-3 sm:py-4 transition-colors duration-300 hover:text-blue-600 dark:hover:text-blue-400 ${
                compact ? "text-xs" : "text-sm"
              }`}
            >
              Loading activities...
            </p>
          ) : displayData && displayData.length > 0 ? (
            displayData.map((activity) => (
              <div
                key={activity.id}
                className={`flex items-start gap-2 sm:gap-3 cursor-pointer transition-all duration-300 hover:bg-blue-50 dark:hover:bg-gray-700 hover:scale-[1.01] rounded-lg p-1 ${
                  compact ? "py-1.5 sm:py-2" : "py-2 sm:py-3"
                }`}
              >
                <div
                  className={`rounded-full bg-gray-50 transition-all duration-300 hover:bg-blue-100 dark:hover:bg-gray-600 hover:scale-110 flex-shrink-0 ${
                    compact ? "p-1 sm:p-1.5" : "p-1.5 sm:p-2"
                  }`}
                >
                  {getActivityIcon(activity.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <p
                    className={`text-gray-900 transition-colors duration-300 hover:text-blue-700 dark:hover:text-blue-300 truncate ${
                      compact ? "text-xs" : "text-sm"
                    }`}
                  >
                    {activity.type === "purchase" ? "Purchase Order" : "Sale"} -{" "}
                    {activity.relatedEntity?.name || "Anonymous"}
                  </p>
                  <p
                    className={`text-gray-500 mt-0.5 transition-colors duration-300 hover:text-blue-600 dark:hover:text-blue-400 truncate ${
                      compact ? "text-xs" : "text-xs"
                    }`}
                  >
                    {formatTime(activity.date)} - ${activity.amount.toFixed(2)}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <p
              className={`text-gray-500 py-3 sm:py-4 transition-colors duration-300 hover:text-blue-600 dark:hover:text-blue-400 ${
                compact ? "text-xs" : "text-sm"
              }`}
            >
              No recent activities
            </p>
          )}
        </div>

        {/* Pagination - only show if we have real data with multiple pages */}
        {activities.totalPages > 1 &&
          activities.data &&
          activities.data.length > 0 && (
            <SimplePagination
              currentPage={activities.page}
              totalPages={activities.totalPages}
              onPageChange={handlePageChange}
              compact={compact}
              showInfo={!compact}
            />
          )}
      </CardContent>
    </Card>
  );
};

export default RecentActivityCard;
