// src/features/suppliers/pages/Suppliers.jsx
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
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
  openEditDrawer,
} from "../../../store/slices/supplierSlice";
import SuppliersHeader from "../components/SuppliersHeader";
import SuppliersStats from "../components/SuppliersStats";
import SuppliersTable from "../components/SuppliersTable";
import SuppliersActions from "../components/SuppliersActions";
import SuppliersErrorState from "../components/SuppliersErrorState";
import LoadingOverlay from "../../../components/shared/LoadingOverlay";
import { exportSuppliersToCSV } from "../../../utils/csvUtils";

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

  useEffect(() => {
    const params = {
      page: currentPage,
      limit: itemsPerPage,
      search: searchTerm,
      sortField: filters?.sortField || "createdAt",
      sortOrder: filters?.sortOrder || "desc",
      hasPhone: filters?.options?.hasPhone || false,
      hasAddress: filters?.options?.hasAddress || false,
      hasEmail: filters?.options?.hasEmail || false,
      hasCompany: filters?.options?.hasCompany || false,
    };
    dispatch(fetchSuppliers(params));
  }, [
    dispatch,
    currentPage,
    itemsPerPage,
    searchTerm,
    filters?.sortField,
    filters?.sortOrder,
    filters?.options?.hasPhone,
    filters?.options?.hasAddress,
    filters?.options?.hasEmail,
    filters?.options?.hasCompany,
  ]);

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

  const handleBulkExport = (suppliersToExport) => {
    exportSuppliersToCSV(suppliersToExport);
  };

  const handleBulkImport = async (data) => {
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
    dispatch(openEditDrawer(supplier));
  };

  const handleSearch = (e) => {
    dispatch(setSearchTerm(e.target.value));
  };

  const handleClearFilters = () => {
    if (filters?.options?.hasPhone) dispatch(togglePhoneFilter());
    if (filters?.options?.hasAddress) dispatch(toggleAddressFilter());
    if (filters?.options?.hasEmail) dispatch(toggleEmailFilter());
    if (filters?.options?.hasCompany) dispatch(toggleCompanyFilter());
    dispatch(setSort({ field: "name", order: "asc" }));
    setShowFilterMenu(false);
  };

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
      <SuppliersHeader
        onExportCSV={handleBulkExport}
        searchTerm={searchTerm}
        onSearchChange={handleSearch}
        onAddNew={() => dispatch(openCreateModal())}
      />

      {/* Error State */}
      <SuppliersErrorState error={error} />

      {/* Stats Cards */}
      <SuppliersStats />

      {/* Table */}
      <SuppliersTable
        items={items}
        selectedItems={selectedItems}
        onSelectAll={handleSelectAll}
        onSelectItem={handleSelectItem}
        loading={loading}
        searchTerm={searchTerm}
        onClearSearch={() => dispatch(setSearchTerm(""))}
      />

      {/* Actions and Modals */}
      <SuppliersActions
        selectedItems={selectedItems}
        onBulkDelete={handleBulkDelete}
        onBulkExport={handleBulkExport}
        onBulkImport={handleBulkImport}
        isImportModalOpen={isImportModalOpen}
        onCloseImportModal={() => setIsImportModalOpen(false)}
      />
    </div>
  );
};

export default SuppliersPage;
