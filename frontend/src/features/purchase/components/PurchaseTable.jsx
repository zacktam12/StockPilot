import React from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import {
  Table,
} from "../../../components/shared/table";
import {
  setSortField,
  toggleItemSelection,
  toggleSelectAll,
  setSearchTerm,
  setCurrentPage,
} from "../../../store/slices/purchaseSlice";
import PurchaseTableHeader from "./PurchaseTableHeader";
import PurchaseTableBody from "./PurchaseTableBody";

const PurchaseTable = ({ filteredItems }) => {
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
  } = useSelector((state) => state.purchases || {});

  // Ensure filteredItems is always an array
  const safeFilteredItems = Array.isArray(filteredItems) ? filteredItems : [];

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
    dispatch(setCurrentPage(page));
  };

  // Debug pagination state
  return (
    <div className="bg-white rounded-lg border-0 shadow-sm overflow-hidden">
      <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
        <Table className="min-w-[900px] w-full">
          <PurchaseTableHeader
            selectAll={selectAll}
            onToggleSelectAll={() => dispatch(toggleSelectAll())}
            onSort={handleSort}
            getSortIcon={getSortIcon}
          />
          <PurchaseTableBody
            loading={loading}
            items={items}
            filteredItems={safeFilteredItems}
            selectedItems={selectedItems}
            onToggleItemSelection={(id) => dispatch(toggleItemSelection(id))}
            searchTerm={searchTerm}
            onClearSearch={() => dispatch(setSearchTerm(""))}
          />
        </Table>
      </div>
    </div>
  );
};

export default PurchaseTable;
