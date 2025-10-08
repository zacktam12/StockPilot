import React from "react";
import { TableBody, TableCell, TableRow } from "../../../components/shared/table";
import LoadingContainer from "../../../components/shared/LoadingContainer";
import SuppliersTableRow from "./SuppliersTableRow";
import SuppliersEmptyState from "./SuppliersEmptyState";

const SuppliersTableBody = ({
  loading,
  items,
  selectedItems,
  onToggleItemSelection,
  searchTerm,
  onClearSearch,
}) => {
  if (loading && items.length === 0) {
    return (
      <TableBody>
        <TableRow>
          <TableCell colSpan={6} className="text-center py-8">
            <LoadingContainer />
          </TableCell>
        </TableRow>
      </TableBody>
    );
  }

  if (items.length === 0) {
    return (
      <TableBody>
        <TableRow>
          <TableCell colSpan={6} className="text-center py-8">
            <SuppliersEmptyState searchTerm={searchTerm} onClearSearch={onClearSearch} />
          </TableCell>
        </TableRow>
      </TableBody>
    );
  }

  return (
    <TableBody>
      {items.map((supplier) => (
        <SuppliersTableRow
          key={supplier.id}
          supplier={supplier}
          isSelected={selectedItems.includes(supplier.id)}
          onToggleSelection={onToggleItemSelection}
        />
      ))}
    </TableBody>
  );
};

export default SuppliersTableBody;
