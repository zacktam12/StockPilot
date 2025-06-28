import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";
import { Bar, Pie } from "react-chartjs-2";
import { io } from "socket.io-client";
import { API_BASE_URL } from "../../../config";

// Redux actions
import {
  fetchRevenueData,
  fetchProductDistribution,
  setSocketUpdates, // ✅ Correct action
} from "../../../store/slices/dashboardSlice";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

export const RevenueChart = ({ compact = false }) => {
  const dispatch = useDispatch();
  const revenueData = useSelector(
    (state) => state.dashboard.revenue?.data || []
  );
  const revenueLoading = useSelector(
    (state) => state.dashboard.revenueLoading || false
  );

  useEffect(() => {
    dispatch(fetchRevenueData());

    const socket = io(API_BASE_URL);
    socket.on("dashboard-update", (data) => {
      dispatch(setSocketUpdates(data)); // ✅ Correct usage
    });

    return () => socket.disconnect();
  }, [dispatch]);

  // Show loading state
  if (revenueLoading) {
    return (
      <div
        className={`${
          compact
            ? "h-[180px] sm:h-[200px] lg:h-[200px]"
            : "h-[250px] sm:h-[300px] lg:h-[350px]"
        } flex items-center justify-center bg-gray-50 dark:bg-gray-800 rounded-lg`}
      >
        <div className="text-gray-500 dark:text-gray-400 text-sm sm:text-base">
          Loading revenue data...
        </div>
      </div>
    );
  }

  const safeRevenueData = Array.isArray(revenueData) ? revenueData : [];

  // Show empty state if no data
  if (safeRevenueData.length === 0) {
    return (
      <div
        className={`${
          compact
            ? "h-[180px] sm:h-[200px] lg:h-[200px]"
            : "h-[250px] sm:h-[300px] lg:h-[350px]"
        } flex items-center justify-center bg-gray-50 dark:bg-gray-800 rounded-lg`}
      >
        <div className="text-gray-500 dark:text-gray-400 text-sm sm:text-base">
          No revenue data available
        </div>
      </div>
    );
  }

  const labels =
    safeRevenueData.map((item) => {
      const [year, month] = item.month?.split("-") || ["", ""];
      if (!year || !month) return "";
      return `${new Date(year, month - 1).toLocaleString("default", {
        month: "short",
      })} ${year}`;
    }) || [];

  const chartData = {
    labels,
    datasets: [
      {
        label: "Revenue ($)",
        data: safeRevenueData.map((item) => item.revenue ?? 0),
        backgroundColor: "rgba(79, 70, 229, 0.5)",
        borderColor: "rgb(79, 70, 229)",
        borderWidth: 1,
        hoverBackgroundColor: "rgba(99, 102, 241, 0.8)",
      },
    ],
  };

  const options = {
    plugins: {
      legend: {
        position: "top",
        labels: {
          color: "#4f46e5",
          font: {
            weight: "bold",
            size: compact ? 8 : 10,
          },
        },
      },
      title: {
        display: true,
        text: "Monthly Revenue",
        color: "#1e293b",
        font: {
          size: compact ? 10 : 12,
          weight: "bold",
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          color: "#64748b",
          font: {
            size: compact ? 8 : 10,
          },
          callback: (value) => `$${value.toLocaleString()}`,
        },
        grid: {
          color: "rgba(100, 116, 139, 0.1)",
        },
      },
      x: {
        ticks: {
          color: "#64748b",
          font: {
            size: compact ? 8 : 10,
          },
        },
        grid: {
          color: "rgba(100, 116, 139, 0.1)",
        },
      },
    },
    maintainAspectRatio: false,
  };

  return (
    <div
      className={`${
        compact
          ? "h-[180px] sm:h-[200px] lg:h-[200px]"
          : "h-[250px] sm:h-[300px] lg:h-[350px]"
      } cursor-pointer transition-all duration-300 ease-in-out hover:scale-[1.02]`}
    >
      <Bar data={chartData} options={options} />
    </div>
  );
};

export const ProductDistributionChart = ({ compact = false }) => {
  const dispatch = useDispatch();
  const { data: distributionData } = useSelector(
    (state) => state.dashboard.distribution
  );
  const distributionLoading = useSelector(
    (state) => state.dashboard.distributionLoading || false
  );

  useEffect(() => {
    dispatch(fetchProductDistribution());
  }, [dispatch]);

  // Show loading state
  if (distributionLoading) {
    return (
      <div
        className={`${
          compact
            ? "h-[180px] sm:h-[200px] lg:h-[200px]"
            : "h-[250px] sm:h-[300px] lg:h-[350px]"
        } flex items-center justify-center bg-gray-50 dark:bg-gray-800 rounded-lg`}
      >
        <div className="text-gray-500 dark:text-gray-400 text-sm sm:text-base">
          Loading distribution data...
        </div>
      </div>
    );
  }

  // Create safe chart data with fallback
  const chartData =
    distributionData && Object.keys(distributionData).length > 0
      ? {
          labels: Object.keys(distributionData),
          datasets: [
            {
              data: Object.values(distributionData),
              backgroundColor: [
                "rgba(99, 102, 241, 0.8)",
                "rgba(16, 185, 129, 0.8)",
                "rgba(245, 158, 11, 0.8)",
                "rgba(239, 68, 68, 0.8)",
                "rgba(139, 92, 246, 0.8)",
              ],
            },
          ],
        }
      : {
          labels: ["No Data"],
          datasets: [
            {
              data: [1],
              backgroundColor: ["rgba(156, 163, 175, 0.8)"],
            },
          ],
        };

  return (
    <div
      className={`${
        compact
          ? "h-[180px] sm:h-[200px] lg:h-[200px]"
          : "h-[250px] sm:h-[300px] lg:h-[350px]"
      } cursor-pointer transition-all duration-300 ease-in-out hover:scale-[1.02]`}
    >
      <Pie
        data={chartData}
        options={{
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: "right",
              labels: {
                font: {
                  size: compact ? 8 : 10,
                },
              },
            },
            title: {
              display: true,
              text: "Product Distribution",
              font: {
                size: compact ? 10 : 12,
                weight: "bold",
              },
            },
          },
        }}
      />
    </div>
  );
};
