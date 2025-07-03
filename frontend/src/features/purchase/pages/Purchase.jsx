import React, { useState, useEffect } from "react";
import {
  Plus,
  Search,
  Filter,
  ArrowUpDown,
  Eye,
  ShoppingCart,
  Check,
  Clock,
  QrCode,
  Download,
  Upload,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchPurchases,
  updatePurchaseStatus,
  toggleItemSelection,
  toggleSelectAll,
  clearSelection,
  deletePurchase,
} from "../../../store/slices/purchaseSlice";
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
import NewPurchaseModal from "../components/NewPurchaseModal";
import QRScannerModal from "../../sales/components/QRScannerModal";
import LoadingOverlay from "../../../components/shared/LoadingOverlay";
import { BarsSpinner } from "../../../components/shared/Spinner";
import BulkActions from "../../../components/shared/BulkActions";
import { exportPurchasesToCSV } from "../../../utils/csvUtils";
import CSVImportModal from "../../../components/shared/CSVImportModal";
import {
  validatePurchaseCSV,
  convertCSVToPurchases,
} from "../../../utils/csvUtils";

const PurchasesPage = () => {
  const dispatch = useDispatch();
  const {
    purchases = [],
    loading = false,
    error,
    selectedItems = [],
    selectAll = false,
  } = useSelector((state) => state.purchases || {});

  const [searchTerm, setSearchTerm] = useState("");
  const [isNewPurchaseOpen, setIsNewPurchaseOpen] = useState(false);
  const [isQRScannerOpen, setIsQRScannerOpen] = useState(false);
  const [sortField, setSortField] = useState("created_at");
  const [sortOrder, setSortOrder] = useState("desc");
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [filterOptions, setFilterOptions] = useState({
    hasPhone: false,
    hasAddress: false,
  });
  const [showImportModal, setShowImportModal] = useState(false);

  useEffect(() => {
    if (purchases.length === 0) {
      dispatch(fetchPurchases({ sortBy: sortField, order: sortOrder }));
    }
  }, [dispatch]);

  const filteredPurchases = purchases.filter(
    (purchase) =>
      purchase.id.toString().includes(searchTerm.toLowerCase()) ||
      purchase.supplier?.name?.toLowerCase()?.includes(searchTerm.toLowerCase())
  );

  const formatDate = (date) => {
    return new Intl.DateTimeFormat("en-US", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(date));
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "received":
        return (
          <Badge variant="success" className="flex items-center gap-1">
            <Check size={12} /> Completed
          </Badge>
        );
      case "pending":
        return (
          <Badge variant="warning" className="flex items-center gap-1">
            <Clock size={12} /> Pending
          </Badge>
        );
      case "cancelled":
        return <Badge variant="danger">Cancelled</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const handleUpdateStatus = (id, status) => {
    const mappedStatus = status === "completed" ? "received" : status;
    dispatch(updatePurchaseStatus({ id, status: mappedStatus }));
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
    setShowSortMenu(false);
  };

  // Bulk Handlers
  const handleBulkDelete = (items) => {
    if (
      window.confirm(
        `Are you sure you want to delete ${items.length} selected purchase(s)?`
      )
    ) {
      items.forEach((id) => dispatch(deletePurchase(id)));
      dispatch(clearSelection());
    }
  };
  const handleBulkExport = (items) => {
    const toExport =
      items.length > 0
        ? filteredPurchases.filter((purchase) => items.includes(purchase.id))
        : filteredPurchases;
    exportPurchasesToCSV(toExport);
  };
  const handleBulkImport = async (csvData) => {
    // TODO: Implement importPurchases thunk and backend endpoint
    const validation = validatePurchaseCSV(csvData);
    if (!validation.isValid) {
      alert(`Import failed: ${validation.errors.join(", ")}`);
      return;
    }
    const purchases = convertCSVToPurchases(csvData);
    alert(
      "Purchase import is not fully implemented. Would import: " +
        purchases.length +
        " purchases."
    );
    setShowImportModal(false);
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
    return (
      <div className="flex flex-col items-center justify-center h-96 text-red-600">
        <span className="text-2xl font-bold mb-2">Error</span>
        <span>{error}</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 bg-white text-gray-900 dark:bg-background dark:text-white min-h-screen">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold">Purchases</h1>
        <div className="flex flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            size="sm"
            icon={<Download size={16} />}
            onClick={() => exportPurchasesToCSV(filteredPurchases)}
          >
            Export CSV
          </Button>
          <Button
            variant="outline"
            size="sm"
            icon={<Upload size={16} />}
            onClick={() => setShowImportModal(true)}
          >
            Import CSV
          </Button>
          <Button
            variant="outline"
            size="md"
            icon={<QrCode size={16} />}
            onClick={() => setIsQRScannerOpen(true)}
          >
            Scan QR Code
          </Button>
          <Button
            variant="primary"
            size="md"
            icon={<Plus size={16} />}
            onClick={() => setIsNewPurchaseOpen(true)}
          >
            Create Purchase Order
          </Button>
        </div>
      </div>

      <BulkActions
        selectedItems={selectedItems}
        onDelete={handleBulkDelete}
        onExport={handleBulkExport}
        onImport={handleBulkImport}
        importConfig={{}}
        showImport={false}
        showExport={true}
        showDelete={true}
        className="mb-4"
      />

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Input
            placeholder="Search by PO number, supplier..."
            icon={<Search size={18} className="text-gray-400" />}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full"
          />
        </div>

        <div className="relative">
          <Button
            variant="outline"
            icon={<Filter size={16} />}
            onClick={() => setShowFilterMenu(!showFilterMenu)}
          >
            Filter
          </Button>

          {showFilterMenu && (
            <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 p-4 z-50 dark:bg-gray-800 dark:border-gray-700">
              <div className="space-y-4">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={filterOptions.hasPhone}
                    onChange={(e) =>
                      setFilterOptions({
                        ...filterOptions,
                        hasPhone: e.target.checked,
                      })
                    }
                    className="rounded border-gray-300 dark:border-gray-600"
                  />
                  <span className="text-sm">Has Phone Number</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={filterOptions.hasAddress}
                    onChange={(e) =>
                      setFilterOptions({
                        ...filterOptions,
                        hasAddress: e.target.checked,
                      })
                    }
                    className="rounded border-gray-300 dark:border-gray-600"
                  />
                  <span className="text-sm">Has Address</span>
                </label>
              </div>
            </div>
          )}
        </div>

        <div className="relative">
          <Button
            variant="outline"
            icon={<ArrowUpDown size={16} />}
            onClick={() => setShowSortMenu(!showSortMenu)}
          >
            Sort
          </Button>

          {showSortMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden z-50 dark:bg-gray-800 dark:border-gray-700">
              {["id", "created_at", "total_amount", "status"].map((field) => (
                <button
                  key={field}
                  className="w-full px-4 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center justify-between"
                  onClick={() => handleSort(field)}
                >
                  <span>
                    {field === "created_at"
                      ? "Created Date"
                      : field === "total_amount"
                      ? "Total Amount"
                      : field.charAt(0).toUpperCase() + field.slice(1)}
                  </span>
                  {sortField === field && (
                    <Check size={16} className="text-blue-600" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="relative bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden dark:bg-background-secondary dark:border-background-secondary">
        {loading && purchases.length > 0 && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/40 dark:bg-white/10">
            <BarsSpinner />
          </div>
        )}

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
                <input
                  type="checkbox"
                  checked={selectAll}
                  onChange={() => dispatch(toggleSelectAll())}
                />
              </TableHead>
              <TableHead>Purchase Order</TableHead>
              <TableHead>Date & Time</TableHead>
              <TableHead>Supplier</TableHead>
              <TableHead>Total Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {filteredPurchases.length > 0 ? (
              filteredPurchases.map((purchase) => (
                <TableRow key={purchase.id}>
                  <TableCell>
                    <input
                      type="checkbox"
                      checked={selectedItems.includes(purchase.id)}
                      onChange={() =>
                        dispatch(toggleItemSelection(purchase.id))
                      }
                    />
                  </TableCell>
                  <TableCell className="font-medium text-gray-900 dark:text-white">
                    {purchase.id}
                  </TableCell>
                  <TableCell>{formatDate(purchase.created_at)}</TableCell>
                  <TableCell>
                    {purchase.supplier?.name ||
                      `Supplier #${purchase.supplier_id}`}
                  </TableCell>
                  <TableCell className="font-medium">
                    ${Number(purchase.total_amount).toFixed(2)}
                  </TableCell>
                  <TableCell>{getStatusBadge(purchase.status)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      {purchase.status === "pending" && (
                        <>
                          <Button
                            variant="ghost"
                            size="sm"
                            icon={<Check size={16} />}
                            onClick={() =>
                              handleUpdateStatus(purchase.id, "received")
                            }
                          >
                            Complete
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900"
                            onClick={() =>
                              handleUpdateStatus(purchase.id, "cancelled")
                            }
                          >
                            Reject
                          </Button>
                        </>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        icon={<Eye size={16} />}
                      >
                        View
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="h-32 text-center">
                  <div className="flex flex-col items-center justify-center text-gray-500">
                    <ShoppingCart size={28} className="mb-2" />
                    <h3 className="text-lg font-medium">
                      No purchase orders found
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

      <NewPurchaseModal
        isOpen={isNewPurchaseOpen}
        onClose={() => setIsNewPurchaseOpen(false)}
        onSuccess={() =>
          dispatch(fetchPurchases({ sortBy: sortField, order: sortOrder }))
        }
      />

      <QRScannerModal
        isOpen={isQRScannerOpen}
        onClose={() => setIsQRScannerOpen(false)}
        onScan={(qrCode) => {
          console.log("Scanned QR code:", qrCode);
        }}
      />

      <CSVImportModal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        onImport={handleBulkImport}
        config={{
          validate: validatePurchaseCSV,
          templateHeaders: [
            "Purchase Order",
            "Date & Time",
            "Supplier",
            "Total Amount",
            "Status",
          ],
          title: "Import Purchases from CSV",
          importButtonLabel: "Import Purchases",
        }}
      />
    </div>
  );
};

export default PurchasesPage;
