import React from "react";
import { TableHead, TableHeader, TableRow } from "../../../components/shared/table";

const SuppliersTableHeader = ({
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
            Supplier Name
            {getSortIcon("name")}
          </div>
        </TableHead>
        <TableHead
          className="cursor-pointer hover:bg-gray-100 min-w-[150px]"
          onClick={() => onSort("address")}
        >
          <div className="flex items-center gap-1">
            Address
            {getSortIcon("address")}
          </div>
        </TableHead>
        <TableHead
          className="cursor-pointer hover:bg-gray-100 min-w-[150px]"
          onClick={() => onSort("email")}
        >
          <div className="flex items-center gap-1">
            Email
            {getSortIcon("email")}
          </div>
        </TableHead>
        <TableHead
          className="cursor-pointer hover:bg-gray-100 min-w-[120px]"
          onClick={() => onSort("phone")}
        >
          <div className="flex items-center gap-1">
            Phone
            {getSortIcon("phone")}
          </div>
        </TableHead>
        <TableHead
          className="cursor-pointer hover:bg-gray-100 min-w-[130px]"
          onClick={() => onSort("contactName")}
        >
          <div className="flex items-center gap-1">
            Contact Name
            {getSortIcon("contactName")}
          </div>
        </TableHead>
      </TableRow>
    </TableHeader>
  );
};

export default SuppliersTableHeader;
