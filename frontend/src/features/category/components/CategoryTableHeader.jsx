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
        <TableHead className="min-w-[200px] pl-2">
          <div className="flex items-center gap-1">
            Category Name
          </div>
        </TableHead>
        <TableHead className="min-w-[150px]">
          <div className="flex items-center gap-1">
            Description
          </div>
        </TableHead>
        <TableHead className="min-w-[100px]">
          <div className="flex items-center gap-1">
            Created At
          </div>
        </TableHead>
        <TableHead className="min-w-[100px]">
          <div className="flex items-center gap-1">
            Updated At
          </div>
        </TableHead>
        <TableHead className="min-w-[80px]">Actions</TableHead>
      </TableRow>
    </TableHeader>
  );
};

export default CategoryTableHeader;
