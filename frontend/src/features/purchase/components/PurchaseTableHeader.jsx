import React from "react";
import { TableHead, TableHeader, TableRow } from "../../../components/shared/table";

const PurchaseTableHeader = ({
  selectAll,
  onToggleSelectAll,
  onSort,
  getSortIcon,
}) => {
  return (
    <TableHeader>
      <TableRow>
        <TableHead className="w-8 pr-2">
          <input
            type="checkbox"
            checked={selectAll}
            onChange={onToggleSelectAll}
            className="rounded-none border-gray-300 text-blue-600 focus:ring-gray-400"
          />
        </TableHead>
        <TableHead
          className="cursor-pointer hover:bg-gray-100 min-w-[150px] pl-2"
          onClick={() => onSort("poNumber")}
        >
          <div className="flex items-center gap-1">
            Purchase Order
            {getSortIcon("poNumber")}
          </div>
        </TableHead>
        <TableHead className="min-w-[150px]">
          Purchased By
        </TableHead>
        <TableHead
          className="cursor-pointer hover:bg-gray-100 min-w-[150px]"
          onClick={() => onSort("supplierName")}
        >
          <div className="flex items-center gap-1">
            Supplier
            {getSortIcon("supplierName")}
          </div>
        </TableHead>
        <TableHead className="min-w-[100px] text-center">
          Items
        </TableHead>
        <TableHead
          className="cursor-pointer hover:bg-gray-100 min-w-[120px]"
          onClick={() => onSort("totalCost")}
        >
          <div className="flex items-center gap-1">
            Total Amount
            {getSortIcon("totalCost")}
          </div>
        </TableHead>
        <TableHead
          className="cursor-pointer hover:bg-gray-100 min-w-[100px]"
          onClick={() => onSort("status")}
        >
          <div className="flex items-center gap-1">
            Status
            {getSortIcon("status")}
          </div>
        </TableHead>
      </TableRow>
    </TableHeader>
  );
};

export default PurchaseTableHeader;
