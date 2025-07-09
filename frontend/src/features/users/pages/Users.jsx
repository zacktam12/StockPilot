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
  Calendar,
  Mail,
  Phone,
} from "lucide-react";

import { useDispatch, useSelector } from "react-redux";
import {
  fetchUsers,
  deleteUser,
  setSearchTerm,
  setStatusFilter,
  setRoleFilter,
  setSortField,
  importUsers,
  setCurrentPage,
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
    roleFilter,
    sortField,
    sortOrder,
    totalItems,
  } = useSelector((state) => state.user);

  const { roles = [] } = useSelector((state) => state.role || {});

  const [isNewUserModalOpen, setIsNewUserModalOpen] = React.useState(false);
  const [editingUser, setEditingUser] = React.useState(null);
  const [showFilterMenu, setShowFilterMenu] = React.useState(false);
  const [showSortMenu, setShowSortMenu] = React.useState(false);
  const [selectedItems, setSelectedItems] = React.useState([]);
  const [selectAll, setSelectAll] = React.useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = React.useState(false);

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
    console.log("Fetching users with params:", params);
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
    console.log("Sorting by:", field);
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
  //
  const handleEdit = (user) => {
    console.log("Editing user:", user);
    setEditingUser(user);
    setIsNewUserModalOpen(true);
  };

  const handleSearch = (e) => {
    dispatch(setSearchTerm(e.target.value));
  };

  const handleStatusFilter = (status) => {
    console.log("Filtering by status:", status);
    dispatch(setStatusFilter(status));
    setShowFilterMenu(false);
  };

  const handleRoleFilter = (roleId) => {
    console.log("Filtering by role:", roleId);
    dispatch(setRoleFilter(roleId));
    setShowFilterMenu(false);
  };

  const clearFilters = () => {
    dispatch(setStatusFilter(""));
    dispatch(setRoleFilter(""));
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
    } else {
      setSelectedItems(users.map((user) => user.id));
    }
    setSelectAll(!selectAll);
  };

  const handleSelectItem = (id) => {
    if (selectedItems.includes(id)) {
      setSelectedItems(selectedItems.filter((item) => item !== id));
    } else {
      setSelectedItems([...selectedItems, id]);
    }
  };

  const handleExport = async (items) => {
    const dataToExport = items.length > 0 ? items : users;
    await exportUsersToCSV(dataToExport);
  };

  const handleImport = async (data) => {
    try {
      await dispatch(importUsers(data));
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
    } catch (error) {
      console.error("Import failed:", error);
    }
  };

  const getSortIcon = (field) => {
    if (sortField === field) {
      return sortOrder === "asc" ? (
        <ChevronUp size={16} className="text-blue-600" />
      ) : (
        <ChevronDown size={16} className="text-blue-600" />
      );
    }
    return <ArrowUpDown size={16} className="text-gray-400" />;
  };

  const getStatusBadge = (status) => {
    const variants = {
      Active: "success",
      Inactive: "warning",
      Deactivated: "danger",
      Banned: "danger",
    };
    return (
      <Badge
        variant={variants[status] || "secondary"}
        className="px-2 py-1 text-xs font-medium"
      >
        {status}
      </Badge>
    );
  };

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
      className: "text-red-600 hover:text-red-700",
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
    <>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 overflow-x-hidden relative z-0">
        <div className="w-full max-w-full relative z-10">
          {/* Header Section */}
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-b border-gray-200/50 dark:border-gray-700/50 sticky top-0 z-10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-6">
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="p-2 sm:p-3 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl sm:rounded-2xl shadow-lg">
                    <UserCircle className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                  </div>
                  <div>
                    <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                      User Management
                    </h1>
                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1">
                      Manage system users, roles, and permissions
                    </p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                  <Button
                    variant="outline"
                    size="sm"
                    icon={<Download size={16} />}
                    onClick={() => handleExport([])}
                    className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-gray-200 dark:border-gray-600 hover:bg-white dark:hover:bg-gray-800 shadow-sm"
                  >
                    <span className="hidden sm:inline">Export All</span>
                    <span className="sm:hidden">Export</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    icon={<Upload size={16} />}
                    onClick={() => setIsImportModalOpen(true)}
                    className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-gray-200 dark:border-gray-600 hover:bg-white dark:hover:bg-gray-800 shadow-sm"
                  >
                    <span className="hidden sm:inline">Import CSV</span>
                    <span className="sm:hidden">Import</span>
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    icon={<Plus size={16} />}
                    onClick={() => {
                      setEditingUser(null);
                      setIsNewUserModalOpen(true);
                    }}
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                  >
                    <span className="hidden sm:inline">Add New User</span>
                    <span className="sm:hidden">Add User</span>
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-2 sm:space-y-3 w-full relative z-10">
            {/* Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
              <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-gray-200/50 dark:border-gray-700/50 shadow-lg hover:shadow-xl transition-all duration-300">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">
                      Total Users
                    </p>
                    <p className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mt-1 sm:mt-2">
                      {users.length}
                    </p>
                  </div>
                  <div className="p-2 sm:p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg sm:rounded-xl">
                    <UserCircle className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                </div>
              </div>

              <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-gray-200/50 dark:border-gray-700/50 shadow-lg hover:shadow-xl transition-all duration-300">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">
                      Active Users
                    </p>
                    <p className="text-2xl sm:text-3xl font-bold text-green-600 dark:text-green-400 mt-1 sm:mt-2">
                      {users.filter((user) => user.status === "Active").length}
                    </p>
                  </div>
                  <div className="p-2 sm:p-3 bg-green-100 dark:bg-green-900/30 rounded-lg sm:rounded-xl">
                    <Check className="w-5 h-5 sm:w-6 sm:h-6 text-green-600 dark:text-green-400" />
                  </div>
                </div>
              </div>

              <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-gray-200/50 dark:border-gray-700/50 shadow-lg hover:shadow-xl transition-all duration-300">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">
                      Admin Users
                    </p>
                    <p className="text-2xl sm:text-3xl font-bold text-purple-600 dark:text-purple-400 mt-1 sm:mt-2">
                      {
                        users.filter((user) => user.role?.role_type === "admin")
                          .length
                      }
                    </p>
                  </div>
                  <div className="p-2 sm:p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg sm:rounded-xl">
                    <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600 dark:text-purple-400" />
                  </div>
                </div>
              </div>

              <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-gray-200/50 dark:border-gray-700/50 shadow-lg hover:shadow-xl transition-all duration-300">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">
                      Inactive Users
                    </p>
                    <p className="text-2xl sm:text-3xl font-bold text-orange-600 dark:text-orange-400 mt-1 sm:mt-2">
                      {users.filter((user) => user.status !== "Active").length}
                    </p>
                  </div>
                  <div className="p-2 sm:p-3 bg-orange-100 dark:bg-orange-900/30 rounded-lg sm:rounded-xl">
                    <X className="w-5 h-5 sm:w-6 sm:h-6 text-orange-600 dark:text-orange-400" />
                  </div>
                </div>
              </div>
            </div>

            {/* Bulk Actions */}
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl sm:rounded-2xl border border-gray-200/50 dark:border-gray-700/50 shadow-lg mt-2">
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
            </div>

            {/* Search and Filters */}
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-gray-200/50 dark:border-gray-700/50 shadow-lg relative z-20 mt-2">
              <div className="flex flex-col lg:flex-row gap-2 sm:gap-3">
                <div className="relative flex-1">
                  <div className="relative">
                    <Input
                      placeholder="Search users by name, email, or phone..."
                      icon={<Search size={18} className="text-gray-400" />}
                      value={searchTerm}
                      onChange={handleSearch}
                      className="w-full bg-white/50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400"
                    />
                    {searchTerm && (
                      <button
                        onClick={() => dispatch(setSearchTerm(""))}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                      >
                        <X size={16} />
                      </button>
                    )}
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative" ref={filterMenuRef}>
                    <Button
                      variant="outline"
                      icon={<Filter size={16} />}
                      onClick={() => {
                        setShowFilterMenu(!showFilterMenu);
                        setShowSortMenu(false);
                      }}
                      className="relative bg-white/50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-600 hover:bg-white dark:hover:bg-gray-700 shadow-sm"
                    >
                      Filter
                      {getActiveFiltersCount() > 0 && (
                        <span className="absolute -top-1 -right-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center shadow-lg">
                          {getActiveFiltersCount()}
                        </span>
                      )}
                    </Button>

                    {showFilterMenu && (
                      <div className="absolute right-0 mt-3 w-80 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-2xl shadow-2xl border border-gray-200/50 dark:border-gray-700/50 p-6 z-[999999]">
                        <div className="flex items-center justify-between mb-6">
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                            Filter Users
                          </h3>
                          <button
                            onClick={() => setShowFilterMenu(false)}
                            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
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
                            className="w-full rounded-xl border border-gray-200 dark:border-gray-600 bg-white/50 dark:bg-gray-700/50 text-gray-900 dark:text-white shadow-sm p-3 focus:border-blue-500 dark:focus:border-blue-400 transition-colors"
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
                            className="w-full rounded-xl border border-gray-200 dark:border-gray-600 bg-white/50 dark:bg-gray-700/50 text-gray-900 dark:text-white shadow-sm p-3 focus:border-blue-500 dark:focus:border-blue-400 transition-colors"
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
                        <div className="flex gap-3">
                          <Button
                            variant="outline"
                            onClick={clearFilters}
                            className="flex-1 bg-white/50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-600 hover:bg-white dark:hover:bg-gray-700"
                          >
                            Clear Filters
                          </Button>
                          <Button
                            variant="primary"
                            onClick={() => setShowFilterMenu(false)}
                            className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                          >
                            Apply
                          </Button>
                        </div>
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
                      className="bg-white/50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-600 hover:bg-white dark:hover:bg-gray-700 shadow-sm"
                    >
                      Sort
                    </Button>

                    {showSortMenu && (
                      <div className="absolute right-0 mt-3 w-64 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-2xl shadow-2xl border border-gray-200/50 dark:border-gray-700/50 p-4 z-[999999]">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                            Sort By
                          </h3>
                          <button
                            onClick={() => setShowSortMenu(false)}
                            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                          >
                            <X size={20} />
                          </button>
                        </div>

                        {[
                          { field: "firstName", label: "Name" },
                          { field: "email", label: "Email" },
                          { field: "status", label: "Status" },
                          { field: "createdAt", label: "Created Date" },
                        ].map(({ field, label }) => (
                          <button
                            key={field}
                            className={`w-full flex items-center justify-between p-3 rounded-xl transition-all duration-200 mb-2 ${
                              sortField === field
                                ? "bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 text-blue-700 dark:text-blue-300 font-semibold"
                                : "hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200"
                            }`}
                            onClick={() => handleSort(field)}
                          >
                            <span className="flex items-center gap-2">
                              {label}
                              {sortField === field &&
                                (sortOrder === "asc" ? (
                                  <ChevronUp
                                    size={16}
                                    className="text-blue-600"
                                  />
                                ) : (
                                  <ChevronDown
                                    size={16}
                                    className="text-blue-600"
                                  />
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
            </div>

            {/* Active Filters Summary */}
            {getActiveFiltersCount() > 0 && (
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 backdrop-blur-sm rounded-xl sm:rounded-2xl p-3 border border-blue-200/50 dark:border-blue-800/50 shadow-lg mt-2">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="text-sm font-semibold text-blue-700 dark:text-blue-300 flex items-center gap-2">
                    <Filter size={16} />
                    Active Filters:
                  </span>
                  {getFilterSummary().map((filter, index) => (
                    <Badge
                      key={index}
                      variant="primary"
                      className="text-xs bg-blue-600 text-white shadow-sm"
                    >
                      {filter}
                    </Badge>
                  ))}
                  <button
                    onClick={clearFilters}
                    className="ml-auto text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 font-medium px-3 py-1 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
                  >
                    Clear All
                  </button>
                </div>
              </div>
            )}

            {/* Table */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-soft overflow-hidden">
              <div className="overflow-x-auto">
                <Table className="min-w-[900px] text-sm">
                  <TableHeader>
                    <TableRow className="bg-gray-50 dark:bg-gray-900 border-b border-gray-100 dark:border-gray-700">
                      <TableHead className="w-8 px-2 py-2">
                        <input
                          type="checkbox"
                          checked={selectAll}
                          onChange={handleSelectAll}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 focus:ring-2"
                        />
                      </TableHead>
                      <TableHead
                        className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors px-2 py-2 min-w-[120px]"
                        onClick={() => handleSort("firstName")}
                      >
                        <div className="flex items-center gap-1 font-semibold text-gray-900 dark:text-white">
                          <UserCircle size={14} className="text-gray-500" />
                          <span className="hidden sm:inline">User</span>
                          <span className="sm:hidden">Name</span>
                          {getSortIcon("firstName")}
                        </div>
                      </TableHead>
                      <TableHead
                        className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors px-2 py-2 min-w-[120px] hidden sm:table-cell"
                        onClick={() => handleSort("email")}
                      >
                        <div className="flex items-center gap-1 font-semibold text-gray-900 dark:text-white">
                          <Mail size={14} className="text-gray-500" />
                          Email
                          {getSortIcon("email")}
                        </div>
                      </TableHead>
                      <TableHead className="hidden md:table-cell px-2 py-2 min-w-[70px]">
                        <div className="flex items-center gap-1 font-semibold text-gray-900 dark:text-white">
                          <Shield size={14} className="text-gray-500" />
                          <span className="hidden lg:inline">Role</span>
                        </div>
                      </TableHead>
                      <TableHead
                        className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors px-2 py-2 min-w-[70px]"
                        onClick={() => handleSort("status")}
                      >
                        <div className="flex items-center gap-1 font-semibold text-gray-900 dark:text-white">
                          <Check size={14} className="text-gray-500" />
                          Status
                          {getSortIcon("status")}
                        </div>
                      </TableHead>
                      <TableHead className="hidden xl:table-cell px-2 py-2 min-w-[80px]">
                        <div className="flex items-center gap-1 font-semibold text-gray-900 dark:text-white">
                          <User size={14} className="text-gray-500" />
                          <span className="hidden 2xl:inline">Employee ID</span>
                          <span className="2xl:hidden">Emp ID</span>
                        </div>
                      </TableHead>
                      <TableHead
                        className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors px-2 py-2 hidden 2xl:table-cell min-w-[80px]"
                        onClick={() => handleSort("createdAt")}
                      >
                        <div className="flex items-center gap-1 font-semibold text-gray-900 dark:text-white">
                          <Calendar size={14} className="text-gray-500" />
                          Created
                          {getSortIcon("createdAt")}
                        </div>
                      </TableHead>
                      <TableHead className="text-right w-10 px-2 py-2 min-w-[40px]">
                        <div className="flex items-center justify-end gap-1 font-semibold text-gray-900 dark:text-white">
                          <MoreHorizontal size={14} className="text-gray-500" />
                          <span className="hidden sm:inline">Actions</span>
                        </div>
                      </TableHead>
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    {loading && users.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="py-16 text-center">
                          <div className="flex flex-col items-center justify-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-200 border-t-blue-600"></div>
                            <span className="mt-2 text-gray-600 dark:text-gray-400 font-medium">
                              Loading users...
                            </span>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : users.length > 0 ? (
                      users.map((user) => (
                        <TableRow
                          key={user.id}
                          className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
                        >
                          <TableCell className="px-3 py-3">
                            <input
                              type="checkbox"
                              checked={selectedItems.includes(user.id)}
                              onChange={() => handleSelectItem(user.id)}
                              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 focus:ring-2"
                            />
                          </TableCell>
                          <TableCell className="px-3 py-3">
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
                                <UserCircle
                                  size={14}
                                  className="text-white sm:w-4 sm:h-4"
                                />
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="font-semibold text-gray-900 dark:text-white text-xs sm:text-sm truncate">
                                  {user.firstName} {user.lastName}
                                </div>
                                {user.phone && (
                                  <div className="text-xs text-gray-500 dark:text-gray-400 hidden sm:block flex items-center gap-1 mt-0.5">
                                    <Phone size={12} />
                                    {user.phone}
                                  </div>
                                )}
                                <div className="text-xs text-gray-500 dark:text-gray-400 sm:hidden mt-0.5 truncate">
                                  {user.email}
                                </div>
                              </div>
                            </div>
                          </TableCell>

                          <TableCell className="hidden sm:table-cell px-3 py-3">
                            <div className="text-xs text-gray-900 dark:text-white font-medium truncate">
                              {user.email}
                            </div>
                          </TableCell>

                          <TableCell className="hidden md:table-cell px-3 py-3">
                            <Badge
                              variant={
                                user.role?.role_type === "admin"
                                  ? "primary"
                                  : "secondary"
                              }
                              className="px-1 py-0.5 text-xs font-medium"
                            >
                              <span className="hidden lg:inline">
                                {user.role?.role_type || "Staff"}
                              </span>
                              <span className="lg:hidden">
                                {user.role?.role_type
                                  ?.charAt(0)
                                  .toUpperCase() || "U"}
                              </span>
                            </Badge>
                          </TableCell>

                          <TableCell className="px-3 py-3">
                            {getStatusBadge(user.status)}
                          </TableCell>

                          <TableCell className="hidden xl:table-cell px-3 py-3">
                            <div className="text-xs text-gray-600 dark:text-gray-400 font-medium">
                              {user.employeeId || "N/A"}
                            </div>
                          </TableCell>

                          <TableCell className="hidden 2xl:table-cell px-3 py-3">
                            <div className="text-xs text-gray-600 dark:text-gray-400 font-medium">
                              {new Date(user.createdAt).toLocaleDateString()}
                            </div>
                          </TableCell>

                          <TableCell className="text-right px-3 py-3">
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
                          <div className="flex flex-col items-center justify-center text-gray-500 dark:text-gray-400">
                            <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center mb-2">
                              <UserCircle size={24} className="text-gray-400" />
                            </div>
                            <h3 className="text-base font-semibold text-gray-700 dark:text-gray-300 mb-1">
                              No users found
                            </h3>
                            <p className="text-xs text-gray-500 dark:text-gray-400 max-w-md">
                              Try adjusting your search criteria or filters to
                              find the users you're looking for.
                            </p>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>

            {/* Enhanced Pagination - Matching Other Pages */}
            {totalPages > 1 && (
              <div className="mt-6 flex justify-between items-center bg-white dark:bg-gray-800 rounded-2xl shadow-soft p-4 border border-gray-100 dark:border-gray-700">
                <Button
                  variant="outline"
                  onClick={() => dispatch(setCurrentPage(currentPage - 1))}
                  disabled={currentPage === 1}
                  className="flex items-center gap-2"
                >
                  ← Previous
                </Button>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  onClick={() => dispatch(setCurrentPage(currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="flex items-center gap-2"
                >
                  Next →
                </Button>
              </div>
            )}

            {/* Page Info */}
            {users.length > 0 && (
              <div className="mt-4 text-center text-sm text-gray-600 dark:text-gray-400">
                Showing {users.length} of {totalItems} users
              </div>
            )}
          </div>
        </div>
      </div>

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
    </>
  );
};

export default UsersPage;
