import React from "react";
import { TableHead, TableHeader, TableRow } from "../../../components/shared/table";

const ProductTableHeader = ({
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
          className="cursor-pointer hover:bg-gray-100 min-w-[200px] pl-2"
          onClick={() => onSort("name")}
        >
          <div className="flex items-center gap-1">
            Product Name
            {getSortIcon("name")}
          </div>
        </TableHead>
        <TableHead
          className="cursor-pointer hover:bg-gray-100 min-w-[120px]"
          onClick={() => onSort("category.name")}
        >
          <div className="flex items-center gap-1">
            Category
            {getSortIcon("category.name")}
          </div>
        </TableHead>
        <TableHead
          className="cursor-pointer hover:bg-gray-100 min-w-[80px]"
          onClick={() => onSort("price")}
        >
          <div className="flex items-center gap-1">
            Price
            {getSortIcon("price")}
          </div>
        </TableHead>
        <TableHead
          className="cursor-pointer hover:bg-gray-100 min-w-[80px]"
          onClick={() => onSort("cost")}
        >
          <div className="flex items-center gap-1">
            Cost
            {getSortIcon("cost")}
          </div>
        </TableHead>
        <TableHead
          className="cursor-pointer hover:bg-gray-100 min-w-[80px]"
          onClick={() => onSort("quantity")}
        >
          <div className="flex items-center gap-1">
            <span className="hidden sm:inline">Quantity</span>
            <span className="sm:hidden">Qty</span>
            {getSortIcon("quantity")}
          </div>
        </TableHead>
        <TableHead className="min-w-[80px]">
          <div className="flex items-center gap-1">
            Status
          </div>
        </TableHead>
      </TableRow>
    </TableHeader>
  );
};

export default ProductTableHeader;
