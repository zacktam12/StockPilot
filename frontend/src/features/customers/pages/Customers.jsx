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
import CustomerStats from "../components/CustomerStats";
import CustomerTable from "../components/CustomerTable";
import CustomerActions from "../components/CustomerActions";
import CustomerErrorState from "../components/CustomerErrorState";
import UnifiedPagination from "../../../components/shared/UnifiedPagination";
import LoadingOverlay from "../../../components/shared/LoadingOverlay";
import { exportCustomersToCSV, validateCustomerCSV } from "../../../utils/csvUtils";

const CustomersPage = () => {
  const dispatch = useDispatch();
  const { items, loading, error, pagination, filters, searchTerm, sortField, sortOrder, selectedItems, itemsPerPage, currentPage } = useSelector(
    (state) => state.customer
  );
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  useEffect(() => {
    const params = {
      page: pagination?.page || 1,
      limit: pagination?.limit || 5,
      search: searchTerm || filters.searchTerm,
      sortField: sortField || filters.sortField,
      sortOrder: sortOrder || filters.sortOrder,
      hasPhone: filters.hasPhone,
      hasAddress: filters.hasAddress,
    };
    dispatch(fetchCustomers(params));
  }, [
    dispatch,
    pagination?.page,
    pagination?.limit,
    itemsPerPage,
    currentPage,
    searchTerm,
    filters.searchTerm,
    sortField,
    filters.sortField,
    sortOrder,
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
          search: searchTerm || filters.searchTerm,
          sortField: sortField || filters.sortField,
          sortOrder: sortOrder || filters.sortOrder,
          hasPhone: filters.hasPhone,
          hasAddress: filters.hasAddress,
        })
      );
    });
  };

  const handleExport = (ids) => {
    const toExport = items.filter((c) => ids.includes(c.id));
    exportCustomersToCSV(toExport);
  };

  const handleImport = async (csvData) => {
    try {
      const result = await dispatch(importCustomers(csvData)).unwrap();
      // Refetch customers after import
      await dispatch(
        fetchCustomers({
          page: 1, // Reset to first page after import
          limit: pagination?.limit || 5,
          search: searchTerm || filters.searchTerm,
          sortField: sortField || filters.sortField,
          sortOrder: sortOrder || filters.sortOrder,
          hasPhone: filters.hasPhone,
          hasAddress: filters.hasAddress,
        })
      ).unwrap();
    } catch (error) {
      console.error('💥 [IMPORT] Import failed:', error);
    }
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
        onExportCSV={handleExport}
        searchTerm={searchTerm || filters.searchTerm}
        onSearchChange={handleSearch}
      />

      {/* Error Message */}
      <CustomerErrorState error={error} />

      {/* Customer Statistics Cards */}
      <CustomerStats />

      {/* Bulk Actions and Modals */}
      <CustomerActions
        selected={selectedItems}
        onDelete={handleDelete}
        onExport={handleExport}
        onImport={handleImport}
        isImportModalOpen={isImportModalOpen}
        onCloseImportModal={handleCloseImportModal}
      />


      {/* Customers Table */}
      <CustomerTable />

      {/* Pagination */}
      <UnifiedPagination
        sliceName="customer"
        showPageSizeSelector={true}
        showItemCount={true}
        pageSizeOptions={[5, 10, 25, 50, 100]}
      />
    </div>
  );
};

export default CustomersPage;
