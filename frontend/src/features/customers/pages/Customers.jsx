// src/features/customers/pages/Customers.jsx
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Plus,
  Search,
  Filter,
  ArrowUpDown,
  Edit,
  Trash,
  Users,
  Mail,
  Phone,
  Check,
  AlertCircle,
  Download,
  Upload,
} from "lucide-react";
import {
  fetchCustomers,
  deleteCustomer,
  setSearchTerm,
  setSort,
  openCreateModal,
  openEditModal,
  setCurrentPage,
  importCustomers,
} from "../../../store/slices/customerSlice";
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
import NewCustomerModal from "../modals/NewCustomerModal";
import LoadingOverlay from "../../../components/shared/LoadingOverlay";
import Pagination from "../../../components/shared/Pagination";
import BulkActions from "../../../components/shared/BulkActions";
import {
  exportCustomersToCSV,
  validateCustomerCSV,
} from "../../../utils/csvUtils";
import CSVImportModal from "../../../components/shared/CSVImportModal";
import CustomerFilters from "../components/CustomerFilters";
import ActionMenu from "../../../components/shared/ActionMenu";

const CustomersPage = () => {
  const dispatch = useDispatch();
  const { items, loading, error, pagination, filters } = useSelector(
    (state) => state.customer
  );
  const [selected, setSelected] = React.useState([]);
  const [isImportModalOpen, setIsImportModalOpen] = React.useState(false);

  useEffect(() => {
    dispatch(
      fetchCustomers({
        page: pagination.page,
        limit: pagination.limit,
        search: filters.searchTerm,
        sortField: filters.sortField,
        sortOrder: filters.sortOrder,
        hasPhone: filters.hasPhone,
        hasAddress: filters.hasAddress,
      })
    );
  }, [
    dispatch,
    pagination.page,
    pagination.limit,
    filters.searchTerm,
    filters.sortField,
    filters.sortOrder,
    filters.hasPhone,
    filters.hasAddress,
  ]);

  const handleDelete = (customerId) => {
    if (window.confirm("Are you sure you want to delete this customer?")) {
      dispatch(deleteCustomer(customerId)).then(() => {
        dispatch(
          fetchCustomers({
            page: pagination.page,
            limit: pagination.limit,
            search: filters.searchTerm,
            sortField: filters.sortField,
            sortOrder: filters.sortOrder,
            hasPhone: filters.hasPhone,
            hasAddress: filters.hasAddress,
          })
        );
      });
    }
  };

  const handleSelect = (id) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((sid) => sid !== id) : [...prev, id]
    );
  };
  const handleSelectAll = () => {
    if (selected.length === items.length) setSelected([]);
    else setSelected(items.map((c) => c.id));
  };

  const handleExport = (ids) => {
    const toExport = items.filter((c) => ids.includes(c.id));
    exportCustomersToCSV(toExport);
  };

  const handleImport = (csvData) => {
    dispatch(importCustomers(csvData)).then(() => {
      dispatch(
        fetchCustomers({
          page: pagination.page,
          limit: pagination.limit,
          search: filters.searchTerm,
          sortField: filters.sortField,
          sortOrder: filters.sortOrder,
          hasPhone: filters.hasPhone,
          hasAddress: filters.hasAddress,
        })
      );
    });
  };

  const handleOpenImportModal = () => setIsImportModalOpen(true);
  const handleCloseImportModal = () => setIsImportModalOpen(false);

  // Add getActionMenu function for customers
  const getActionMenu = (customer) => [
    {
      label: "Edit",
      icon: <Edit size={16} />,
      onClick: () => dispatch(openEditModal(customer)),
    },
    {
      label: "Delete",
      icon: <Trash size={16} />,
      onClick: () => handleDelete(customer.id),
      className: "text-red-600 hover:text-red-700 hover:bg-red-50",
    },
  ];

  if (loading && items.length === 0 && !error) {
    return <LoadingOverlay />;
  }

  return (
    <div className="space-y-6 bg-white text-gray-900 dark:bg-background dark:text-text min-h-screen p-4 sm:p-6">
      {/* Header and Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Customers
        </h1>
        <div className="flex flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            size="sm"
            icon={<Download size={16} />}
            onClick={() => exportCustomersToCSV(items)}
          >
            Export CSV
          </Button>
          <Button
            variant="outline"
            size="sm"
            icon={<Upload size={16} />}
            onClick={handleOpenImportModal}
          >
            Import CSV
          </Button>
          <Button
            variant="primary"
            size="sm"
            icon={<Plus size={16} />}
            onClick={() => dispatch(openCreateModal())}
          >
            Add New Customer
          </Button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md flex items-center gap-2">
          <AlertCircle size={16} />
          {error}
        </div>
      )}

      {/* Bulk Actions */}
      <BulkActions
        selectedItems={selected}
        onDelete={(ids) => ids.forEach(handleDelete)}
        onExport={handleExport}
        onImport={handleImport}
        importConfig={{ validate: validateCustomerCSV }}
        showImport={false}
        showExport={true}
        showDelete={true}
      />

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-center">
        <div className="relative flex-1">
          <Input
            placeholder="Search customers..."
            icon={<Search size={18} className="text-gray-400" />}
            value={filters.searchTerm}
            onChange={(e) => dispatch(setSearchTerm(e.target.value))}
            className="w-full"
          />
        </div>
        <CustomerFilters />
        <div className="relative">
          <Button
            variant="outline"
            icon={<ArrowUpDown size={16} />}
            onClick={() => dispatch(setSort({ field: "name" }))}
          >
            Sort by Name
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden dark:bg-background-secondary dark:border-background-secondary">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <input
                  type="checkbox"
                  checked={selected.length === items.length && items.length > 0}
                  onChange={handleSelectAll}
                />
              </TableHead>
              <TableHead className="min-w-[180px]">Customer</TableHead>
              <TableHead className="min-w-[180px]">Contact</TableHead>
              <TableHead className="min-w-[160px]">Address</TableHead>
              <TableHead className="min-w-[140px]">Created At</TableHead>
              <TableHead className="text-right w-16">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.length > 0 ? (
              items.map((customer) => (
                <TableRow key={customer.id}>
                  <TableCell>
                    <input
                      type="checkbox"
                      checked={selected.includes(customer.id)}
                      onChange={() => handleSelect(customer.id)}
                    />
                  </TableCell>
                  <TableCell className="min-w-[180px]">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center">
                        {customer.name.charAt(0).toUpperCase()}
                      </div>
                      <span className="font-medium text-gray-900">
                        {customer.name}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="min-w-[180px]">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm">
                        <Mail size={14} className="text-gray-400" />
                        <span>{customer.email}</span>
                      </div>
                      {customer.phone && (
                        <div className="flex items-center gap-2 text-sm">
                          <Phone size={14} className="text-gray-400" />
                          <span>{customer.phone}</span>
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="min-w-[160px]">
                    {customer.address}
                  </TableCell>
                  <TableCell className="min-w-[140px]">
                    {new Date(customer.createdAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </TableCell>
                  <TableCell className="text-right w-16">
                    <ActionMenu
                      actions={getActionMenu(customer)}
                      item={customer}
                      className="flex justify-end"
                    />
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="h-32 text-center">
                  <div className="flex flex-col items-center justify-center text-gray-500">
                    <Users size={28} className="mb-2" />
                    <h3 className="text-lg font-medium">No customers found</h3>
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
      {pagination.pages > 1 && (
        <div className="flex justify-center">
          <div className="w-full flex items-center justify-between py-4">
            <p className="text-sm md:text-base text-gray-600 dark:text-gray-400">
              Showing
              <span className="font-semibold text-gray-900 dark:text-white">
                {pagination.page}
              </span>
              of
              <span className="font-semibold text-gray-900 dark:text-white">
                {pagination.pages}
              </span>
              pages
            </p>
            <div className="flex gap-2">
              <button
                onClick={() =>
                  dispatch(setCurrentPage(Math.max(1, pagination.page - 1)))
                }
                disabled={pagination.page === 1}
                className={`flex items-center gap-1 px-3 py-2 rounded-md text-sm font-medium transition-colors
                  ${
                    pagination.page === 1
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed dark:bg-gray-700 dark:text-gray-500"
                      : "bg-gray-100 hover:bg-blue-600 hover:text-white dark:bg-gray-700 dark:hover:bg-blue-600"
                  }`}
              >
                Previous
              </button>
              <button
                onClick={() =>
                  dispatch(
                    setCurrentPage(
                      Math.min(pagination.pages, pagination.page + 1)
                    )
                  )
                }
                disabled={pagination.page === pagination.pages}
                className={`flex items-center gap-1 px-3 py-2 rounded-md text-sm font-medium transition-colors
                  ${
                    pagination.page === pagination.pages
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed dark:bg-gray-700 dark:text-gray-500"
                      : "bg-gray-100 hover:bg-blue-600 hover:text-white dark:bg-gray-700 dark:hover:bg-blue-600"
                  }`}
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}

      <NewCustomerModal />
      <CSVImportModal
        isOpen={isImportModalOpen}
        onClose={handleCloseImportModal}
        onImport={handleImport}
        config={{ validate: validateCustomerCSV }}
      />
    </div>
  );
};

export default CustomersPage;
