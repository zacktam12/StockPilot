import React, { useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Plus, Download, Upload, Search, FileCog, UserCircle } from "lucide-react";
import Button from "../../../components/shared/Button";
import Input from "../../../components/shared/Input";
import UserFilters from "./UserFilters";
import { exportUsersToCSV } from "../../../utils/csvUtils";
import { useOutsideClick } from "../../../hooks/useOutsideClick";
import { showToast } from "../../../store/slices/uiSlice";

const UsersHeader = ({ 
  onExportAll, 
  onImportCSV, 
  onAddNew,
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusFilter,
  roleFilter,
  onRoleFilter,
  roles,
  onClearFilters
}) => {
  const dispatch = useDispatch();
  const [isActionsOpen, setIsActionsOpen] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const actionsRef = useRef(null);
  const fileInputRef = useRef(null);
  const { users = [], selectedItems = [] } = useSelector((state) => state.user || {});

  // Close dropdown when clicking outside
  useOutsideClick(actionsRef, () => {
    if (isActionsOpen) {
      setIsActionsOpen(false);
    }
  });

  // Handle export with selected items
  const handleExport = () => {
    if (selectedItems && selectedItems.length > 0) {
      // Export only selected items
      const usersToExport = users.filter((user) => 
        selectedItems.includes(user.id)
      );
      exportUsersToCSV(usersToExport);
    } else {
      // Export all users
      exportUsersToCSV(users);
    }
    setIsActionsOpen(false);
  };

  // Handle import file selection
  const handleImportClick = () => {
    fileInputRef.current?.click();
    setIsActionsOpen(false);
  };

  // Handle file upload and processing
  const handleFileSelect = async (event) => {
    const selectedFile = event.target.files[0];
    if (!selectedFile) return;

    // Validate file type
    if (!selectedFile.name.endsWith(".csv")) {
      dispatch(showToast({ message: "Please select a valid CSV file", type: "error" }));
      return;
    }

    setIsImporting(true);

    try {
      const text = await selectedFile.text();
      // For now, just show a message that import is not fully implemented
      dispatch(showToast({ 
        message: "User import functionality is not fully implemented yet", 
        type: "info" 
      }));

    } catch (err) {
      dispatch(showToast({ 
        message: err.message || "Failed to import users", 
        type: "error" 
      }));
    } finally {
      setIsImporting(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className="flex flex-col gap-4 mb-6">
      {/* Top row with title and create button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-700 rounded-lg flex items-center justify-center flex-shrink-0">
              <UserCircle size={20} className="text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white truncate">
              Users
            </h1>
          </div>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
            Manage system users, roles, and permissions
          </p>
        </div>
        <div className="flex-shrink-0">
          <Button
            variant="primary"
            size="md"
            icon={<Plus size={18} />}
            onClick={onAddNew}
            className="px-4 py-3 rounded-lg flex items-center justify-center focus:outline-none focus:ring-0 focus:shadow-none active:shadow-none w-full sm:w-auto"
            style={{
              backgroundColor: '#3b82f6',
              borderColor: '#3b82f6',
              color: '#ffffff',
              transition: 'background-color 0.2s ease',
              transform: 'none',
              boxShadow: 'none',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#2563eb';
              e.currentTarget.style.borderColor = '#2563eb';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#3b82f6';
              e.currentTarget.style.borderColor = '#3b82f6';
            }}
          >
            <span className="hidden sm:inline">Create User</span>
            <span className="sm:hidden">Add User</span>
          </Button>
        </div>
      </div>

      {/* Bottom row with search and action buttons */}
      <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center sm:justify-between">
        {/* Search bar */}
        <div className="relative w-full sm:w-auto sm:flex-1 sm:max-w-md">
          <Input
            placeholder="Search users..."
            icon={<Search size={18} className="text-gray-400" />}
            value={searchTerm}
            onChange={onSearchChange}
            className="w-full bg-white"
          />
        </div>

        {/* Action buttons - mobile: 50% each, desktop: auto width on right */}
        <div className="flex gap-2 w-full sm:w-auto">
          <div className="flex-1 sm:flex-initial">
            <UserFilters
              statusFilter={statusFilter}
              onStatusFilter={onStatusFilter}
              roleFilter={roleFilter}
              onRoleFilter={onRoleFilter}
              roles={roles}
              onClearFilters={onClearFilters}
            />
          </div>
          
          {/* Actions Dropdown */}
          <div className="relative flex-1 sm:flex-initial" ref={actionsRef}>
            <Button
              variant="outline"
              size="md"
              icon={<FileCog size={16} />}
              onClick={() => setIsActionsOpen(!isActionsOpen)}
              className="w-full px-4 py-3 rounded-lg border-blue-300 !text-blue-600 hover:bg-blue-50 hover:border-blue-400 hover:!text-blue-700 transition-colors"
            >
              Actions
            </Button>

            {/* Actions Dropdown Menu */}
            {isActionsOpen && (
              <>
                {/* Background Overlay */}
                <div className="fixed inset-0 bg-black/30 z-[9998]" onClick={() => setIsActionsOpen(false)} />
                
                {/* Actions Dropdown */}
                <div className="absolute top-full right-0 mt-2 w-80 bg-white/95 dark:bg-gray-800/95 backdrop-blur-lg rounded-lg border border-gray-200 dark:border-gray-700 shadow-xl z-[9999]">
                  {/* Dropdown Header */}
                  <div className="px-6 py-3 border-b border-gray-200">
                    <h3 className="text-lg font-bold text-gray-900">Actions</h3>
                    <p className="text-sm text-gray-600">User Actions</p>
                  </div>

                  {/* Dropdown Content */}
                  <div className="p-3 space-y-2 flex flex-col items-center">
                    <button
                      onClick={handleImportClick}
                      disabled={isImporting}
                      className="w-[85%] !px-8 py-3 text-center text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed flex items-center justify-center gap-3 transition-colors rounded-lg"
                    >
                      {isImporting ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>Importing...</span>
                        </>
                      ) : (
                        <>
                          <Upload size={18} />
                          <span>Import Users</span>
                        </>
                      )}
                    </button>
                    
                    <button
                      onClick={handleExport}
                      className="w-[85%] !px-8 py-3 text-center text-white bg-blue-600 hover:bg-blue-700 flex items-center justify-center gap-3 transition-colors rounded-lg"
                    >
                      <Download size={18} />
                      <span>
                        Export Users ({selectedItems && selectedItems.length > 0 ? selectedItems.length : users?.length || 0})
                      </span>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Hidden file input for CSV import */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".csv"
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  );
};

export default UsersHeader;
