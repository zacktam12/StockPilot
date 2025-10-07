import React from "react";
import { useNavigate } from "react-router-dom";
import { 
  ShoppingCart, 
  Check, 
  Clock, 
  Eye 
} from "lucide-react";
import {
  TableCell,
  TableRow,
} from "../../../components/shared/table";
import Button from "../../../components/shared/Button";
import Badge from "../../../components/shared/Badge";
import { 
  toggleItemSelection, 
  updatePurchaseStatus 
} from "../../../store/slices/purchaseSlice";
import { useDispatch } from "react-redux";

const PurchaseTableRow = ({ 
  purchase, 
  isSelected, 
  onToggleSelection, 
  onUpdateStatus 
}) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleRowClick = (e) => {
    // Don't navigate if clicking on checkbox or button
    if (e.target.type === 'checkbox' || e.target.closest('button')) {
      return;
    }
    
    navigate(`/purchases/${purchase.id}`);
  };

  const formatDate = (date) => {
    if (!date) {
      return "No date available";
    }
    
    try {
      const dateObj = new Date(date);
      if (isNaN(dateObj.getTime())) {
        return "Invalid date";
      }
      return new Intl.DateTimeFormat("en-US", {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(dateObj);
    } catch (error) {
      return "Invalid date";
    }
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

  return (
    <TableRow 
      onClick={handleRowClick}
      className={`border-b border-gray-200 hover:bg-gray-50 cursor-pointer bg-white even:bg-gray-50 ${isSelected ? "bg-blue-50 dark:bg-blue-900/20" : ""}`}
    >
      <TableCell className="w-8 pr-2">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={() => dispatch(toggleItemSelection(purchase.id))}
          className="rounded-none border-gray-300 text-blue-600 focus:ring-gray-400"
        />
      </TableCell>
      <TableCell className="font-medium text-gray-900 dark:text-white flex-1 pl-2">
        {purchase.poNumber || purchase.id}
      </TableCell>
      <TableCell className="hidden xl:table-cell flex-1">
        {purchase.user?.firstName || purchase.user?.email || 'Unknown User'}
      </TableCell>
      <TableCell className="flex-1">
        {purchase.supplier?.name || `Supplier #${purchase.supplierId}`}
      </TableCell>
      <TableCell className="hidden lg:table-cell text-center flex-1">
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200">
          {purchase.productPurchases?.length || 0}
        </span>
      </TableCell>
      <TableCell className="font-medium flex-1">
        ${Number(purchase.totalCost).toFixed(2)}
      </TableCell>
      <TableCell className="hidden xl:table-cell flex-1">
        <select
          value={purchase.status}
          onChange={(e) => handleUpdateStatus(purchase.id, e.target.value)}
          className="text-xs font-medium rounded-lg appearance-none bg-no-repeat bg-right bg-center focus:outline-none focus:ring-0 focus:border-0"
          style={{
            backgroundColor: purchase.status === 'received' ? '#dcfce7' : purchase.status === 'pending' ? '#fef3c7' : '#fecaca',
            color: purchase.status === 'received' ? '#166534' : purchase.status === 'pending' ? '#92400e' : '#991b1b',
            border: '1px solid',
            borderColor: purchase.status === 'received' ? '#bbf7d0' : purchase.status === 'pending' ? '#fde68a' : '#fca5a5',
            padding: '6px 20px 6px 8px',
            cursor: 'pointer',
            backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e")`,
            backgroundSize: '12px 12px',
            backgroundPosition: 'right 6px center',
            width: 'auto',
            minWidth: '120px',
            maxWidth: '180px'
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <option 
            value="pending" 
            style={{ backgroundColor: '#fef3c7', color: '#92400e' }}
          >
            Pending
          </option>
          <option 
            value="received" 
            style={{ backgroundColor: '#dcfce7', color: '#166534' }}
          >
            Received
          </option>
          <option 
            value="cancelled" 
            style={{ backgroundColor: '#fecaca', color: '#991b1b' }}
          >
            Cancelled
          </option>
        </select>
      </TableCell>
    </TableRow>
  );
};

export default PurchaseTableRow;
