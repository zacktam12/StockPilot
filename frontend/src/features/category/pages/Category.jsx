import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchCategories, setSearchTerm } from "../../../store/slices/categorySlice";
import CategoryHeader from "../components/CategoryHeader";
import CategoryStats from "../components/CategoryStats";
import CategoryTable from "../components/CategoryTable";
import CategoryErrorState from "../components/CategoryErrorState";
import CategoryActions from "../components/CategoryActions";
import LoadingOverlay from "../../../components/shared/LoadingOverlay";
import UnifiedPagination from "../../../components/shared/UnifiedPagination";
import { exportCategoriesToCSV } from "../../../utils/csvUtils";

const CategoryPage = () => {
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
    selectedItems,
    selectAll,
    filters,
  } = useSelector((state) => state.category);

  // Fetch categories on mount and when search/filter changes
  useEffect(() => {
    const params = {
      page: currentPage,
      limit: itemsPerPage,
      search: searchTerm,
      ...filters,
    };
    dispatch(fetchCategories(params));
  }, [
    dispatch,
    currentPage,
    itemsPerPage,
    searchTerm,
    filters.hasDescription,
    filters.dateRange?.from,
    filters.dateRange?.to,
  ]);

  // Handle search
  const handleSearch = (e) => {
    dispatch(setSearchTerm(e.target.value));
  };

  // Handle CSV export
  const handleExportCSV = (categories = filteredItems) => {
    exportCategoriesToCSV(categories);
  };

  if (loading && (!filteredItems || filteredItems.length === 0) && !error) {
    return <LoadingOverlay />;
  }

  return (
    <div className="space-y-8 bg-white text-gray-900 dark:bg-background dark:text-text min-h-screen p-4 sm:p-6">
      {/* Header */}
      <CategoryHeader 
        onExportCSV={handleExportCSV}
        searchTerm={searchTerm}
        onSearchChange={handleSearch}
      />

      {/* Error Message */}
      <CategoryErrorState error={error} />

      {/* Category Statistics Cards */}
      <CategoryStats />

      {/* Categories Table */}
      <div className="mt-15">
        <CategoryTable />
      </div>

      {/* Pagination */}
      <UnifiedPagination
        sliceName="category"
        showPageSizeSelector={true}
        showItemCount={true}
        pageSizeOptions={[5, 10, 25, 50, 100]}
      />

      {/* Category Actions and Drawer */}
      <CategoryActions />
    </div>
  );
};

export default CategoryPage;
