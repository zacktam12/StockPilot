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
} from "../../../store/slices/supplierSlice";
import SuppliersTableHeader from "./SuppliersTableHeader";
import SuppliersTableBody from "./SuppliersTableBody";

const SuppliersTable = ({ 
  items, 
  selectedItems, 
  onSelectAll, 
  onSelectItem, 
  loading, 
  searchTerm,
  onClearSearch,
}) => {
  const dispatch = useDispatch();
  const {
    sortField,
    sortOrder,
    selectAll,
  } = useSelector((state) => state.supplier);

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

  return (
    <div className="bg-white rounded-lg border-0 shadow-sm overflow-hidden">
      <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
        <Table className="min-w-[750px] w-full">
          <SuppliersTableHeader
            selectAll={selectAll}
            onToggleSelectAll={onSelectAll}
            onSort={handleSort}
            getSortIcon={getSortIcon}
          />
          <SuppliersTableBody
            loading={loading}
            items={items}
            selectedItems={selectedItems}
            onToggleItemSelection={onSelectItem}
            searchTerm={searchTerm}
            onClearSearch={onClearSearch}
          />
        </Table>
      </div>
    </div>
  );
};

export default SuppliersTable;
