import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Plus,
  Search,
  QrCode,
  AlertCircle,
  Check,
  Eye,
  Edit,
  Trash,
} from "lucide-react";
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
import NewSaleModal from "../components/NewSaleModal";
import QRScannerModal from "../components/QRScannerModal";
import OrderReceipt from "../components/OrderReceipt";
import BulkActions from "../../../components/shared/BulkActions";
import ActionMenu from "../../../components/shared/ActionMenu";
import CSVImportModal from "../../../components/shared/CSVImportModal";
import ExportButton from "../../../components/shared/ExportButton";
import {
  fetchSales,
  updateSaleStatus,
  setStatusFilter,
  setCurrentPage,
} from "../../../store/slices/salesSlice";
import LoadingOverlay from "../../../components/shared/LoadingOverlay";
import { BarsSpinner } from "../../../components/shared/Spinner";
import { Dialog } from "@headlessui/react";
import { useDebounce } from "../../../hooks/useDebounce";
import { API_BASE_URL } from "../../../config";

const statusOptions = [
  { label: "All", value: "all" },
  { label: "Completed", value: "completed" },
  { label: "Pending", value: "pending" },
  { label: "Cancelled", value: "cancelled" },
  { label: "Recently Added", value: "recent" },
];

const SalesPage = () => {
  const dispatch = useDispatch();
  const {
    sales = [],
    loading,
    error,
    pagination = {
      currentPage: 1,
      itemsPerPage: 10,
      totalItems: 0,
      totalPages: 0,
    },
    statusFilter = "all",
  } = useSelector((state) => state.sales || {});

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

  // Defensive: ensure sales is always an array
  const salesList = Array.isArray(sales) ? sales : [];

  const [searchTerm, setSearchTerm] = useState("");
  const [isNewSaleOpen, setIsNewSaleOpen] = useState(false);
  const [isQRScannerOpen, setIsQRScannerOpen] = useState(false);
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
        console.log("Backend health check:", data);
      } catch (error) {
        console.error("Backend health check failed:", error);
      }
    };

    checkBackendHealth();
  }, []);

  // Fetch sales with backend pagination/filtering
  useEffect(() => {
    console.log("Sales useEffect triggered with:", {
      currentPage: pagination.currentPage,
      itemsPerPage: pagination.itemsPerPage,
      search: debouncedSearchTerm,
      status: statusFilter,
    });

    dispatch(
      fetchSales({
        page: pagination.currentPage,
        limit: pagination.itemsPerPage,
        search: debouncedSearchTerm,
        status: statusFilter,
      })
    );
  }, [
    dispatch,
    pagination.currentPage,
    pagination.itemsPerPage,
    debouncedSearchTerm,
    statusFilter,
  ]);

  const handleUpdateStatus = async (id, status) => {
    try {
      await dispatch(updateSaleStatus({ id, status })).unwrap();
      dispatch(
        fetchSales({
          page: pagination.currentPage,
          limit: pagination.itemsPerPage,
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
        page: pagination.currentPage,
        limit: pagination.itemsPerPage,
        search: searchTerm,
        status: statusFilter,
      })
    );
  };

  const handleBulkDelete = () => {};

  const handleBulkExport = () => {};

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

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const getStatusBadge = (status) => {
    const statusStyles = {
      completed: "bg-green-100 text-green-800",
      pending: "bg-yellow-100 text-yellow-800",
      cancelled: "bg-red-100 text-red-800",
    };
    return (
      <span
        className={`px-2 py-1 rounded text-xs font-medium ${
          statusStyles[status] || "bg-gray-100 text-gray-800"
        }`}
      >
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
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
    return (
      <div className="flex flex-col items-center justify-center h-96 text-red-600">
        <span className="text-2xl font-bold mb-2">Error</span>
        <span className="text-center mb-4">{error}</span>
        <Button
          variant="primary"
          onClick={() => {
            dispatch(
              fetchSales({
                page: pagination.currentPage,
                limit: pagination.itemsPerPage,
                search: debouncedSearchTerm,
                status: statusFilter,
              })
            );
          }}
        >
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 min-h-screen bg-white text-gray-900 dark:bg-background dark:text-text">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Sales
        </h1>
        <div className="flex gap-2">
          <Button
            variant="primary"
            size="md"
            icon={<Plus size={16} />}
            onClick={() => setIsNewSaleOpen(true)}
          >
            New Sale
          </Button>
          <Button
            variant="outline"
            size="md"
            icon={<QrCode size={16} />}
            onClick={() => setIsQRScannerOpen(true)}
          >
            Scan QR
          </Button>
        </div>
      </div>

      {selectedRows.length > 0 && (
        <BulkActions
          selectedItems={selectedRows}
          onDelete={handleBulkDelete}
          onExport={handleBulkExport}
          onImport={handleBulkImport}
          importConfig={
            {
              /* TODO: Add sales import config */
            }
          }
        />
      )}

      <div className="flex flex-col sm:flex-row gap-4 items-center">
        <div className="relative flex-1">
          <Input
            placeholder="Search sales..."
            icon={<Search size={18} className="text-gray-400" />}
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
            }}
          />
        </div>
        <div>
          <select
            className="border rounded-md p-2 bg-gray-100 dark:bg-gray-700 dark:text-white"
            value={statusFilter}
            onChange={(e) => dispatch(setStatusFilter(e.target.value))}
          >
            {statusOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden dark:bg-background-secondary dark:border-background-secondary">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
                <input
                  type="checkbox"
                  checked={
                    selectedRows.length === salesList.length &&
                    salesList.length > 0
                  }
                  onChange={handleSelectAll}
                />
              </TableHead>
              <TableHead>ID</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading && salesList.length > 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="py-16 text-center">
                  <div className="flex flex-col items-center justify-center">
                    <BarsSpinner />
                    <span className="mt-2 text-gray-500">Loading...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : salesList.length > 0 ? (
              salesList.map((sale) => (
                <TableRow key={sale.id}>
                  <TableCell>
                    <input
                      type="checkbox"
                      checked={selectedRows.includes(sale.id)}
                      onChange={() => handleRowSelect(sale.id)}
                    />
                  </TableCell>
                  <TableCell className="font-medium">#{sale.id}</TableCell>
                  <TableCell>{formatDate(sale.created_at)}</TableCell>
                  <TableCell>
                    {sale.customer?.name || `Customer #${sale.customer_id}`}
                  </TableCell>
                  <TableCell>
                    ${sale.total_amount?.toFixed(2) ?? "0.00"}
                  </TableCell>
                  <TableCell>{getStatusBadge(sale.status)}</TableCell>
                  <TableCell className="text-right">
                    <ActionMenu
                      item={sale}
                      actions={[
                        {
                          label: "View",
                          icon: <Eye size={16} />,
                          onClick: () => handleViewReceipt(sale),
                        },
                        {
                          label: "Edit",
                          icon: <Edit size={16} />,
                          onClick: () => handleEditSale(sale),
                        },
                        {
                          label: "Delete",
                          icon: <Trash size={16} />,
                          onClick: () => handleDeleteSale(sale),
                          className:
                            "text-red-600 hover:text-red-700 hover:bg-red-50",
                        },
                        ...(sale.status === "pending"
                          ? [
                              {
                                label: "Complete",
                                icon: <Check size={16} />,
                                onClick: () =>
                                  handleUpdateStatus(sale.id, "completed"),
                              },
                              {
                                label: "Cancel",
                                icon: <Trash size={16} />,
                                onClick: () =>
                                  handleUpdateStatus(sale.id, "cancelled"),
                                className:
                                  "text-red-600 hover:text-red-700 hover:bg-red-50",
                              },
                            ]
                          : []),
                      ]}
                    />
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="h-32 text-center">
                  <div className="flex flex-col items-center justify-center text-gray-500">
                    <span className="mb-2">No sales found</span>
                    {searchTerm && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSearchTerm("")}
                      >
                        Clear search
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex justify-between items-center">
          <Button
            variant="outline"
            onClick={() => dispatch(setCurrentPage(pagination.currentPage - 1))}
            disabled={pagination.currentPage === 1}
          >
            Previous
          </Button>
          <span className="text-sm">
            Page {pagination.currentPage} of {pagination.totalPages}
          </span>
          <Button
            variant="outline"
            onClick={() => dispatch(setCurrentPage(pagination.currentPage + 1))}
            disabled={pagination.currentPage === pagination.totalPages}
          >
            Next
          </Button>
        </div>
      )}

      <NewSaleModal
        isOpen={isNewSaleOpen}
        onClose={() => setIsNewSaleOpen(false)}
        onSuccess={() => {
          dispatch(
            fetchSales({
              page: pagination.currentPage,
              limit: pagination.itemsPerPage,
              search: searchTerm,
              status: statusFilter,
            })
          );
          setIsNewSaleOpen(false);
        }}
      />

      <NewSaleModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSuccess={() => {
          dispatch(
            fetchSales({
              page: pagination.currentPage,
              limit: pagination.itemsPerPage,
              search: searchTerm,
              status: statusFilter,
            })
          );
          setIsEditModalOpen(false);
        }}
        sale={editSale}
        isEdit
      />

      <QRScannerModal
        isOpen={isQRScannerOpen}
        onClose={() => setIsQRScannerOpen(false)}
      />

      <OrderReceipt
        isOpen={isReceiptOpen}
        onClose={() => setIsReceiptOpen(false)}
        order={selectedSale}
      />

      {/* Import/Export buttons (outside BulkActions) */}
      <div className="flex gap-2 mt-4">
        <Button variant="outline" onClick={() => setIsImportModalOpen(true)}>
          Import CSV
        </Button>
        <ExportButton
          reportType="sales"
          reportData={sales}
          reportTitle="Sales Report"
          isLoading={loading}
        />
      </div>
      <CSVImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImport={handleBulkImport}
        config={
          {
            /* TODO: Add sales import config */
          }
        }
      />

      {/* Delete confirmation modal */}
      <Dialog
        open={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
      >
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl max-w-sm w-full">
            <Dialog.Title className="text-lg font-semibold mb-2">
              Confirm Delete
            </Dialog.Title>
            <Dialog.Description className="mb-4">
              Are you sure you want to delete this sale?
            </Dialog.Description>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setIsDeleteModalOpen(false)}
              >
                Cancel
              </Button>
              <Button variant="danger" onClick={confirmDeleteSale}>
                Delete
              </Button>
            </div>
          </div>
        </div>
      </Dialog>
    </div>
  );
};

export default SalesPage;
