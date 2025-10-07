import React from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Table,
} from "../../../components/shared/table";
import {
  toggleItemSelection,
  toggleSelectAll,
  setSearchTerm,
  setCurrentPage,
} from "../../../store/slices/categorySlice";
import CategoryTableHeader from "./CategoryTableHeader";
import CategoryTableBody from "./CategoryTableBody";

const CategoryTable = () => {
  const dispatch = useDispatch();
  const {
    items = [],
    filteredItems = [],
    loading = false,
    searchTerm = "",
    selectedItems = [],
    selectAll = false,
    currentPage = 1,
    totalPages = 1,
    totalItems = 0,
    itemsPerPage = 5,
  } = useSelector((state) => state.category);

  // Handle pagination
  const handlePageChange = (page) => {
    dispatch(setCurrentPage(page));
  };

  // Debug pagination state
  return (
    <div className="bg-white rounded-lg border-0 shadow-sm overflow-hidden">
      <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
        <Table className="min-w-[600px] w-full">
          <CategoryTableHeader
            selectAll={selectAll}
            onToggleSelectAll={() => dispatch(toggleSelectAll())}
          />
          <CategoryTableBody
            loading={loading}
            items={items}
            filteredItems={filteredItems}
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

export default CategoryTable;
