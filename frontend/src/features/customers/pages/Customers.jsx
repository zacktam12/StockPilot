// src/features/customers/pages/Customers.jsx
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {

  fetchCustomers,
  deleteCustomer,
  setSearchTerm,
  setSort,
  setCurrentPage,
  importCustomers,
} from "../../../store/slices/customerSlice";
import CustomerHeader from "../components/CustomerHeader";
import CustomerSearch from "../components/CustomerSearch";
import CustomerTable from "../components/CustomerTable";
import CustomerActions from "../components/CustomerActions";
import CustomerErrorState from "../components/CustomerErrorState";
import CustomerPagination from "../components/CustomerPagination";
import LoadingOverlay from "../../../components/shared/LoadingOverlay";
import { exportCustomersToCSV, validateCustomerCSV } from "../../../utils/csvUtils";

const CustomersPage = () => {
  const dispatch = useDispatch();
  const { items, loading, error, pagination, filters } = useSelector(
    (state) => state.customer
  );
  const [selected, setSelected] = useState([]);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  useEffect(() => {
    dispatch(
      fetchCustomers({
        page: pagination?.page || 1,
        limit: pagination?.limit || 5,
        search: filters.searchTerm,
        sortField: filters.sortField,
        sortOrder: filters.sortOrder,
        hasPhone: filters.hasPhone,
        hasAddress: filters.hasAddress,
      })
    );
  }, [
    dispatch,
    pagination?.page,
    pagination?.limit,
    filters.searchTerm,
    filters.sortField,
    filters.sortOrder,
    filters.hasPhone,
    filters.hasAddress,
  ]);

  const handleDelete = (customerId) => {
    dispatch(deleteCustomer(customerId)).then(() => {
      dispatch(
        fetchCustomers({
          page: pagination?.page || 1,
          limit: pagination?.limit || 5,
          search: filters.searchTerm,
          sortField: filters.sortField,
          sortOrder: filters.sortOrder,
          hasPhone: filters.hasPhone,
          hasAddress: filters.hasAddress,
        })
      );
    });
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
          page: pagination?.page || 1,
          limit: pagination?.limit || 5,
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

  const handleSearch = (e) => {
    dispatch(setSearchTerm(e.target.value));
  };

  if (loading && items.length === 0 && !error) {
    return <LoadingOverlay />;
  }

  return (
    <div className="space-y-6 bg-white text-gray-900 dark:bg-background dark:text-text min-h-screen p-4 sm:p-6">
      {/* Header */}
      <CustomerHeader 
        items={items} 
        onOpenImportModal={handleOpenImportModal} 
      />

      {/* Error Message */}
      <CustomerErrorState error={error} />

      {/* Bulk Actions and Modals */}
      <CustomerActions
        selected={selected}
        onDelete={handleDelete}
        onExport={handleExport}
        onImport={handleImport}
        isImportModalOpen={isImportModalOpen}
        onCloseImportModal={handleCloseImportModal}
      />

      {/* Search and Filters */}
      <CustomerSearch 
        searchTerm={filters.searchTerm} 
        onSearchChange={handleSearch} 
      />

      {/* Customers Table */}
      <CustomerTable
        items={items}
        selected={selected}
        onSelect={handleSelect}
        onSelectAll={handleSelectAll}
        onDelete={handleDelete}
        onExport={handleExport}
        onImport={handleImport}
        importConfig={{ validate: validateCustomerCSV }}
      />

      {/* Pagination */}
      <CustomerPagination pagination={pagination} />
    </div>
  );
};

export default CustomersPage;
