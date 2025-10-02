import React from "react";
import { useDispatch } from "react-redux";
import { 
  ShoppingCart, 
  Check, 
  Clock, 
  Eye 
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../components/shared/Table";
import Button from "../../../components/shared/Button";
import Badge from "../../../components/shared/Badge";
import { BarsSpinner } from "../../../components/shared/Spinner";
import { 
  toggleItemSelection, 
  toggleSelectAll, 
  updatePurchaseStatus 
} from "../../../store/slices/purchaseSlice";

const PurchaseTable = ({ 
  filteredPurchases, 
  selectedItems, 
  selectAll, 
  loading, 
  onUpdateStatus 
}) => {
  const dispatch = useDispatch();

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
    if (onUpdateStatus) {
      onUpdateStatus(id, mappedStatus);
    }
  };

  const PurchaseTableHeader = () => (
    <TableHeader>
      <TableRow>
        <TableHead>
          <input
            type="checkbox"
            checked={selectAll}
            onChange={() => dispatch(toggleSelectAll())}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
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
  );

  const PurchaseTableRow = ({ purchase }) => (
    <TableRow>
      <TableCell>
        <input
          type="checkbox"
          checked={selectedItems.includes(purchase.id)}
          onChange={() => dispatch(toggleItemSelection(purchase.id))}
          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        />
      </TableCell>
      <TableCell className="font-medium text-gray-900 dark:text-white">
        {purchase.id}
      </TableCell>
      <TableCell>{formatDate(purchase.created_at)}</TableCell>
      <TableCell>
        {purchase.supplier?.name || `Supplier #${purchase.supplier_id}`}
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
                onClick={() => handleUpdateStatus(purchase.id, "received")}
              >
                Complete
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900"
                onClick={() => handleUpdateStatus(purchase.id, "cancelled")}
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
  );

  const PurchaseEmptyState = () => (
    <div className="flex flex-col items-center justify-center text-gray-500">
      <ShoppingCart size={28} className="mb-2" />
      <h3 className="text-lg font-medium">No purchase orders found</h3>
      <p className="text-sm">Try adjusting your search or filters</p>
    </div>
  );

  const PurchaseTableBody = () => {
    if (filteredPurchases.length === 0) {
      return (
        <TableBody>
          <TableRow>
            <TableCell colSpan={7} className="h-32 text-center">
              <PurchaseEmptyState />
            </TableCell>
          </TableRow>
        </TableBody>
      );
    }

    return (
      <TableBody>
        {filteredPurchases.map((purchase) => (
          <PurchaseTableRow key={purchase.id} purchase={purchase} />
        ))}
      </TableBody>
    );
  };

  return (
    <div className="relative bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden dark:bg-background-secondary dark:border-background-secondary">
      {loading && filteredPurchases.length > 0 && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/40 dark:bg-white/10">
          <BarsSpinner />
        </div>
      )}

      <Table>
        <PurchaseTableHeader />
        <PurchaseTableBody />
      </Table>
    </div>
  );
};

export default PurchaseTable;
