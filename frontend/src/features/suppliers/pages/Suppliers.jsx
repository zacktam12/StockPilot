// src/features/suppliers/pages/Suppliers.jsx
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Plus,
  Search,
  Filter,
  ArrowUpDown,
  Edit,
  Trash,
  Truck,
  Mail,
  Phone,
  Check,
  Loader2,
  Download,
  Upload,
  AlertCircle,
  User,
  Building2,
  MoreHorizontal,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import {
  fetchSuppliers,
  deleteSupplier,
  bulkDeleteSuppliers,
  importSuppliers,
  setSearchTerm,
  setSort,
  togglePhoneFilter,
  toggleAddressFilter,
  toggleEmailFilter,
  toggleCompanyFilter,
  openCreateModal,
  openEditModal,
} from "../../../store/slices/supplierSlice";
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
import NewSupplierModal from "../modals/NewSupplierModal";
import LoadingOverlay from "../../../components/shared/LoadingOverlay";
import BulkActions from "../../../components/shared/BulkActions";
import {
  exportSuppliersToCSV,
  validateSupplierCSV,
} from "../../../utils/csvUtils";
import CSVImportModal from "../../../components/shared/CSVImportModal";
import { useOutsideClick } from "../../../hooks/useOutsideClick";
import Pagination from "../../../components/shared/Pagination";
import ActionMenu from "../../../components/shared/ActionMenu";

const SuppliersPage = () => {
  const dispatch = useDispatch();
  const {
    items,
    loading,
    error,
    currentPage,
    itemsPerPage,
    searchTerm,
    filters,
  } = useSelector((state) => state.supplier);

  const [selectedItems, setSelectedItems] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [showSortMenu, setShowSortMenu] = useState(false);

  const filterMenuRef = React.useRef(null);
  const sortMenuRef = React.useRef(null);

  useEffect(() => {
    const params = {
      page: currentPage,
      limit: itemsPerPage,
      search: searchTerm,
      sortField: filters.sortField,
      sortOrder: filters.sortOrder,
    };
    dispatch(fetchSuppliers(params));
  }, [
    dispatch,
    currentPage,
    itemsPerPage,
    searchTerm,
    filters.sortField,
    filters.sortOrder,
  ]);

  // Add outside click functionality for filter menu
  useOutsideClick(filterMenuRef, () => {
    if (showFilterMenu) setShowFilterMenu(false);
  });

  // Add outside click functionality for sort menu
  useOutsideClick(sortMenuRef, () => {
    if (showSortMenu) setShowSortMenu(false);
  });

  const handleDelete = (supplierId) => {
    if (window.confirm("Are you sure you want to delete this supplier?")) {
      dispatch(deleteSupplier(supplierId));
    }
  };

  const handleBulkDelete = (items) => {
    if (
      window.confirm(
        `Are you sure you want to delete ${items.length} selected supplier(s)?`
      )
    ) {
      dispatch(bulkDeleteSuppliers(items));
      setSelectedItems([]);
      setSelectAll(false);
    }
  };

  const handleBulkExport = (items) => {
    const suppliersToExport =
      items.length > 0
        ? items.filter((supplier) => items.includes(supplier.id))
        : items;
    exportSuppliersToCSV(suppliersToExport);
  };

  const handleBulkImport = async (data) => {
    const validation = validateSupplierCSV(data);
    if (!validation.isValid) {
      alert(`Import failed: ${validation.errors.join(", ")}`);
      return;
    }

    try {
      await dispatch(importSuppliers(data)).unwrap();
      dispatch(fetchSuppliers()); // Refresh the list
    } catch (error) {
      console.error("Import failed:", error);
    }
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedItems([]);
      setSelectAll(false);
    } else {
      setSelectedItems(items.map((supplier) => supplier.id));
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
      setSelectAll(newSelected.length === items.length);
    }
  };

  const handleEdit = (supplier) => {
    dispatch(openEditModal(supplier));
  };

  const handleSearch = (e) => {
    dispatch(setSearchTerm(e.target.value));
  };

  const handleSort = (field) => {
    dispatch(setSort({ field }));
    setShowSortMenu(false);
  };

  const getSortIcon = (field) => {
    if (filters.sortField !== field) return null;
    return filters.sortOrder === "asc" ? (
      <ChevronUp size={16} />
    ) : (
      <ChevronDown size={16} />
    );
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.options.hasPhone) count++;
    if (filters.options.hasAddress) count++;
    if (filters.options.hasEmail) count++;
    if (filters.options.hasCompany) count++;
    return count;
  };

  const clearFilters = () => {
    dispatch(togglePhoneFilter());
    dispatch(toggleAddressFilter());
    dispatch(toggleEmailFilter());
    dispatch(toggleCompanyFilter());
  };

  const getActionMenu = (supplier) => [
    {
      label: "Edit",
      icon: <Edit size={16} />,
      onClick: () => handleEdit(supplier),
    },
    {
      label: "Delete",
      icon: <Trash size={16} />,
      onClick: () => handleDelete(supplier.id),
      className: "text-red-600 hover:text-red-700 hover:bg-red-50",
    },
  ];

  if (loading && items.length === 0 && !error) {
    return (
      <LoadingOverlay
        title="Suppliers"
        description="Loading supplier data..."
      />
    );
  }

  return (
    <div className="space-y-6 bg-white text-gray-900 dark:bg-background dark:text-text min-h-screen p-4 sm:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Suppliers
        </h1>
        <div className="flex flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            size="sm"
            icon={<Download size={16} />}
            onClick={() => handleBulkExport([])}
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
            onClick={() => dispatch(openCreateModal())}
          >
            Add New Supplier
          </Button>
        </div>
      </div>

      {/* Bulk Actions */}
      <BulkActions
        selectedItems={selectedItems}
        onDelete={handleBulkDelete}
        onExport={handleBulkExport}
        onImport={handleBulkImport}
        importConfig={{
          description:
            "Import suppliers from a CSV file. The file should contain columns for Name, Contact Name, Email, Phone, Address, and Company Name.",
          requiredFields: ["Name"],
          validate: validateSupplierCSV,
        }}
        showImport={false}
        showExport={true}
        showDelete={true}
      />

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md flex items-center gap-2">
          <AlertCircle size={16} />
          {error}
        </div>
      )}

      {/* Search and Filters */}
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="flex-1">
          <Input
            placeholder="Search suppliers..."
            value={searchTerm}
            onChange={handleSearch}
            icon={<Search size={16} />}
          />
        </div>

        <div className="flex gap-2">
          <div className="relative" ref={filterMenuRef}>
            <Button
              variant="outline"
              size="sm"
              icon={<Filter size={16} />}
              onClick={() => setShowFilterMenu(!showFilterMenu)}
              className={`${
                getActiveFiltersCount() > 0
                  ? "bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-300"
                  : ""
              }`}
            >
              Filters
              {getActiveFiltersCount() > 0 && (
                <Badge variant="primary" className="ml-1">
                  {getActiveFiltersCount()}
                </Badge>
              )}
            </Button>

            {showFilterMenu && (
              <div className="absolute right-0 top-full mt-1 w-64 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-10 p-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Filters</span>
                    {getActiveFiltersCount() > 0 && (
                      <button
                        onClick={clearFilters}
                        className="text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400"
                      >
                        Clear all
                      </button>
                    )}
                  </div>
                  <div className="space-y-2">
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={filters.options.hasPhone}
                        onChange={() => dispatch(togglePhoneFilter())}
                        className="rounded"
                      />
                      <span className="text-sm">Has Phone</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={filters.options.hasAddress}
                        onChange={() => dispatch(toggleAddressFilter())}
                        className="rounded"
                      />
                      <span className="text-sm">Has Address</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={filters.options.hasEmail}
                        onChange={() => dispatch(toggleEmailFilter())}
                        className="rounded"
                      />
                      <span className="text-sm">Has Email</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={filters.options.hasCompany}
                        onChange={() => dispatch(toggleCompanyFilter())}
                        className="rounded"
                      />
                      <span className="text-sm">Has Company</span>
                    </label>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="relative" ref={sortMenuRef}>
            <Button
              variant="outline"
              size="sm"
              icon={<ArrowUpDown size={16} />}
              onClick={() => setShowSortMenu(!showSortMenu)}
            >
              Sort
            </Button>

            {showSortMenu && (
              <div className="absolute right-0 top-full mt-1 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-10">
                <div className="py-1">
                  <button
                    onClick={() => handleSort("name")}
                    className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center justify-between"
                  >
                    Name {getSortIcon("name")}
                  </button>
                  <button
                    onClick={() => handleSort("contactName")}
                    className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center justify-between"
                  >
                    Contact Name {getSortIcon("contactName")}
                  </button>
                  <button
                    onClick={() => handleSort("companyName")}
                    className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center justify-between"
                  >
                    Company {getSortIcon("companyName")}
                  </button>
                  <button
                    onClick={() => handleSort("createdAt")}
                    className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center justify-between"
                  >
                    Date Added {getSortIcon("createdAt")}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="relative bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden dark:bg-background-secondary dark:border-background-secondary">
        {loading && items.length > 0 && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/40 dark:bg-white/10">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
          </div>
        )}

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <input
                    type="checkbox"
                    checked={selectAll}
                    onChange={handleSelectAll}
                    className="rounded"
                  />
                </TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Contact Name</TableHead>
                <TableHead>Company Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Address</TableHead>
                <TableHead>Date Added</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.length > 0 ? (
                items.map((supplier) => (
                  <TableRow key={supplier.id}>
                    <TableCell>
                      <input
                        type="checkbox"
                        checked={selectedItems.includes(supplier.id)}
                        onChange={() => handleSelectItem(supplier.id)}
                        className="rounded"
                      />
                    </TableCell>
                    <TableCell className="font-medium">
                      {supplier.name}
                    </TableCell>
                    <TableCell>{supplier.contactName || "-"}</TableCell>
                    <TableCell>{supplier.companyName || "-"}</TableCell>
                    <TableCell>{supplier.email || "-"}</TableCell>
                    <TableCell>{supplier.phone || "-"}</TableCell>
                    <TableCell>{supplier.address || "-"}</TableCell>
                    <TableCell>
                      {new Date(supplier.createdAt).toLocaleDateString(
                        "en-US",
                        {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        }
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <ActionMenu items={getActionMenu(supplier)} />
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-12">
                    <div className="flex flex-col items-center justify-center text-gray-500">
                      <Truck size={28} className="mb-2" />
                      <h3 className="text-lg font-medium">
                        No suppliers found
                      </h3>
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
      </div>

      {/* Pagination */}
      <Pagination sliceName="supplier" />

      <NewSupplierModal />
      <CSVImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImport={handleBulkImport}
        title="Import Suppliers"
        description="Upload a CSV file with supplier data"
      />
    </div>
  );
};

export default SuppliersPage;
