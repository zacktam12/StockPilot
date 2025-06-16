import React from "react";
import { useSelector } from "react-redux";

const ProfilePage = () => {
	// Mock: get current user from Redux or fallback
	const currentUser = useSelector((state) => state.user?.currentUser) || {
		email: "admin@example.com",
		role: "admin",
		lastSignInAt: "2025-06-01T12:00:00Z",
	};
	const companyInfo = useSelector((state) => state.company?.info) || {
		name: "Demo Company",
		address: "123 Main St",
	};

	return (
		<div className="max-w-xl mx-auto p-6 bg-white rounded shadow">
			<h2 className="text-2xl font-bold mb-4">Profile</h2>
			<div className="mb-4">
				<div className="font-semibold">Email:</div>
				<div>{currentUser.email}</div>
			</div>
			<div className="mb-4">
				<div className="font-semibold">Role:</div>
				<div>{currentUser.role}</div>
			</div>
			<div className="mb-4">
				<div className="font-semibold">Last Sign In:</div>
				<div>
					{currentUser.lastSignInAt
						? new Date(currentUser.lastSignInAt).toLocaleString()
						: "-"}
				</div>
			</div>
			<div className="mb-4">
				<div className="font-semibold">Company:</div>
				<div>{companyInfo.name}</div>
				<div className="text-sm text-gray-500">{companyInfo.address}</div>
			</div>
		</div>
	);
};

export default ProfilePage;
