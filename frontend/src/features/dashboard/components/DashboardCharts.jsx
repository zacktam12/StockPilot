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

export const RevenueChart = () => {
	const dispatch = useDispatch();
	const { revenueData, revenueLoading } = useSelector(
		(state) => state.dashboard
	);

	useEffect(() => {
		dispatch(fetchRevenueData());

		const socket = io("http://localhost:5000");
		socket.on("dashboard-update", (data) => {
			dispatch(setSocketUpdates(data)); // ✅ Correct usage
		});

		return () => socket.disconnect();
	}, [dispatch]);

	const safeRevenueData = Array.isArray(revenueData) ? revenueData : [];

	const labels =
		safeRevenueData.map((item) => {
			const [year, month] = item.month?.split("-") || ["", ""];
			return `${new Date(year, month - 1).toLocaleString("default", {
				month: "short",
			})} ${year}`;
		}) || [];

	const chartData = {
		labels,
		datasets: [
			{
				label: "Revenue ($)",
				data: safeRevenueData.map((item) => item.revenue) || [],
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
					},
				},
			},
			title: {
				display: true,
				text: "Monthly Revenue",
				color: "#1e293b",
				font: {
					size: 16,
					weight: "bold",
				},
			},
		},
		scales: {
			y: {
				beginAtZero: true,
				ticks: {
					color: "#64748b",
					callback: (value) => `$${value.toLocaleString()}`,
				},
				grid: {
					color: "rgba(100, 116, 139, 0.1)",
				},
			},
			x: {
				ticks: {
					color: "#64748b",
				},
				grid: {
					color: "rgba(100, 116, 139, 0.1)",
				},
			},
		},
		maintainAspectRatio: false,
	};

	return (
		<div className="h-[350px]">
			{revenueLoading ? (
				<div className="h-full flex items-center justify-center">
					<p>Loading revenue data...</p>
				</div>
			) : (
				<Bar data={chartData} options={options} />
			)}
		</div>
	);
};

export const ProductDistributionChart = () => {
	const dispatch = useDispatch();
	const { productDistribution, distributionLoading } = useSelector(
		(state) => state.dashboard
	);

	useEffect(() => {
		dispatch(fetchProductDistribution());
	}, [dispatch]);

	const chartData = productDistribution
		? {
				labels: Object.keys(productDistribution),
				datasets: [
					{
						data: Object.values(productDistribution),
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
		: null;

	return (
		<div className="h-[350px]">
			{distributionLoading ? (
				<div className="h-full flex items-center justify-center">
					<p>Loading product distribution...</p>
				</div>
			) : (
				<Pie
					data={chartData}
					options={{
						responsive: true,
						maintainAspectRatio: false,
						plugins: {
							legend: { position: "right" },
							title: { display: true, text: "Product Distribution" },
						},
					}}
				/>
			)}
		</div>
	);
};
