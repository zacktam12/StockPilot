import React from "react";
import { 
  Edit, 
  Trash, 
  UserCircle, 
  ChevronUp,
  ChevronDown
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../components/shared/Table";
import Badge from "../../../components/shared/Badge";
import ActionMenu from "../../../components/shared/ActionMenu";

const UsersTable = ({ 
  users, 
  selectedItems, 
  onSelectAll, 
  onSelectItem, 
  loading, 
  onEdit, 
  onDelete,
  sortField,
  sortOrder,
  onSort
}) => {
  const getSortIcon = (field) => {
    if (sortField !== field) return null;
      return sortOrder === "asc" ? (
      <ChevronUp size={16} />
      ) : (
      <ChevronDown size={16} />
      );
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

  const getActionMenu = (user) => {
    const actions = [
      {
        label: "Edit",
        icon: <Edit size={16} />,
        onClick: () => onEdit(user),
      }
    ];

    // Only show deactivate option if user is not already deactivated
    if (user.status !== 'Deactivated') {
      actions.push({
        label: "Deactivate",
        icon: <Trash size={16} />,
        onClick: () => onDelete(user.id),
        className: "text-red-600 hover:text-red-700",
      });
    }

    return actions;
  };

  const UsersTableHeader = () => (
    <TableHeader>
      <TableRow>
        <TableHead className="w-8 pr-2">
          <input
            type="checkbox"
            checked={selectedItems.length === users.length && users.length > 0}
            onChange={onSelectAll}
            className="rounded-none border-gray-300 text-blue-600 focus:ring-gray-400"
          />
        </TableHead>
        <TableHead
          className="cursor-pointer hover:bg-gray-100 min-w-[180px] pl-2"
          onClick={() => onSort("firstName")}
        >
          <div className="flex items-center gap-1">
            User Name
            {getSortIcon("firstName")}
          </div>
        </TableHead>
        <TableHead
          className="cursor-pointer hover:bg-gray-100 min-w-[200px]"
          onClick={() => onSort("email")}
        >
          <div className="flex items-center gap-1">
            Email
            {getSortIcon("email")}
          </div>
        </TableHead>
        <TableHead className="min-w-[100px]">Role</TableHead>
        <TableHead className="min-w-[120px]">Employee ID</TableHead>
        <TableHead
          className="cursor-pointer hover:bg-gray-100 min-w-[100px]"
          onClick={() => onSort("status")}
        >
          <div className="flex items-center gap-1">
            Status
            {getSortIcon("status")}
          </div>
        </TableHead>
        <TableHead
          className="cursor-pointer hover:bg-gray-100 min-w-[120px]"
          onClick={() => onSort("createdAt")}
        >
          <div className="flex items-center gap-1">
            Created
            {getSortIcon("createdAt")}
          </div>
        </TableHead>
        <TableHead className="min-w-[80px]">Actions</TableHead>
      </TableRow>
    </TableHeader>
  );

  const UsersTableRow = ({ user }) => (
    <TableRow className="border-b border-gray-200 hover:bg-gray-50 cursor-pointer bg-white even:bg-gray-50">
      <TableCell className="w-8 pr-2">
        <input
          type="checkbox"
          checked={selectedItems.includes(user.id)}
          onChange={() => onSelectItem(user.id)}
          className="rounded-none border-gray-300 text-blue-600 focus:ring-gray-400"
        />
      </TableCell>
      <TableCell className="min-w-[180px] pl-2 font-medium">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center flex-shrink-0">
            <UserCircle size={16} className="text-white" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="font-medium text-gray-900 truncate">{user.firstName} {user.lastName}</div>
            {user.phone && (
              <div className="text-sm text-gray-500 truncate">
                {user.phone}
              </div>
            )}
          </div>
        </div>
      </TableCell>
      <TableCell className="min-w-[200px] text-gray-900">
        <span className="truncate block">{user.email}</span>
      </TableCell>
      <TableCell className="min-w-[100px] text-gray-900">
        <span className="truncate block">{user.role?.role_type || "Staff"}</span>
      </TableCell>
      <TableCell className="min-w-[120px] text-gray-900">
        <span className="truncate block">{user.employeeId || "N/A"}</span>
      </TableCell>
      <TableCell className="min-w-[100px]">
        {getStatusBadge(user.status)}
      </TableCell>
      <TableCell className="min-w-[120px] text-gray-900">
        <span className="text-sm">{new Date(user.createdAt).toLocaleDateString()}</span>
      </TableCell>
      <TableCell className="min-w-[80px]">
        <ActionMenu
          actions={getActionMenu(user)}
          item={user}
        />
      </TableCell>
    </TableRow>
  );

  const UsersEmptyState = () => (
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
  );

  const UsersTableBody = () => {
    if (loading && users.length === 0) {
      return (
        <TableBody>
        <TableRow>
            <TableCell colSpan={8} className="text-center py-8">
            <div className="flex flex-col items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-200 border-t-blue-600"></div>
                <span className="mt-2 text-gray-600 font-medium">
                Loading users...
              </span>
            </div>
          </TableCell>
        </TableRow>
        </TableBody>
      );
    }

    if (users.length === 0) {
      return (
        <TableBody>
        <TableRow>
            <TableCell colSpan={8} className="text-center py-8">
            <UsersEmptyState />
          </TableCell>
        </TableRow>
        </TableBody>
      );
    }

    return (
      <TableBody>
        {users.map((user) => (
          <UsersTableRow key={user.id} user={user} />
        ))}
      </TableBody>
    );
  };

  return (
    <div className="bg-white rounded-lg border-0 shadow-sm overflow-hidden">
      <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
        <Table className="min-w-[1000px] w-full">
          <UsersTableHeader />
          <UsersTableBody />
        </Table>
      </div>
    </div>
  );
};

export default UsersTable;
