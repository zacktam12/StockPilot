import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchPurchases,
  setSearchTerm,
} from "../../../store/slices/purchaseSlice";
import PurchaseHeader from "../components/PurchaseHeader";
import PurchaseStats from "../components/PurchaseStats";
import PurchaseTable from "../components/PurchaseTable";
import PurchaseActions from "../components/PurchaseActions";
import PurchaseErrorState from "../components/PurchaseErrorState";
import UnifiedPagination from "../../../components/shared/UnifiedPagination";
import LoadingOverlay from "../../../components/shared/LoadingOverlay";

const PurchasesPage = () => {
  const dispatch = useDispatch();
  const {
    items: purchases = [],
    filteredItems = [],
    loading = false,
    error,
    currentPage = 1,
    itemsPerPage = 10,
    totalPages = 1,
    totalItems = 0,
    searchTerm: reduxSearchTerm = "",
    sortField: reduxSortField = "createdAt",
    sortOrder: reduxSortOrder = "desc",
    selectedItems = [],
    selectAll = false,
    filters = {},
  } = useSelector((state) => state.purchases || {});

  const [isNewPurchaseOpen, setIsNewPurchaseOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Fetch purchases on mount and when pagination/search/filters change
  useEffect(() => {
    const params = {
      page: currentPage,
      limit: itemsPerPage,
      search: reduxSearchTerm,
      sortField: reduxSortField,
      sortOrder: reduxSortOrder,
      status: filters.status || "",
      supplierId: filters.supplierId || "",
    };

    // Add date range if set
    if (filters.dateRange?.start) {
      params.startDate = filters.dateRange.start;
    }
    if (filters.dateRange?.end) {
      params.endDate = filters.dateRange.end;
    }
    dispatch(fetchPurchases(params));
  }, [
    dispatch,
    currentPage,
    itemsPerPage,
    reduxSearchTerm,
    reduxSortField,
    reduxSortOrder,
    filters.status,
    filters.supplierId,
    filters.dateRange?.start,
    filters.dateRange?.end,
    refreshTrigger,
  ]);

  // Handle search with dispatch to Redux
  const handleSearch = (e) => {
    dispatch(setSearchTerm(e.target.value));
  };




  if (loading && purchases.length === 0) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
        <LoadingOverlay
          title="Purchases"
          description="Loading purchase data..."
        />
      </div>
    );
  }

  if (error) {
    return <PurchaseErrorState error={error} />;
  }

  return (
    <div className="space-y-8 bg-white text-gray-900 dark:bg-background dark:text-white min-h-screen p-4 sm:p-6">
      {/* Header with integrated search */}
      <PurchaseHeader
        filteredPurchases={purchases}
        onOpenImportModal={() => {}}
        onOpenNewPurchase={() => setIsNewPurchaseOpen(true)}
        searchTerm={reduxSearchTerm}
        onSearchChange={handleSearch}
      />

      {/* Purchase Statistics Cards */}
      <PurchaseStats filteredItems={purchases} />

      {/* Actions and Modals */}
      <PurchaseActions
        isNewPurchaseOpen={isNewPurchaseOpen}
        onCloseNewPurchase={() => {
          setIsNewPurchaseOpen(false);
          setRefreshTrigger(prev => prev + 1);
        }}
      />

      {/* Purchases Table */}
      <PurchaseTable filteredItems={purchases} />

      {/* Pagination */}
      <UnifiedPagination
        sliceName="purchase"
        showPageSizeSelector={true}
        showItemCount={true}
        pageSizeOptions={[5, 10, 25, 50, 100]}
      />
    </div>
  );
};

export default PurchasesPage;
