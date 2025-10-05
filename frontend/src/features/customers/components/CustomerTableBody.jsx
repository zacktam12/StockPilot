import React from "react";
import { TableBody, TableCell, TableRow } from "../../../components/shared/table";
import LoadingContainer from "../../../components/shared/LoadingContainer";
import CustomerTableRow from "./CustomerTableRow";
import CustomerEmptyState from "./CustomerEmptyState";

const CustomerTableBody = ({
  loading,
  items,
  selectedItems,
  onToggleItemSelection,
  getStatusBadge,
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
            <CustomerEmptyState searchTerm={searchTerm} onClearSearch={onClearSearch} />
          </TableCell>
        </TableRow>
      </TableBody>
    );
  }

  return (
    <TableBody>
      {items.map((customer) => (
        <CustomerTableRow
          key={customer.id}
          customer={customer}
          isSelected={selectedItems?.includes(customer.id) || false}
          onToggleSelection={onToggleItemSelection}
          getStatusBadge={getStatusBadge}
        />
      ))}
    </TableBody>
  );
};

export default CustomerTableBody;
