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
} from "../../../store/slices/productSlice";
import ProductTableHeader from "./ProductTableHeader";
import ProductTableBody from "./ProductTableBody";

const ProductTable = () => {
  const dispatch = useDispatch();
  const {
    items,
    filteredItems,
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
  } = useSelector((state) => state.product);

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
  // Render status badge based on quantity
  const getStatusBadge = (quantity, minStock = 10) => {
    if (quantity === 0) return <StatusBadge variant="danger">Out of Stock</StatusBadge>;
    if (quantity <= minStock) return <StatusBadge variant="warning">Low Stock</StatusBadge>;
    return <StatusBadge variant="success">In Stock</StatusBadge>;
  };


  return (
    <div className="bg-white rounded-lg border-0 shadow-sm overflow-hidden">
      <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
        <Table className="min-w-[800px] w-full">
          <ProductTableHeader
            selectAll={selectAll}
            onToggleSelectAll={() => dispatch(toggleSelectAll())}
            onSort={handleSort}
            getSortIcon={getSortIcon}
          />
          <ProductTableBody
            loading={loading}
            items={items}
            filteredItems={filteredItems}
            selectedItems={selectedItems}
            onToggleItemSelection={(id) => dispatch(toggleItemSelection(id))}
            getStatusBadge={getStatusBadge}
            searchTerm={searchTerm}
            onClearSearch={() => dispatch(setSearchTerm(""))}
          />
        </Table>
      </div>
    </div>
  );
};

export default ProductTable;
