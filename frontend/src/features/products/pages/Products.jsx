// src/features/products/pages/Products.jsx
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchProducts, setSearchTerm } from "../../../store/slices/productSlice";
import ProductHeader from "../components/ProductHeader";
import ProductSearch from "../components/ProductSearch";
import ProductTable from "../components/ProductTable";
import ProductActions from "../components/ProductActions";
import ProductErrorState from "../components/ProductErrorState";
import Pagination from "../../../components/shared/Pagination";
import { exportProductsToCSV } from "../../../utils/csvUtils";

const ProductsPage = () => {
  const dispatch = useDispatch();
  const {
    items,
    filteredItems,
    loading,
    error,
    currentPage,
    itemsPerPage,
    totalPages,
    searchTerm,
    sortField,
    sortOrder,
    selectedItems,
    selectAll,
    filters,
  } = useSelector((state) => state.product);

  // Fetch products on mount and when search/filter changes
  useEffect(() => {
    const params = {
      page: currentPage,
      limit: itemsPerPage,
      search: searchTerm,
      sortField,
      sortOrder,
      ...filters,
    };
    dispatch(fetchProducts(params));
  }, [
    dispatch,
    currentPage,
    itemsPerPage,
    searchTerm,
    sortField,
    sortOrder,
    filters.categoryId,
    filters.status,
    filters.priceRange?.min,
    filters.priceRange?.max,
    filters.stockRange?.min,
    filters.stockRange?.max,
    filters.hasImage,
    filters.hasBarcode,
    filters.hasSku,
  ]);

  // Handle search with debounce
  const handleSearch = (e) => {
    dispatch(setSearchTerm(e.target.value));
  };

  // Handle CSV export
  const handleExportCSV = () => {
    exportProductsToCSV(filteredItems);
  };

  return (
    <div className="space-y-6 bg-white text-gray-900 dark:bg-background dark:text-text min-h-screen p-4 sm:p-6">
      {/* Header and Action Buttons */}
      <ProductHeader onExportCSV={handleExportCSV} />

      {/* Error Message */}
      <ProductErrorState error={error} />

      {/* Bulk Actions and Modals */}
      <ProductActions />

      {/* Search and Filters */}
      <ProductSearch searchTerm={searchTerm} onSearchChange={handleSearch} />

      {/* Products Table */}
      <ProductTable />

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center">
          <Pagination />
        </div>
      )}
    </div>
  );
};

export default ProductsPage;
