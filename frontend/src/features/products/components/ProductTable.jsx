import React from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  ChevronUp,
  ChevronDown,
  Edit,
  Trash,
} from "lucide-react";
import {
  Table,
} from "../../../components/shared/Table";
import Badge from "../../../components/shared/Badge";
import Pagination from "../../../components/shared/Pagination";
import {
  setSortField,
  toggleItemSelection,
  toggleSelectAll,
  setSearchTerm,
  openProductModal,
  deleteProduct,
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

  // Render status badge based on quantity
  const getStatusBadge = (quantity, minStock = 10) => {
    if (quantity === 0) return <Badge variant="danger">Out of Stock</Badge>;
    if (quantity <= minStock) return <Badge variant="warning">Low Stock</Badge>;
    return <Badge variant="success">In Stock</Badge>;
  };

  // Action menu configuration
  const getActionMenu = (product) => [
    {
      label: "Edit",
      icon: <Edit size={16} />,
      onClick: () => dispatch(openProductModal(product)),
    },
    {
      label: "Delete",
      icon: <Trash size={16} />,
      onClick: () => handleDelete(product.id),
      className: "text-red-600 hover:text-red-700 hover:bg-red-50",
    },
  ];

  // Handle product deletion
  const handleDelete = (productId) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      dispatch(deleteProduct(productId));
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-x-auto dark:bg-background-secondary dark:border-background-secondary">
      <Table>
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
          getActionMenu={getActionMenu}
          searchTerm={searchTerm}
          onClearSearch={() => dispatch(setSearchTerm(""))}
        />
      </Table>
    </div>
  );
};

export default ProductTable;
