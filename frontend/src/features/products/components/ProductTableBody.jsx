import React from "react";
import { AlertCircle } from "lucide-react";
import { TableBody, TableCell, TableRow } from "../../../components/shared/Table";
import LoadingContainer from "../../../components/shared/LoadingContainer";
import ProductTableRow from "./ProductTableRow";
import ProductEmptyState from "./ProductEmptyState";

const ProductTableBody = ({
  loading,
  items,
  filteredItems,
  selectedItems,
  onToggleItemSelection,
  getStatusBadge,
  getActionMenu,
  searchTerm,
  onClearSearch,
}) => {
  if (loading && items.length === 0) {
    return (
      <TableBody>
        <TableRow>
          <TableCell colSpan={7} className="text-center py-8">
            <LoadingContainer />
          </TableCell>
        </TableRow>
      </TableBody>
    );
  }

  if (filteredItems.length === 0) {
    return (
      <TableBody>
        <TableRow>
          <TableCell colSpan={7} className="text-center py-8">
            <ProductEmptyState searchTerm={searchTerm} onClearSearch={onClearSearch} />
          </TableCell>
        </TableRow>
      </TableBody>
    );
  }

  return (
    <TableBody>
      {filteredItems.map((product) => (
        <ProductTableRow
          key={product.id}
          product={product}
          isSelected={selectedItems.includes(product.id)}
          onToggleSelection={onToggleItemSelection}
          getStatusBadge={getStatusBadge}
          getActionMenu={getActionMenu}
        />
      ))}
    </TableBody>
  );
};

export default ProductTableBody;
