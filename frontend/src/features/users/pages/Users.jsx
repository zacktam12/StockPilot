import React, { useState, useEffect } from "react";
import {
	Plus,
	Search,
	Filter,
	ArrowUpDown,
	Edit,
	Trash,
	UserCircle,
	Check,
} from "lucide-react";

import { useDispatch, useSelector } from "react-redux";
import { fetchUsers, deleteUser } from "../../../store/slices/userSlice";
import Button from "../../../components/shared/Button";
import Input from "../../../components/shared/Input";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "../../../components/shared/Table";
import Badge from "../../../components/shared/Badge";
import NewUserModal from "../modals/NewUserModal";

const UsersPage = () => {
	const dispatch = useDispatch();
	const { users = [], loading } = useSelector((state) => state.user);

	const [searchTerm, setSearchTerm] = useState("");
	const [isNewUserModalOpen, setIsNewUserModalOpen] = useState(false);
	const [editingUser, setEditingUser] = useState(null);
	const [sortField, setSortField] = useState("createdAt");
	const [sortOrder, setSortOrder] = useState("desc");
	const [showFilterMenu, setShowFilterMenu] = useState(false);
	const [showSortMenu, setShowSortMenu] = useState(false);
	const [filterOptions, setFilterOptions] = useState({
		role: "",
		status: "",
	});

	useEffect(() => {
		dispatch(fetchUsers({ sortBy: sortField, order: sortOrder }));
	}, [dispatch, sortField, sortOrder]);

	const handleSort = (field) => {
		if (sortField === field) {
			setSortOrder(sortOrder === "asc" ? "desc" : "asc");
		} else {
			setSortField(field);
			setSortOrder("asc");
		}
		setShowSortMenu(false);
	};

	const handleDelete = (id) => {
		if (window.confirm("Are you sure you want to delete this user?")) {
			dispatch(deleteUser(id));
		}
	};

	const handleEdit = (user) => {
		setEditingUser(user);
		setIsNewUserModalOpen(true);
	};

	const filteredUsers = users.filter((user) => {
		const matchesSearch =
			user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
			user.role?.toLowerCase().includes(searchTerm.toLowerCase());

		const matchesRole = !filterOptions.role || user.role === filterOptions.role;
		const matchesStatus =
			!filterOptions.status ||
			(filterOptions.status === "active" && user.lastSignInAt) ||
			(filterOptions.status === "inactive" && !user.lastSignInAt);

		return matchesSearch && matchesRole && matchesStatus;
	});

	const sortedUsers = [...filteredUsers].sort((a, b) => {
		let comparison = 0;

		switch (sortField) {
			case "email":
				comparison = a.email.localeCompare(b.email);
				break;
			case "role":
				comparison = (a.role || "").localeCompare(b.role || "");
				break;
			case "createdAt":
				comparison =
					new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
				break;
			case "lastSignInAt": {
				const aTime = a.lastSignInAt ? new Date(a.lastSignInAt).getTime() : 0;
				const bTime = b.lastSignInAt ? new Date(b.lastSignInAt).getTime() : 0;
				comparison = aTime - bTime;
				break;
			}
		}

		return sortOrder === "asc" ? comparison : -comparison;
	});

	return (
		<div className="space-y-6">
			<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
				<h1 className="text-2xl font-bold text-gray-900">Users</h1>

				<Button
					variant="primary"
					size="md"
					icon={<Plus size={16} />}
					onClick={() => {
						setEditingUser(null);
						setIsNewUserModalOpen(true);
					}}
				>
					Add New User
				</Button>
			</div>

			<div className="flex flex-col sm:flex-row gap-4">
				<div className="relative flex-1">
					<Input
						placeholder="Search users..."
						icon={<Search size={18} className="text-gray-400" />}
						value={searchTerm}
						onChange={(e) => setSearchTerm(e.target.value)}
						className="w-full"
					/>
				</div>

				<div className="relative">
					<Button
						variant="outline"
						icon={<Filter size={16} />}
						onClick={() => {
							setShowFilterMenu(!showFilterMenu);
							setShowSortMenu(false);
						}}
					>
						Filter
					</Button>

					{showFilterMenu && (
						<div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 p-4 z-50">
							<div className="space-y-4">
								<div>
									<label className="block text-sm font-medium text-gray-700 mb-1">
										Role
									</label>
									<select
										value={filterOptions.role}
										onChange={(e) =>
											setFilterOptions((prev) => ({
												...prev,
												role: e.target.value,
											}))
										}
										className="w-full rounded-md border border-gray-300 shadow-sm p-2"
									>
										<option value="">All Roles</option>
										<option value="admin">Admin</option>
										<option value="staff">Staff</option>
									</select>
								</div>

								<div>
									<label className="block text-sm font-medium text-gray-700 mb-1">
										Status
									</label>
									<select
										value={filterOptions.status}
										onChange={(e) =>
											setFilterOptions((prev) => ({
												...prev,
												status: e.target.value,
											}))
										}
										className="w-full rounded-md border border-gray-300 shadow-sm p-2"
									>
										<option value="">All Status</option>
										<option value="active">Active</option>
										<option value="inactive">Inactive</option>
									</select>
								</div>
							</div>
						</div>
					)}
				</div>

				<div className="relative">
					<Button
						variant="outline"
						icon={<ArrowUpDown size={16} />}
						onClick={() => {
							setShowSortMenu(!showSortMenu);
							setShowFilterMenu(false);
						}}
					>
						Sort
					</Button>

					{showSortMenu && (
						<div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden z-50">
							{["email", "role", "createdAt", "last_sign_in_at"].map(
								(field) => (
									<button
										key={field}
										className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center justify-between"
										onClick={() => handleSort(field)}
									>
										<span>
											{field === "created_at"
												? "Created Date"
												: field === "last_sign_in_at"
												? "Last Sign In"
												: field.charAt(0).toUpperCase() + field.slice(1)}
										</span>
										{sortField === field && (
											<Check size={16} className="text-indigo-600" />
										)}
									</button>
								)
							)}
						</div>
					)}
				</div>
			</div>

			<div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>User</TableHead>
							<TableHead>Role</TableHead>
							<TableHead>Status</TableHead>
							<TableHead>Created At</TableHead>
							<TableHead>Last Sign In</TableHead>
							<TableHead className="text-right">Actions</TableHead>
						</TableRow>
					</TableHeader>

					<TableBody>
						{loading ? (
							<TableRow>
								<TableCell colSpan={6} className="text-center py-8">
									Loading users...
								</TableCell>
							</TableRow>
						) : sortedUsers.length > 0 ? (
							sortedUsers.map((user) => (
								<TableRow key={user.id}>
									<TableCell>
										<div className="flex items-center gap-3">
											<div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
												<UserCircle size={20} className="text-gray-400" />
											</div>
											<div>
												<div className="font-medium text-gray-900">
													{user.email}
												</div>
											</div>
										</div>
									</TableCell>

									<TableCell>
										<Badge
											variant={user.role === "admin" ? "primary" : "secondary"}
										>
											{user.role || "User"}
										</Badge>
									</TableCell>

									<TableCell>
										<Badge
											variant={user.last_sign_in_at ? "success" : "warning"}
										>
											{user.last_sign_in_at ? "Active" : "Inactive"}
										</Badge>
									</TableCell>

									<TableCell>
										{new Date(user.createdAt).toLocaleDateString()}
									</TableCell>

									<TableCell>
										{user.lastSignInAt
											? new Date(user.lastSignInAt).toLocaleDateString()
											: "Never"}
									</TableCell>

									<TableCell className="text-right">
										<div className="flex justify-end gap-2">
											<Button
												variant="ghost"
												size="sm"
												icon={<Edit size={16} />}
												onClick={() => handleEdit(user)}
											>
												Edit
											</Button>

											<Button
												variant="ghost"
												size="sm"
												icon={<Trash size={16} />}
												className="text-red-600 hover:text-red-700 hover:bg-red-50"
												onClick={() => handleDelete(user.id)}
											>
												Delete
											</Button>
										</div>
									</TableCell>
								</TableRow>
							))
						) : (
							<TableRow>
								<TableCell colSpan={6} className="h-32 text-center">
									<div className="flex flex-col items-center justify-center text-gray-500">
										<UserCircle size={28} className="mb-2" />
										<h3 className="text-lg font-medium">No users found</h3>
										<p className="text-sm">
											Try adjusting your search or filters
										</p>
									</div>
								</TableCell>
							</TableRow>
						)}
					</TableBody>
				</Table>
			</div>

			<NewUserModal
				isOpen={isNewUserModalOpen}
				onClose={() => {
					setIsNewUserModalOpen(false);
					setEditingUser(null);
				}}
				onSuccess={() =>
					dispatch(fetchUsers({ sortBy: sortField, order: sortOrder }))
				}
				editingUser={editingUser}
			/>
		</div>
	);
};

export default UsersPage;
