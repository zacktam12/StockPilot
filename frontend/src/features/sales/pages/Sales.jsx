import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchSales,
  updateSaleStatus,
  setStatusFilter,
  setCurrentPage,
  deleteSale,
} from "../../../store/slices/salesSlice";
import SalesHeader from "../components/SalesHeader";
import SalesStats from "../components/SalesStats";
import SalesTable from "../components/SalesTable";
import SalesActions from "../components/SalesActions";
import SalesErrorState from "../components/SalesErrorState";
import UnifiedPagination from "../../../components/shared/UnifiedPagination";
import LoadingOverlay from "../../../components/shared/LoadingOverlay";
import { useDebounce } from "../../../hooks/useDebounce";
import { API_BASE_URL } from "../../../config";

const SalesPage = () => {
  const dispatch = useDispatch();
  const {
    sales = [],
    loading,
    error,
    pagination,
    statusFilter = "all",
    filters = {},
  } = useSelector((state) => state.sales || {});
  
  // Safely destructure pagination with fallbacks
  const {
    currentPage = 1,
    itemsPerPage = 10,
    totalItems = 0,
    totalPages = 0,
  } = pagination || {};

  // Check for token-related errors
  useEffect(() => {
    if (
      error?.includes("No token provided") ||
      error?.includes("Unauthorized")
    ) {
      // Clear auth state
      localStorage.removeItem("authToken");
      localStorage.removeItem("userRole");
      localStorage.removeItem("userName");
      localStorage.removeItem("userEmail");
      // Redirect to login
      window.location.href = "/login";
    }
  }, [error]);

  // Debug logging
  useEffect(() => {
  }, [sales, loading, error, pagination, statusFilter, filters]);

  // Defensive: ensure sales is always an array
  const salesList = Array.isArray(sales) ? sales : [];

  const [searchTerm, setSearchTerm] = useState("");
  const [isNewSaleOpen, setIsNewSaleOpen] = useState(false);
  const [selectedSale, setSelectedSale] = useState(null);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  const [selectedRows, setSelectedRows] = useState([]);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editSale, setEditSale] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteSale, setDeleteSale] = useState(null);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  // Debounce search term to prevent excessive API calls
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  // Check backend health on component mount
  useEffect(() => {
    const checkBackendHealth = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/health`);
        const data = await response.json();
      } catch (error) {
        console.error("Backend health check failed:", error);
      }
    };

    checkBackendHealth();
  }, []);

  // Fetch sales with backend pagination/filtering
  useEffect(() => {
    const params = {
      page: currentPage,
      limit: itemsPerPage,
      search: debouncedSearchTerm,
      status: statusFilter !== "all" ? statusFilter : (filters.status || ""),
      customerId: filters.customerId || "",
      paymentMethod: filters.paymentMethod || "",
    };

    // Add date range if set
    if (filters.dateRange?.start) {
      params.startDate = filters.dateRange.start;
    }
    if (filters.dateRange?.end) {
      params.endDate = filters.dateRange.end;
    }
    dispatch(fetchSales(params));
  }, [
    dispatch,
    currentPage,
    itemsPerPage,
    debouncedSearchTerm,
    statusFilter,
    filters.customerId,
    filters.status,
    filters.paymentMethod,
    filters.dateRange?.start,
    filters.dateRange?.end,
  ]);

  const handleUpdateStatus = async (id, status) => {
    try {
      await dispatch(updateSaleStatus({ id, status })).unwrap();
      dispatch(
        fetchSales({
          page: currentPage,
          limit: itemsPerPage,
          search: searchTerm,
          status: statusFilter,
        })
      );
    } catch (error) {
      console.error("Error updating sale status:", error);
    }
  };

  const handleViewReceipt = (sale) => {
    setSelectedSale(sale);
    setIsReceiptOpen(true);
  };

  const handleEditSale = (sale) => {
    setEditSale(sale);
    setIsEditModalOpen(true);
  };

  const handleDeleteSale = (sale) => {
    setDeleteSale(sale);
    setIsDeleteModalOpen(true);
  };

  const confirmDeleteSale = async () => {
    if (!deleteSale) return;
    await dispatch(deleteSale(deleteSale.id));
    setIsDeleteModalOpen(false);
    setDeleteSale(null);
    dispatch(
      fetchSales({
        page: currentPage,
        limit: itemsPerPage,
        search: searchTerm,
        status: statusFilter,
      })
    );
  };

  const handleBulkDelete = () => {};

  const handleBulkExport = (salesToExport = salesList) => {
    // Check if there's data to export
    if (!salesToExport || salesToExport.length === 0) {
      alert('No sales data to export. Please ensure you have sales records in the current view.');
      return;
    }

    // Convert sales data to CSV format
    const csvData = salesToExport.map(sale => ({
      'Sale ID': sale.id,
      'Customer': sale.customer?.name || 'N/A',
      'Total Price': sale.totalPrice || sale.total_amount || 0,
      'Status': sale.status,
      'Payment Method': sale.paymentMethod || 'N/A',
      'Date': new Date(sale.createdAt || sale.created_at).toLocaleDateString(),
    }));
    // Create CSV content
    const headers = Object.keys(csvData[0]);
    const csvContent = [
      headers.join(','),
      ...csvData.map(row => headers.map(header => `"${row[header] || ''}"`).join(','))
    ].join('\n');
    // Download CSV file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `sales_export_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleBulkImport = () => {};

  const handleRowSelect = (id) => {
    setSelectedRows((prev) =>
      prev.includes(id) ? prev.filter((rowId) => rowId !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedRows.length === salesList.length) {
      setSelectedRows([]);
    } else {
      setSelectedRows(salesList.map((sale) => sale.id));
    }
  };

  const handleRetry = () => {
    dispatch(
      fetchSales({
        page: currentPage,
        limit: itemsPerPage,
        search: debouncedSearchTerm,
        status: statusFilter,
      })
    );
  };

  // ✅ Full-page spinner on first load
  if (loading && salesList.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <LoadingOverlay title="Sales" description="Loading sales data..." />
        {error && <div className="mt-4 text-red-600 text-center">{error}</div>}
        <div className="mt-4 text-gray-500 text-sm">
          If this takes too long, please check if the backend server is running.
        </div>
      </div>
    );
  }

  // ✅ Error fallback
  if (error) {
    return <SalesErrorState error={error} onRetry={handleRetry} />;
  }

  return (
    <div className="space-y-8 bg-white text-gray-900 dark:bg-background dark:text-text min-h-screen p-4 sm:p-6">
      {/* Enhanced Header with Search and Actions */}
      <SalesHeader
        onOpenNewSale={() => setIsNewSaleOpen(true)}
        searchTerm={searchTerm}
        onSearchChange={(e) => setSearchTerm(e.target.value)}
        onExportCSV={handleBulkExport}
      />

      {/* Sales Statistics Cards */}
      <SalesStats salesList={salesList} />

      {/* Sales Table */}
      <SalesTable
        salesList={salesList}
        selectedRows={selectedRows}
        onRowSelect={handleRowSelect}
        onSelectAll={handleSelectAll}
        loading={loading}
        onViewReceipt={handleViewReceipt}
        onEditSale={handleEditSale}
        onDeleteSale={handleDeleteSale}
        onUpdateStatus={handleUpdateStatus}
        searchTerm={searchTerm}
        onClearSearch={() => setSearchTerm("")}
      />

      {/* Pagination */}
      <UnifiedPagination
        sliceName="sale"
        showPageSizeSelector={true}
        showItemCount={true}
        pageSizeOptions={[5, 10, 25, 50]}
      />

      {/* Actions and Modals */}
      <SalesActions
        selectedRows={selectedRows}
        onBulkDelete={handleBulkDelete}
        onBulkExport={handleBulkExport}
        onBulkImport={handleBulkImport}
        isNewSaleOpen={isNewSaleOpen}
        onCloseNewSale={() => setIsNewSaleOpen(false)}
        onNewSaleSuccess={() => {
          dispatch(
            fetchSales({
              page: currentPage,
              limit: itemsPerPage,
              search: searchTerm,
              status: statusFilter,
            })
          );
        }}
        selectedSale={selectedSale}
        isReceiptOpen={isReceiptOpen}
        onCloseReceipt={() => setIsReceiptOpen(false)}
        editSale={editSale}
        isEditModalOpen={isEditModalOpen}
        onCloseEditModal={() => setIsEditModalOpen(false)}
        onEditSaleSuccess={() => {
          dispatch(
            fetchSales({
              page: currentPage,
              limit: itemsPerPage,
              search: searchTerm,
              status: statusFilter,
            })
          );
        }}
        isDeleteModalOpen={isDeleteModalOpen}
        onCloseDeleteModal={() => setIsDeleteModalOpen(false)}
        onConfirmDelete={confirmDeleteSale}
        isImportModalOpen={isImportModalOpen}
        onCloseImportModal={setIsImportModalOpen}
      />
    </div>
  );
};

export default SalesPage;
