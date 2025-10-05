import React from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import {
  Table,
} from "../../../components/shared/table";
import StatusBadge from "../../../components/shared/StatusBadge";
import {
  setSortField,
  toggleItemSelection,
  toggleSelectAll,
  setSearchTerm,
  setCurrentPage,
} from "../../../store/slices/customerSlice";
import CustomerTableHeader from "./CustomerTableHeader";
import CustomerTableBody from "./CustomerTableBody";

const CustomerTable = () => {
  const dispatch = useDispatch();
  const {
    items,
    loading,
    searchTerm,
    sortField,
    sortOrder,
    selectedItems,
    selectAll,
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage,
  } = useSelector((state) => state.customer);

  // Handle sorting
  const handleSort = (field) => {
    dispatch(setSortField(field));
  };

  // Get sort icon
  const getSortIcon = (field) => {
    if (sortField !== field) return null;
    return sortOrder === "asc" ? (
      <ChevronUp size={16} />
    ) : (
      <ChevronDown size={16} />
    );
  };

  // Handle pagination
  const handlePageChange = (page) => {
    console.log('Changing page to:', page);
    dispatch(setCurrentPage(page));
  };

  // Debug pagination state
  console.log('Pagination state:', {
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage,
    itemsLength: items.length
  });

  // Render status badge based on customer completeness
  const getStatusBadge = (customer) => {
    const hasEmail = customer.email && customer.email.trim() !== "";
    const hasPhone = customer.phone && customer.phone.trim() !== "";
    const hasAddress = customer.address && customer.address.trim() !== "";
    
    if (hasEmail && hasPhone && hasAddress) {
      return <StatusBadge variant="success">Complete</StatusBadge>;
    } else if (hasEmail && (hasPhone || hasAddress)) {
      return <StatusBadge variant="warning">Partial</StatusBadge>;
    } else {
      return <StatusBadge variant="danger">Incomplete</StatusBadge>;
    }
  };

  return (
    <div className="bg-white rounded-lg border-0 shadow-sm overflow-x-auto">
      <Table>
        <CustomerTableHeader
          selectAll={selectAll}
          onToggleSelectAll={() => dispatch(toggleSelectAll())}
          onSort={handleSort}
          getSortIcon={getSortIcon}
        />
        <CustomerTableBody
          loading={loading}
          items={items}
          selectedItems={selectedItems}
          onToggleItemSelection={(id) => dispatch(toggleItemSelection(id))}
          getStatusBadge={getStatusBadge}
          searchTerm={searchTerm}
          onClearSearch={() => dispatch(setSearchTerm(""))}
        />
      </Table>
    </div>
  );
};

export default CustomerTable;
