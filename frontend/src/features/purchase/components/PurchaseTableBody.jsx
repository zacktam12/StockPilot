import React from "react";
import { ShoppingCart } from "lucide-react";
import { TableBody, TableCell, TableRow } from "../../../components/shared/table";
import LoadingContainer from "../../../components/shared/LoadingContainer";
import PurchaseTableRow from "./PurchaseTableRow";
import PurchaseEmptyState from "./PurchaseEmptyState";

const PurchaseTableBody = ({
  loading,
  items,
  filteredItems,
  selectedItems,
  onToggleItemSelection,
  onUpdateStatus,
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

  if (!filteredItems || !Array.isArray(filteredItems) || filteredItems.length === 0) {
    return (
      <TableBody>
        <TableRow>
          <TableCell colSpan={6} className="text-center py-8">
            <PurchaseEmptyState searchTerm={searchTerm} onClearSearch={onClearSearch} />
          </TableCell>
        </TableRow>
      </TableBody>
    );
  }

  return (
    <TableBody>
      {(filteredItems || []).map((purchase) => (
        <PurchaseTableRow
          key={purchase.id}
          purchase={purchase}
          isSelected={selectedItems.includes(purchase.id)}
          onToggleSelection={onToggleItemSelection}
          onUpdateStatus={onUpdateStatus}
        />
      ))}
    </TableBody>
  );
};

export default PurchaseTableBody;
