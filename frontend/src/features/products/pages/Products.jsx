// src/features/products/pages/Products.jsx
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Plus,
  Search,
  Edit,
  Trash,
  Package,
  AlertCircle,
  Download,
  Upload,
  ChevronUp,
  ChevronDown,
  Filter,
  MoreHorizontal,
} from "lucide-react";
import {
  fetchProducts,
  deleteProduct,
  setSearchTerm,
  openProductModal,
  closeProductModal,
  openCSVImportModal,
  closeCSVImportModal,
  setSortField,
  toggleItemSelection,
  toggleSelectAll,
} from "../../../store/slices/productSlice";
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
import Badge from "../../../components/shared/Badge";
import NewProductModal from "../modals/NewProductModal";
import CSVImportModal from "../modals/CSVImportModal";
import ProductFilters from "../components/ProductFilters";
import BulkActions from "../../../components/shared/BulkActions";
import ActionMenu from "../../../components/shared/ActionMenu";
import LoadingContainer from "../../../components/shared/LoadingContainer";
import Pagination from "../../../components/shared/Pagination";
import LoadingOverlay from "../../../components/shared/LoadingOverlay";
import {
  exportProductsToCSV,
  validateProductCSV,
} from "../../../utils/csvUtils";

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
    isProductModalOpen,
    isCSVImportModalOpen,
    editingProduct,
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
    filters,
  ]);

  // Handle product deletion
  const handleDelete = (productId) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      dispatch(deleteProduct(productId));
    }
  };

  // Handle search with debounce
  const handleSearch = (e) => {
    dispatch(setSearchTerm(e.target.value));
  };

  // Handle CSV export
  const handleExportCSV = () => {
    exportProductsToCSV(filteredItems);
  };

  // Handle bulk export
  const handleBulkExport = (items) => {
    const productsToExport =
      items.length > 0
        ? filteredItems.filter((product) => items.includes(product.id))
        : filteredItems;
    exportProductsToCSV(productsToExport);
  };

  // Handle bulk import
  const handleBulkImport = async (data) => {
    const validation = validateProductCSV(data);
    if (!validation.isValid) {
      alert(`Import failed: ${validation.errors.join(", ")}`);
      return;
    }
    console.log("Importing products:", data);
    // dispatch(importProducts(data));
  };

  // Handle bulk delete
  const handleBulkDelete = (items) => {
    if (
      window.confirm(
        `Are you sure you want to delete ${items.length} selected product(s)?`
      )
    ) {
      items.forEach((id) => dispatch(deleteProduct(id)));
    }
  };

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

  return (
    <div className="space-y-6 bg-white text-gray-900 dark:bg-background dark:text-text min-h-screen p-4 sm:p-6">
      {/* Header and Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Products
        </h1>
        <div className="flex flex-col sm:flex-row gap-2">
          <ProductFilters />
          <Button
            variant="outline"
            size="sm"
            icon={<Download size={16} />}
            onClick={handleExportCSV}
          >
            Export CSV
          </Button>
          <Button
            variant="outline"
            size="sm"
            icon={<Upload size={16} />}
            onClick={() => dispatch(openCSVImportModal())}
          >
            Import CSV
          </Button>
          <Button
            variant="primary"
            size="sm"
            icon={<Plus size={16} />}
            onClick={() => dispatch(openProductModal())}
          >
            Add Product
          </Button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md flex items-center gap-2">
          <AlertCircle size={16} />
          {error}
        </div>
      )}

      {/* Bulk Actions */}
      <BulkActions
        selectedItems={selectedItems}
        onDelete={handleBulkDelete}
        onExport={handleBulkExport}
        onImport={handleBulkImport}
        importConfig={{
          description:
            "Import products from a CSV file. The file should contain columns for Name, Description, SKU, Barcode, Price, Cost, Quantity, Min Stock, Max Stock, and Category.",
          requiredFields: ["Name", "Price"],
          validate: validateProductCSV,
        }}
        showImport={true}
        showExport={true}
        showDelete={true}
      />

      {/* Search */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Input
            placeholder="Search products..."
            icon={<Search size={18} className="text-gray-400" />}
            value={searchTerm}
            onChange={handleSearch}
            className="w-full"
          />
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-x-auto dark:bg-background-secondary dark:border-background-secondary">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <input
                  type="checkbox"
                  checked={selectAll}
                  onChange={() => dispatch(toggleSelectAll())}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
              </TableHead>
              <TableHead
                className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700"
                onClick={() => handleSort("name")}
              >
                <div className="flex items-center gap-1">
                  Product
                  {getSortIcon("name")}
                </div>
              </TableHead>
              <TableHead
                className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 hidden md:table-cell"
                onClick={() => handleSort("category.name")}
              >
                <div className="flex items-center gap-1">
                  Category
                  {getSortIcon("category.name")}
                </div>
              </TableHead>
              <TableHead
                className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700"
                onClick={() => handleSort("price")}
              >
                <div className="flex items-center gap-1">
                  Price
                  {getSortIcon("price")}
                </div>
              </TableHead>
              <TableHead
                className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 hidden lg:table-cell"
                onClick={() => handleSort("cost")}
              >
                <div className="flex items-center gap-1">
                  Cost
                  {getSortIcon("cost")}
                </div>
              </TableHead>
              <TableHead
                className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700"
                onClick={() => handleSort("quantity")}
              >
                <div className="flex items-center gap-1">
                  Quantity
                  {getSortIcon("quantity")}
                </div>
              </TableHead>
              <TableHead className="hidden sm:table-cell">Status</TableHead>
              <TableHead className="text-right w-16">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading && items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  <LoadingContainer />
                </TableCell>
              </TableRow>
            ) : filteredItems.length > 0 ? (
              filteredItems.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>
                    <input
                      type="checkbox"
                      checked={selectedItems.includes(product.id)}
                      onChange={() => dispatch(toggleItemSelection(product.id))}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </TableCell>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-3">
                      {product.image_url && (
                        <img
                          src={product.image_url}
                          alt={product.name}
                          className="h-10 w-10 rounded-md object-cover"
                        />
                      )}
                      <div>
                        <div className="font-medium">{product.name}</div>
                        {product.sku && (
                          <div className="text-sm text-gray-500">
                            SKU: {product.sku}
                          </div>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {product.category?.name || "Uncategorized"}
                  </TableCell>
                  <TableCell>${product.price?.toFixed(2) || "0.00"}</TableCell>
                  <TableCell className="hidden lg:table-cell">
                    ${product.cost?.toFixed(2) || "0.00"}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span>{product.quantity}</span>
                      {product.quantity <= (product.minStock || 10) && (
                        <AlertCircle size={14} className="text-yellow-500" />
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    {getStatusBadge(product.quantity, product.minStock)}
                  </TableCell>
                  <TableCell className="text-right whitespace-nowrap">
                    <ActionMenu
                      actions={getActionMenu(product)}
                      item={product}
                      className="flex justify-end"
                    />
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  <div className="flex flex-col items-center gap-2 text-gray-500">
                    <Package size={40} className="text-gray-300" />
                    <p>No products found</p>
                    {searchTerm && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => dispatch(setSearchTerm(""))}
                      >
                        Clear search
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center">
          <Pagination />
        </div>
      )}

      {/* Product Modal */}
      {isProductModalOpen && (
        <NewProductModal
          product={editingProduct}
          onClose={() => dispatch(closeProductModal())}
        />
      )}

      {/* CSV Import Modal */}
      {isCSVImportModalOpen && (
        <CSVImportModal
          isOpen={isCSVImportModalOpen}
          onClose={() => dispatch(closeCSVImportModal())}
        />
      )}
    </div>
  );
};

export default ProductsPage;
