import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Plus,
  Search,
  Filter,
  ArrowUpDown,
  Edit,
  Trash,
  Tag,
  AlertCircle,
} from "lucide-react";
import {
  fetchCategories,
  deleteCategory,
  setSearchTerm,
  setSortField,
  setFilterOptions,
  openCategoryModal,
} from "../../../store/slices/categorySlice";
import Button from "../../../components/shared/Button";
import Input from "../../../components/shared/Input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../components/shared/Table";
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
    sortField,
    filterOptions,
  } = useSelector((state) => state.category);

  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [showSortMenu, setShowSortMenu] = useState(false);

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  const handleDelete = (categoryId) => {
    if (window.confirm("Are you sure you want to delete this category?")) {
      dispatch(deleteCategory(categoryId));
    }
  };

  const handleSort = (field) => {
    dispatch(setSortField(field));
    setShowSortMenu(false);
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredItems.slice(indexOfFirstItem, indexOfLastItem);

  if (loading && filteredItems.length === 0 && !error) {
    return <LoadingOverlay />;
  }

  return (
    <div className="space-y-6 min-h-screen bg-white text-gray-900 dark:bg-background dark:text-text">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Categories
        </h1>
        <Button
          variant="primary"
          size="md"
          icon={<Plus size={16} />}
          onClick={() => dispatch(openCategoryModal())}
        >
          Add New Category
        </Button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md flex items-center gap-2">
          <AlertCircle size={16} />
          {error}
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Input
            placeholder="Search categories..."
            icon={<Search size={18} className="text-gray-400" />}
            value={searchTerm}
            onChange={(e) => dispatch(setSearchTerm(e.target.value))}
            className="w-full"
          />
        </div>

        <div className="relative">
          <Button
            variant="outline"
            icon={<Filter size={16} />}
            onClick={() => setShowFilterMenu(!showFilterMenu)}
          >
            Filter
          </Button>
          {showFilterMenu && (
            <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-4 z-50">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={filterOptions?.hasDescription || false}
                  onChange={(e) =>
                    dispatch(
                      setFilterOptions({
                        hasDescription: e.target.checked,
                      })
                    )
                  }
                  className="rounded border-gray-300 dark:border-gray-600"
                />
                <span className="text-sm text-gray-700 dark:text-gray-200">
                  Has Description
                </span>
              </label>
            </div>
          )}
        </div>

        <div className="relative">
          <Button
            variant="outline"
            icon={<ArrowUpDown size={16} />}
            onClick={() => setShowSortMenu(!showSortMenu)}
          >
            Sort
          </Button>
          {showSortMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden z-50">
              <button
                className="w-full px-4 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center justify-between text-gray-700 dark:text-gray-200"
                onClick={() => handleSort("name")}
              >
                <span>Name</span>
                {sortField === "name" && (
                  <Check
                    size={16}
                    className="text-indigo-600 dark:text-indigo-400"
                  />
                )}
              </button>
              <button
                className="w-full px-4 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center justify-between text-gray-700 dark:text-gray-200"
                onClick={() => handleSort("created_at")}
              >
                <span>Created Date</span>
                {sortField === "created_at" && (
                  <Check
                    size={16}
                    className="text-indigo-600 dark:text-indigo-400"
                  />
                )}
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden dark:bg-background-secondary dark:border-background-secondary">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Category</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Created At</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentItems.length > 0 ? (
              currentItems.map((category) => (
                <TableRow key={category.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-md bg-indigo-100 text-indigo-600 flex items-center justify-center">
                        <Tag size={16} />
                      </div>
                      <span className="font-medium text-gray-900">
                        {category.name}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>{category.description || "-"}</TableCell>
                  <TableCell>
                    {new Date(category.created_at).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        icon={<Edit size={16} />}
                        onClick={() => dispatch(openCategoryModal(category))}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        icon={<Trash size={16} />}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={() => handleDelete(category.id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="h-32 text-center">
                  <div className="flex flex-col items-center justify-center text-gray-500">
                    <Tag size={28} className="mb-2" />
                    <h3 className="text-lg font-medium">No categories found</h3>
                    <p className="text-sm">
                      Try adjusting your search or filters
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <NewCategoryModal />
    </div>
  );
};

export default CategoryPage;
