import React from "react";
import { TableHead, TableHeader, TableRow } from "../../../components/shared/table";

const CategoryTableHeader = ({
  selectAll,
  onToggleSelectAll,
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
        <TableHead className="flex-[2] pl-2">
          Category Name
        </TableHead>
        <TableHead className="hidden md:table-cell flex-1">
          Description
        </TableHead>
        <TableHead className="hidden lg:table-cell flex-1">
          Created At
        </TableHead>
        <TableHead className="hidden lg:table-cell flex-1">
          Updated At
        </TableHead>
        <TableHead className="w-24">Actions</TableHead>
      </TableRow>
    </TableHeader>
  );
};

export default CategoryTableHeader;
