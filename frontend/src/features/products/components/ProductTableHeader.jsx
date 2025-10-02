import React from "react";
import { TableHead, TableHeader, TableRow } from "../../../components/shared/Table";

const ProductTableHeader = ({
  selectAll,
  onToggleSelectAll,
  onSort,
  getSortIcon,
}) => {
  return (
    <TableHeader>
      <TableRow>
        <TableHead className="w-12">
          <input
            type="checkbox"
            checked={selectAll}
            onChange={onToggleSelectAll}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
        </TableHead>
        <TableHead
          className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700"
          onClick={() => onSort("name")}
        >
          <div className="flex items-center gap-1">
            Product
            {getSortIcon("name")}
          </div>
        </TableHead>
        <TableHead
          className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 hidden md:table-cell"
          onClick={() => onSort("category.name")}
        >
          <div className="flex items-center gap-1">
            Category
            {getSortIcon("category.name")}
          </div>
        </TableHead>
        <TableHead
          className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700"
          onClick={() => onSort("price")}
        >
          <div className="flex items-center gap-1">
            Price
            {getSortIcon("price")}
          </div>
        </TableHead>
        <TableHead
          className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 hidden lg:table-cell"
          onClick={() => onSort("cost")}
        >
          <div className="flex items-center gap-1">
            Cost
            {getSortIcon("cost")}
          </div>
        </TableHead>
        <TableHead
          className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700"
          onClick={() => onSort("quantity")}
        >
          <div className="flex items-center gap-1">
            Quantity
            {getSortIcon("quantity")}
          </div>
        </TableHead>
        <TableHead className="hidden sm:table-cell">Status</TableHead>
        <TableHead className="text-right w-16">Actions</TableHead>
      </TableRow>
    </TableHeader>
  );
};

export default ProductTableHeader;
