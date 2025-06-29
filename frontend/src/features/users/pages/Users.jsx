import React, { useEffect, useRef } from "react";
import {
  Plus,
  Search,
  Filter,
  ArrowUpDown,
  Edit,
  Trash,
  UserCircle,
  Check,
  ChevronUp,
  ChevronDown,
  Download,
  Upload,
  MoreHorizontal,
  X,
  Shield,
  User,
} from "lucide-react";

import { useDispatch, useSelector } from "react-redux";
import {
  fetchUsers,
  deleteUser,
  setSearchTerm,
  setStatusFilter,
  setSortField,
  importUsers,
} from "../../../store/slices/userSlice";
import { fetchRoles } from "../../../store/slices/roleSlice";
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
import LoadingOverlay from "../../../components/shared/LoadingOverlay";
import Pagination from "../../../components/shared/Pagination";
import BulkActions from "../../../components/shared/BulkActions";
import ActionMenu from "../../../components/shared/ActionMenu";
import { exportUsersToCSV, validateUserCSV } from "../../../utils/csvUtils";
import CSVImportModal from "../../../components/shared/CSVImportModal";
import { useOutsideClick } from "../../../hooks/useOutsideClick";

const UsersPage = () => {
  const dispatch = useDispatch();
  const {
    users,
    loading,
    error,
    currentPage,
    totalPages,
    itemsPerPage,
    searchTerm,
    statusFilter,
    sortField,
    sortOrder,
  } = useSelector((state) => state.user);

  const { roles = [] } = useSelector((state) => state.role || {});

  const [isNewUserModalOpen, setIsNewUserModalOpen] = React.useState(false);
  const [editingUser, setEditingUser] = React.useState(null);
  const [showFilterMenu, setShowFilterMenu] = React.useState(false);
  const [showSortMenu, setShowSortMenu] = React.useState(false);
  const [selectedItems, setSelectedItems] = React.useState([]);
  const [selectAll, setSelectAll] = React.useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = React.useState(false);
  const [roleFilter, setRoleFilter] = React.useState("");

  const filterMenuRef = useRef(null);
  const sortMenuRef = useRef(null);

  // Fetch users on mount and when filters or sort change
  useEffect(() => {
    const params = {
      page: currentPage,
      limit: itemsPerPage,
      search: searchTerm,
      status: statusFilter,
      roleId: roleFilter,
      sortField,
      sortOrder,
    };
    dispatch(fetchUsers(params));
  }, [
    dispatch,
    currentPage,
    itemsPerPage,
    searchTerm,
    statusFilter,
    roleFilter,
    sortField,
    sortOrder,
  ]);

  // Fetch roles on mount
  useEffect(() => {
    if (roles.length === 0) {
      dispatch(fetchRoles());
    }
  }, [dispatch, roles.length]);

  // Reset selected items when users change
  useEffect(() => {
    setSelectedItems([]);
    setSelectAll(false);
  }, [users]);

  // Close filter menu on outside click
  useOutsideClick(filterMenuRef, () => {
    if (showFilterMenu) setShowFilterMenu(false);
  });

  // Close sort menu on outside click
  useOutsideClick(sortMenuRef, () => {
    if (showSortMenu) setShowSortMenu(false);
  });

  const handleSort = (field) => {
    dispatch(setSortField(field));
    setShowSortMenu(false);
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      dispatch(deleteUser(id));
    }
  };

  const handleBulkDelete = (items) => {
    if (
      window.confirm(
        `Are you sure you want to delete ${items.length} selected user(s)?`
      )
    ) {
      items.forEach((id) => dispatch(deleteUser(id)));
      setSelectedItems([]);
      setSelectAll(false);
    }
  };

  const handleEdit = (user) => {
    console.log("Editing user:", user);
    setEditingUser(user);
    setIsNewUserModalOpen(true);
  };

  const handleSearch = (e) => {
    dispatch(setSearchTerm(e.target.value));
  };

  const handleStatusFilter = (status) => {
    dispatch(setStatusFilter(status));
    setShowFilterMenu(false);
  };

  const handleRoleFilter = (roleId) => {
    setRoleFilter(roleId);
    setShowFilterMenu(false);
  };

  const clearFilters = () => {
    dispatch(setStatusFilter(""));
    setRoleFilter("");
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (statusFilter) count++;
    if (roleFilter) count++;
    return count;
  };

  const getFilterSummary = () => {
    const filters = [];
    if (statusFilter) {
      filters.push(`Status: ${statusFilter}`);
    }
    if (roleFilter) {
      const role = roles.find((r) => r.id === roleFilter);
      filters.push(`Role: ${role ? role.role_type : "Unknown"}`);
    }
    return filters;
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedItems([]);
      setSelectAll(false);
    } else {
      setSelectedItems(users.map((user) => user.id));
      setSelectAll(true);
    }
  };

  const handleSelectItem = (id) => {
    if (selectedItems.includes(id)) {
      setSelectedItems(selectedItems.filter((item) => item !== id));
      setSelectAll(false);
    } else {
      const newSelected = [...selectedItems, id];
      setSelectedItems(newSelected);
      setSelectAll(newSelected.length === users.length);
    }
  };

  const handleExport = async (items) => {
    const usersToExport =
      items.length > 0
        ? users.filter((user) => items.includes(user.id))
        : users;
    exportUsersToCSV(usersToExport);
  };

  const handleImport = async (data) => {
    // Validate the imported data
    const validation = validateUserCSV(data);
    if (!validation.isValid) {
      alert(`Import failed: ${validation.errors.join(", ")}`);
      return;
    }

    // Dispatch the import action
    const result = await dispatch(importUsers(data));
    if (result.meta.requestStatus === "fulfilled") {
      // Refresh the users list
      const params = {
        page: currentPage,
        limit: itemsPerPage,
        search: searchTerm,
        status: statusFilter,
      };
      dispatch(fetchUsers(params));
    }
  };

  // Get sort icon
  const getSortIcon = (field) => {
    if (sortField !== field) return null;
    return (
      <span className="ml-1 flex items-center">
        {sortOrder === "asc" ? (
          <ChevronUp size={16} className="text-blue-600" />
        ) : (
          <ChevronDown size={16} className="text-blue-600" />
        )}
      </span>
    );
  };

  // Get status badge
  const getStatusBadge = (status) => {
    switch (status) {
      case "Active":
        return <Badge variant="success">Active</Badge>;
      case "Inactive":
        return <Badge variant="warning">Inactive</Badge>;
      case "Deactivated":
        return <Badge variant="danger">Deactivated</Badge>;
      case "Banned":
        return <Badge variant="danger">Banned</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  // Action menu configuration
  const getActionMenu = (user) => [
    {
      label: "Edit",
      icon: <Edit size={16} />,
      onClick: () => handleEdit(user),
    },
    {
      label: "Delete",
      icon: <Trash size={16} />,
      onClick: () => handleDelete(user.id),
      className: "text-red-600 hover:text-red-700 hover:bg-red-50",
    },
  ];

  if (loading && users.length === 0) {
    return <LoadingOverlay title="Users" description="Loading user data..." />;
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-red-600">
        <span className="text-2xl font-bold mb-2">Error</span>
        <span>{error}</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 bg-white text-gray-900 dark:bg-background dark:text-text min-h-screen p-4 sm:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Users
        </h1>

        <div className="flex flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            size="sm"
            icon={<Download size={16} />}
            onClick={() => handleExport([])}
          >
            Export All
          </Button>
          <Button
            variant="outline"
            size="sm"
            icon={<Upload size={16} />}
            onClick={() => setIsImportModalOpen(true)}
          >
            Import CSV
          </Button>
          <Button
            variant="primary"
            size="sm"
            icon={<Plus size={16} />}
            onClick={() => {
              setEditingUser(null);
              setIsNewUserModalOpen(true);
            }}
          >
            Add New User
          </Button>
        </div>
      </div>

      {/* Bulk Actions */}
      <BulkActions
        selectedItems={selectedItems}
        onDelete={handleBulkDelete}
        onExport={handleExport}
        onImport={handleImport}
        importConfig={{
          description:
            "Import users from a CSV file. The file should contain columns for First Name, Last Name, Email, Phone, Role, and Status.",
          requiredFields: ["First Name", "Last Name", "Email"],
          validate: validateUserCSV,
        }}
        showImport={false}
        showExport={true}
        showDelete={true}
      />

      {/* Search and Filters */}
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="relative flex-1">
          <Input
            placeholder="Search users by name or email..."
            icon={<Search size={18} className="text-gray-400" />}
            value={searchTerm}
            onChange={handleSearch}
            className="w-full"
          />
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative" ref={filterMenuRef}>
            <Button
              variant="outline"
              icon={<Filter size={16} />}
              onClick={() => {
                setShowFilterMenu(!showFilterMenu);
                setShowSortMenu(false);
              }}
              className="relative"
            >
              Filter
              {getActiveFiltersCount() > 0 && (
                <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {getActiveFiltersCount()}
                </span>
              )}
            </Button>

            {showFilterMenu && (
              <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-6 z-50">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Filter Users
                  </h3>
                  <button
                    onClick={() => setShowFilterMenu(false)}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <X size={20} />
                  </button>
                </div>

                {/* Status Filter */}
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-3">
                    <Shield size={16} className="text-gray-500" />
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
                      Status
                    </label>
                  </div>
                  <select
                    value={statusFilter}
                    onChange={(e) => handleStatusFilter(e.target.value)}
                    className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm p-2"
                  >
                    <option value="">All Statuses</option>
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                    <option value="Deactivated">Deactivated</option>
                    <option value="Banned">Banned</option>
                  </select>
                </div>

                {/* Role Filter */}
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-3">
                    <User size={16} className="text-gray-500" />
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
                      Role
                    </label>
                  </div>
                  <select
                    value={roleFilter}
                    onChange={(e) => handleRoleFilter(e.target.value)}
                    className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm p-2"
                  >
                    <option value="">All Roles</option>
                    {roles.map((role) => (
                      <option key={role.id} value={role.id}>
                        {role.role_type}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Clear Filters */}
                {(statusFilter || roleFilter) && (
                  <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                    <button
                      onClick={clearFilters}
                      className="w-full px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md transition-colors"
                    >
                      Clear All Filters
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="relative" ref={sortMenuRef}>
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
              <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden z-50">
                {[
                  { field: "firstName", label: "First Name" },
                  { field: "lastName", label: "Last Name" },
                  { field: "email", label: "Email" },
                  { field: "status", label: "Status" },
                  { field: "createdAt", label: "Created Date" },
                ].map(({ field, label }) => (
                  <button
                    key={field}
                    className={`w-full px-4 py-2 text-left flex items-center justify-between transition-colors
                      ${
                        sortField === field
                          ? "bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-semibold"
                          : "hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200"
                      }`}
                    onClick={() => handleSort(field)}
                  >
                    <span className="flex items-center gap-2">
                      {label}
                      {sortField === field &&
                        (sortOrder === "asc" ? (
                          <ChevronUp size={16} className="text-blue-600" />
                        ) : (
                          <ChevronDown size={16} className="text-blue-600" />
                        ))}
                    </span>
                    {sortField === field && (
                      <Check
                        size={16}
                        className="text-indigo-600 dark:text-indigo-400"
                      />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Active Filters Summary */}
      {getActiveFiltersCount() > 0 && (
        <div className="flex flex-wrap items-center gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
            Active Filters:
          </span>
          {getFilterSummary().map((filter, index) => (
            <Badge key={index} variant="primary" className="text-xs">
              {filter}
            </Badge>
          ))}
          <button
            onClick={clearFilters}
            className="ml-auto text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 font-medium"
          >
            Clear All
          </button>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden dark:bg-background-secondary dark:border-background-secondary overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <input
                  type="checkbox"
                  checked={selectAll}
                  onChange={handleSelectAll}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
              </TableHead>
              <TableHead
                className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700"
                onClick={() => handleSort("firstName")}
              >
                <div className="flex items-center gap-1">
                  User
                  {getSortIcon("firstName")}
                </div>
              </TableHead>
              <TableHead
                className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700"
                onClick={() => handleSort("email")}
              >
                <div className="flex items-center gap-1">
                  Email
                  {getSortIcon("email")}
                </div>
              </TableHead>
              <TableHead className="hidden md:table-cell">Role</TableHead>
              <TableHead
                className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700"
                onClick={() => handleSort("status")}
              >
                <div className="flex items-center gap-1">
                  Status
                  {getSortIcon("status")}
                </div>
              </TableHead>
              <TableHead className="hidden lg:table-cell">
                Employee ID
              </TableHead>
              <TableHead
                className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 hidden xl:table-cell"
                onClick={() => handleSort("createdAt")}
              >
                <div className="flex items-center gap-1">
                  Created At
                  {getSortIcon("createdAt")}
                </div>
              </TableHead>
              <TableHead className="text-right w-16">Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {loading && users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="py-16 text-center">
                  <div className="flex flex-col items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <span className="mt-2 text-gray-500">Loading...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : users.length > 0 ? (
              users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <input
                      type="checkbox"
                      checked={selectedItems.includes(user.id)}
                      onChange={() => handleSelectItem(user.id)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                        <UserCircle size={20} className="text-gray-400" />
                      </div>
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">
                          {user.firstName} {user.lastName}
                        </div>
                        {user.phone && (
                          <div className="text-sm text-gray-500 hidden sm:block">
                            {user.phone}
                          </div>
                        )}
                      </div>
                    </div>
                  </TableCell>

                  <TableCell>
                    <div className="text-sm text-gray-900 dark:text-white">
                      {user.email}
                    </div>
                  </TableCell>

                  <TableCell className="hidden md:table-cell">
                    <Badge
                      variant={
                        user.role?.role_type === "admin"
                          ? "primary"
                          : "secondary"
                      }
                    >
                      {user.role?.role_type || "User"}
                    </Badge>
                  </TableCell>

                  <TableCell>{getStatusBadge(user.status)}</TableCell>

                  <TableCell className="hidden lg:table-cell">
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {user.employeeId || "N/A"}
                    </div>
                  </TableCell>

                  <TableCell className="hidden xl:table-cell">
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </div>
                  </TableCell>

                  <TableCell className="text-right">
                    <ActionMenu
                      actions={getActionMenu(user)}
                      item={user}
                      className="flex justify-end"
                    />
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={8} className="h-32 text-center">
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

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center">
          <Pagination sliceName="user" />
        </div>
      )}

      <NewUserModal
        isOpen={isNewUserModalOpen}
        onClose={() => {
          setIsNewUserModalOpen(false);
          setEditingUser(null);
        }}
        onSuccess={() => {
          const params = {
            page: currentPage,
            limit: itemsPerPage,
            search: searchTerm,
            status: statusFilter,
          };
          dispatch(fetchUsers(params));
        }}
        editingUser={editingUser}
      />

      {/* Import Modal */}
      <CSVImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImport={handleImport}
        config={{
          description:
            "Import users from a CSV file. The file should contain columns for First Name, Last Name, Email, Phone, Role, and Status.",
          requiredFields: ["First Name", "Last Name", "Email"],
          validate: validateUserCSV,
        }}
      />
    </div>
  );
};

export default UsersPage;
