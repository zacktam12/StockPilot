import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchCategories, setSearchTerm } from "../../../store/slices/categorySlice";
import CategoryHeader from "../components/CategoryHeader";
import CategorySearch from "../components/CategorySearch";
import CategoryFilters from "../components/CategoryFilters";
import CategorySort from "../components/CategorySort";
import CategoryTable from "../components/CategoryTable";
import CategoryErrorState from "../components/CategoryErrorState";
import NewCategoryModal from "../modals/NewCategoryModal";
import LoadingOverlay from "../../../components/shared/LoadingOverlay";

const CategoryPage = () => {
  const dispatch = useDispatch();
  const {
    filteredItems,
    loading,
    error,
    currentPage,
    itemsPerPage,
    searchTerm,
  } = useSelector((state) => state.category);

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  // Handle search
  const handleSearch = (e) => {
    dispatch(setSearchTerm(e.target.value));
  };

  // Calculate pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = (filteredItems || []).slice(indexOfFirstItem, indexOfLastItem);

  if (loading && (!filteredItems || filteredItems.length === 0) && !error) {
    return <LoadingOverlay />;
  }

  return (
    <div className="space-y-6 min-h-screen bg-white text-gray-900 dark:bg-background dark:text-text">
      {/* Header */}
      <CategoryHeader />

      {/* Error Message */}
      <CategoryErrorState error={error} />

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <CategorySearch searchTerm={searchTerm} onSearchChange={handleSearch} />
        <CategoryFilters />
        <CategorySort />
      </div>

      {/* Categories Table */}
      <CategoryTable currentItems={currentItems} />

      {/* Category Modal */}
      <NewCategoryModal />
    </div>
  );
};

export default CategoryPage;
