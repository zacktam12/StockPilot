import React from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { 
  Eye, 
  Edit, 
  Trash, 
  Check 
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../components/shared/table";
import Button from "../../../components/shared/Button";
import ActionMenu from "../../../components/shared/ActionMenu";
import { BarsSpinner } from "../../../components/shared/Spinner";

const SalesTable = ({ 
  salesList, 
  selectedRows, 
  onRowSelect, 
  onSelectAll, 
  loading, 
  onViewReceipt, 
  onEditSale, 
  onDeleteSale, 
  onUpdateStatus,
  searchTerm,
  onClearSearch
}) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();


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

  const SalesTableHeader = () => (
    <TableHeader>
      <TableRow>
        <TableHead className="w-8 pr-2">
          <input
            type="checkbox"
            checked={
              selectedRows.length === salesList.length &&
              salesList.length > 0
            }
            onChange={onSelectAll}
            className="rounded-none border-gray-300 text-blue-600 focus:ring-gray-400"
          />
        </TableHead>
        <TableHead className="min-w-[150px] pl-2">Customer</TableHead>
        <TableHead className="min-w-[100px]">Amount</TableHead>
        <TableHead className="min-w-[200px]">Product</TableHead>
        <TableHead className="min-w-[80px]">
          <span className="hidden sm:inline">Total Qty</span>
          <span className="sm:hidden">Qty</span>
        </TableHead>
        <TableHead className="min-w-[120px]">Status</TableHead>
      </TableRow>
    </TableHeader>
  );

  const handleRowClick = (e, saleId) => {
    // Don't navigate if clicking on checkbox
    if (e.target.type === 'checkbox') {
      return;
    }
    
    navigate(`/sales/${saleId}`);
  };

  const SalesTableRow = ({ sale }) => (
    <TableRow 
      onClick={(e) => handleRowClick(e, sale.id)}
      className="border-b border-gray-200 hover:bg-gray-50 cursor-pointer bg-white even:bg-gray-50"
    >
      <TableCell className="w-8 pr-2">
        <input
          type="checkbox"
          checked={selectedRows.includes(sale.id)}
          onChange={() => onRowSelect(sale.id)}
          className="rounded-none border-gray-300 text-blue-600 focus:ring-gray-400"
        />
      </TableCell>
      <TableCell className="min-w-[150px] font-medium text-gray-900 pl-2">
        <span className="truncate block">{sale.customer?.name || `Customer #${sale.customerId}`}</span>
      </TableCell>
      <TableCell className="min-w-[100px] text-gray-900">
        <span className="font-medium">${sale.totalPrice?.toFixed(2) ?? "0.00"}</span>
      </TableCell>
      <TableCell className="min-w-[200px]">
        {sale.productSales && sale.productSales.length > 0 ? (
          <div className="flex flex-wrap gap-1">
            {sale.productSales.slice(0, 3).map((productSale, index) => (
              <span key={index} className="inline-flex items-center px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                {productSale.product?.name || 'Unknown Product'} (x{productSale.sale_quantity})
              </span>
            ))}
            {sale.productSales.length > 3 && (
              <span className="inline-flex items-center px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full">
                +{sale.productSales.length - 3} more
              </span>
            )}
          </div>
        ) : (
          <span className="text-gray-500">No products</span>
        )}
      </TableCell>
      <TableCell className="min-w-[80px] text-gray-900">
        {sale.productSales && sale.productSales.length > 0 ? (
          <span className="font-medium">
            {sale.productSales.reduce((total, productSale) => total + (productSale.sale_quantity || 0), 0)}
          </span>
        ) : (
          <span className="text-gray-500">0</span>
        )}
      </TableCell>
      <TableCell className="min-w-[120px]">
        <select
          value={sale.status}
          onChange={(e) => onUpdateStatus(sale.id, e.target.value)}
          className="text-xs font-medium rounded-lg appearance-none bg-no-repeat bg-right bg-center focus:outline-none focus:ring-0 focus:border-0"
          style={{
            backgroundColor: sale.status === 'completed' ? '#dcfce7' : sale.status === 'pending' ? '#fef3c7' : '#fecaca',
            color: sale.status === 'completed' ? '#166534' : sale.status === 'pending' ? '#92400e' : '#991b1b',
            border: '1px solid',
            borderColor: sale.status === 'completed' ? '#bbf7d0' : sale.status === 'pending' ? '#fde68a' : '#fca5a5',
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
            value="completed" 
            style={{ backgroundColor: '#dcfce7', color: '#166534' }}
          >
            Completed
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

  const SalesEmptyState = () => (
    <div className="flex flex-col items-center justify-center text-gray-500">
      <span className="mb-2">No sales found</span>
      {searchTerm && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onClearSearch}
        >
          Clear search
        </Button>
      )}
    </div>
  );

  const SalesTableBody = () => {
    if (loading && salesList.length > 0) {
      return (
        <TableRow>
          <TableCell colSpan={6} className="py-16 text-center">
            <div className="flex flex-col items-center justify-center">
              <BarsSpinner />
              <span className="mt-2 text-gray-500">Loading...</span>
            </div>
          </TableCell>
        </TableRow>
      );
    }

    if (salesList.length === 0) {
      return (
        <TableRow>
          <TableCell colSpan={6} className="h-32 text-center">
            <SalesEmptyState />
          </TableCell>
        </TableRow>
      );
    }

    return (
      <TableBody>
        {salesList.map((sale) => (
          <SalesTableRow key={sale.id} sale={sale} />
        ))}
      </TableBody>
    );
  };

  return (
    <div className="bg-white rounded-lg border-0 shadow-sm overflow-hidden">
      <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
        <Table className="min-w-[750px] w-full">
          <SalesTableHeader />
          <SalesTableBody />
        </Table>
      </div>
    </div>
  );
};

export default SalesTable;
