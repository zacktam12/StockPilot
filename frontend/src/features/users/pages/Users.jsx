import React, { useEffect } from "react";
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
import UsersHeader from "../components/UsersHeader";
import UsersStats from "../components/UsersStats";
import UsersTable from "../components/UsersTable";
import UsersActions from "../components/UsersActions";
import UsersErrorState from "../components/UsersErrorState";
import LoadingOverlay from "../../../components/shared/LoadingOverlay";
import UnifiedPagination from "../../../components/shared/UnifiedPagination";
import ConfirmationModal from "../../../components/shared/ConfirmationModal";
import { exportUsersToCSV } from "../../../utils/csvUtils";

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
  const [deleteConfirmation, setDeleteConfirmation] = React.useState({
    isOpen: false,
    userId: null,
    userName: ""
  });

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


  const handleSort = (field) => {
    dispatch(setSortField(field));
    setShowSortMenu(false);
  };

  const handleDelete = (id) => {
    const user = users.find(u => u.id === id);
    setDeleteConfirmation({
      isOpen: true,
      userId: id,
      userName: user ? `${user.firstName} ${user.lastName}` : "this user"
    });
  };

  const confirmDelete = async () => {
    if (!deleteConfirmation.userId) return;

    try {
      await dispatch(deleteUser(deleteConfirmation.userId)).unwrap();
      // Refetch users to show updated status
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
      console.error("Failed to deactivate user:", error);
    } finally {
      setDeleteConfirmation({
        isOpen: false,
        userId: null,
        userName: ""
      });
    }
  };

  const cancelDelete = () => {
    setDeleteConfirmation({
      isOpen: false,
      userId: null,
      userName: ""
    });
  };


  const handleEdit = (user) => {
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
    dispatch(setRoleFilter(roleId));
    setShowFilterMenu(false);
  };

  const clearFilters = () => {
    dispatch(setStatusFilter(""));
    dispatch(setRoleFilter(""));
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


  if (loading && users.length === 0) {
    return <LoadingOverlay title="Users" description="Loading user data..." />;
  }

  if (error) {
    return <UsersErrorState error={error} />;
  }

  return (
    <div className="space-y-8 bg-white text-gray-900 dark:bg-background dark:text-text min-h-screen p-4 sm:p-6">
      {/* Header with integrated search */}
      <UsersHeader 
        onExportAll={() => handleExport([])} 
        onImportCSV={() => {
          // Import functionality is handled in the header actions dropdown
        }}
        onAddNew={() => {
          setEditingUser(null);
          setIsNewUserModalOpen(true);
        }}
        searchTerm={searchTerm}
        onSearchChange={handleSearch}
        statusFilter={statusFilter}
        onStatusFilter={handleStatusFilter}
        roleFilter={roleFilter}
        onRoleFilter={handleRoleFilter}
        roles={roles}
        onClearFilters={clearFilters}
      />

      {/* Error Message */}
      <UsersErrorState error={error} />

      {/* User Statistics Cards */}
      <UsersStats users={users} />


      {/* Table */}
      <UsersTable
        users={users}
        selectedItems={selectedItems}
        onSelectAll={handleSelectAll}
        onSelectItem={handleSelectItem}
        loading={loading}
        onEdit={handleEdit}
        onDelete={handleDelete}
        sortField={sortField}
        sortOrder={sortOrder}
        onSort={handleSort}
      />

      {/* Pagination */}
      <UnifiedPagination
        sliceName="staff"
        showPageSizeSelector={true}
        showItemCount={true}
        pageSizeOptions={[5, 10, 25, 50, 100]}
      />

      {/* Actions and Modals */}
      <UsersActions
        isNewUserModalOpen={isNewUserModalOpen}
        onCloseNewUserModal={() => {
          setIsNewUserModalOpen(false);
          setEditingUser(null);
        }}
        onNewUserSuccess={() => {
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
        }}
        editingUser={editingUser}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={deleteConfirmation.isOpen}
        onClose={cancelDelete}
        onConfirm={confirmDelete}
        title="Deactivate User"
        message={`Are you sure you want to deactivate ${deleteConfirmation.userName}? This will prevent them from logging in and performing actions, but they will remain visible with "Deactivated" status.`}
        confirmText="Deactivate"
        cancelText="Cancel"
        variant="danger"
      />
    </div>
  );
};

export default UsersPage;
