import React from "react";
import { useNavigate } from "react-router-dom";
import { TableCell, TableRow } from "../../../components/shared/table";

const SuppliersTableRow = ({
  supplier,
  isSelected,
  onToggleSelection,
}) => {
  const navigate = useNavigate();

  const handleRowClick = (e) => {
    // Don't navigate if clicking on checkbox
    if (e.target.type === 'checkbox') {
      return;
    }
    
    navigate(`/suppliers/${supplier.id}`);
  };

  return (
    <TableRow 
      onClick={handleRowClick}
      className="border-b border-gray-200 hover:bg-gray-50 cursor-pointer bg-white even:bg-gray-50"
    >
      <TableCell className="w-8 pr-2">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={() => onToggleSelection(supplier.id)}
          className="rounded-none border-gray-300 text-blue-600 focus:ring-gray-400"
        />
      </TableCell>
      <TableCell className="min-w-[200px] pl-2 font-medium">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center flex-shrink-0">
            <span className="text-white font-semibold text-sm">
              {supplier.name?.charAt(0)?.toUpperCase() || "S"}
            </span>
          </div>
          <div className="min-w-0 flex-1">
            <div className="font-medium text-gray-900 truncate">{supplier.name}</div>
          </div>
        </div>
      </TableCell>
      <TableCell className="min-w-[150px] text-gray-900">
        <span className="truncate block" title={supplier.address}>
          {supplier.address || "-"}
        </span>
      </TableCell>
      <TableCell className="min-w-[150px] text-gray-900">
        <span className="truncate block">{supplier.email || "-"}</span>
      </TableCell>
      <TableCell className="min-w-[120px] text-gray-900">
        <span className="truncate block">{supplier.phone || "-"}</span>
      </TableCell>
      <TableCell className="min-w-[130px] text-gray-900">
        <span className="truncate block">{supplier.contactName || "-"}</span>
      </TableCell>
    </TableRow>
  );
};

export default SuppliersTableRow;
