import React from "react";
import { TableBody, TableCell, TableRow } from "../../../components/shared/table";
import LoadingContainer from "../../../components/shared/LoadingContainer";
import CategoryTableRow from "./CategoryTableRow";
import CategoryEmptyState from "./CategoryEmptyState";

const CategoryTableBody = ({
  loading,
  items,
  filteredItems,
  selectedItems = [],
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

  if (filteredItems.length === 0) {
    return (
      <TableBody>
        <TableRow>
          <TableCell colSpan={6} className="text-center py-8">
            <CategoryEmptyState searchTerm={searchTerm} onClearSearch={onClearSearch} />
          </TableCell>
        </TableRow>
      </TableBody>
    );
  }

  return (
    <TableBody>
      {filteredItems.map((category) => (
        <CategoryTableRow
          key={category.id}
          category={category}
          isSelected={selectedItems?.includes(category.id) || false}
          onToggleSelection={onToggleItemSelection}
        />
      ))}
    </TableBody>
  );
};

export default CategoryTableBody;
