import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Plus,
  Search,
  Eye,
  Receipt,
  Check,
  QrCode,
  AlertCircle,
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
import { fetchSales, updateSaleStatus } from "../../../store/slices/salesSlice";
import LoadingOverlay from "../../../components/shared/LoadingOverlay";
import { BarsSpinner } from "../../../components/shared/Spinner";

const SalesPage = () => {
  const dispatch = useDispatch();
  const { sales = [], loading, error } = useSelector((state) => state.sales);

  const [searchTerm, setSearchTerm] = useState("");
  const [isNewSaleOpen, setIsNewSaleOpen] = useState(false);
  const [isQRScannerOpen, setIsQRScannerOpen] = useState(false);
  const [selectedSale, setSelectedSale] = useState(null);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // ✅ Always fetch sales on mount
  useEffect(() => {
    dispatch(fetchSales());
  }, [dispatch]);

  const handleUpdateStatus = async (id, status) => {
    try {
      await dispatch(updateSaleStatus({ id, status })).unwrap();
      dispatch(fetchSales());
    } catch (error) {
      console.error("Error updating sale status:", error);
    }
  };

  const handleViewReceipt = (sale) => {
    setSelectedSale(sale);
    setIsReceiptOpen(true);
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

  const filteredSales = sales.filter((sale) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      sale.id.toString().includes(term) ||
      (sale.customer_id && sale.customer_id.toString().includes(term))
    );
  });

  const totalPages = Math.ceil(filteredSales.length / itemsPerPage);
  const currentSales = filteredSales.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  // ✅ Full-page spinner on first load
  if (loading && sales.length === 0) {
    return <LoadingOverlay title="Sales" description="Loading sales data..." />;
  }

  // ✅ Error fallback
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-red-600">
        <span className="text-2xl font-bold mb-2">Error</span>
        <span>{error}</span>
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

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md flex items-center gap-2">
          <AlertCircle size={16} />
          {error}
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Input
            placeholder="Search sales..."
            icon={<Search size={18} className="text-gray-400" />}
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden dark:bg-background-secondary dark:border-background-secondary">
        <Table>
          <>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading && sales.length > 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="py-16 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <BarsSpinner />
                      <span className="mt-2 text-gray-500">Loading...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : currentSales.length > 0 ? (
                currentSales.map((sale) => (
                  <TableRow key={sale.id}>
                    <TableCell className="font-medium">#{sale.id}</TableCell>
                    <TableCell>{formatDate(sale.created_at)}</TableCell>
                    <TableCell>
                      {sale.customer?.name || `Customer #${sale.customer_id}`}
                    </TableCell>
                    <TableCell>${sale.total_amount.toFixed(2)}</TableCell>
                    <TableCell>{getStatusBadge(sale.status)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        {sale.status === "pending" && (
                          <>
                            <Button
                              variant="ghost"
                              size="sm"
                              icon={<Check size={16} />}
                              onClick={() =>
                                handleUpdateStatus(sale.id, "completed")
                              }
                            >
                              Complete
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              onClick={() =>
                                handleUpdateStatus(sale.id, "cancelled")
                              }
                            >
                              Cancel
                            </Button>
                          </>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          icon={<Eye size={16} />}
                          onClick={() => handleViewReceipt(sale)}
                        >
                          View
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="h-32 text-center">
                    <div className="flex flex-col items-center justify-center text-gray-500">
                      <Receipt size={28} className="mb-2" />
                      <h3 className="text-lg font-medium">No sales found</h3>
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
          </>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className="flex justify-between items-center">
          <Button
            variant="outline"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          <span className="text-sm">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            variant="outline"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            Next
          </Button>
        </div>
      )}

      <NewSaleModal
        isOpen={isNewSaleOpen}
        onClose={() => setIsNewSaleOpen(false)}
        onSuccess={() => {
          dispatch(fetchSales());
          setIsNewSaleOpen(false);
        }}
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
    </div>
  );
};

export default SalesPage;
