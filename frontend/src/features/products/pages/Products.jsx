// src/features/products/pages/Products.jsx
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Plus, Search, Edit, Trash, Package, AlertCircle } from "lucide-react";
import {
  fetchProducts,
  deleteProduct,
  setSearchTerm,
  setCurrentPage,
  openProductModal,
  closeProductModal,
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
import NewProductModal from "../modals/NewProductModal"; // Renamed from NewProductModal
import Spinner from "../../../components/shared/Spinner";
import LoadingContainer from "../../../components/shared/LoadingContainer";
import Pagination from "../../../components/shared/Pagination";
import LoadingOverlay from "../../../components/shared/LoadingOverlay";

const ProductsPage = () => {
  const dispatch = useDispatch();
  const {
    items,
    filteredItems,
    loading,
    error,
    currentPage,
    itemsPerPage,
    searchTerm,
    isProductModalOpen,
    editingProduct,
  } = useSelector((state) => state.product);

  // Fetch products on mount
  useEffect(() => {
    dispatch(fetchProducts());
  }, [dispatch]);

  // Handle product deletion
  const handleDelete = (productId) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      dispatch(deleteProduct(productId));
    }
  };

  // Pagination logic
  const indexOfLastProduct = currentPage * itemsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - itemsPerPage;
  const currentProducts = filteredItems.slice(
    indexOfFirstProduct,
    indexOfLastProduct
  );
  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);

  // Calculate selling price
  const getSellingPrice = (purchasePrice) => purchasePrice * 1.5;

  // Render status badge based on quantity
  const getStatusBadge = (quantity) => {
    if (quantity === 0) return <Badge variant="danger">Out of Stock</Badge>;
    if (quantity <= 10) return <Badge variant="warning">Low Stock</Badge>;
    return <Badge variant="success">In Stock</Badge>;
  };

  // Show loader while fetching products
  if (loading && items.length === 0 && !error) {
    return <LoadingOverlay />;
  }

  return (
    <div className="space-y-6 bg-white text-gray-900 dark:bg-background dark:text-text min-h-screen">
      {/* Header and Add Product Button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Products
        </h1>
        <Button
          variant="primary"
          size="md"
          icon={<Plus size={16} />}
          onClick={() => dispatch(openProductModal())}
        >
          Add Product
        </Button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md flex items-center gap-2">
          <AlertCircle size={16} />
          {error}
        </div>
      )}

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Input
            placeholder="Search products..."
            icon={<Search size={18} className="text-gray-400" />}
            value={searchTerm}
            onChange={(e) => dispatch(setSearchTerm(e.target.value))}
            className="w-full"
          />
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden dark:bg-background-secondary dark:border-background-secondary">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Purchase Price</TableHead>
              <TableHead>Selling Price</TableHead>
              <TableHead>Quantity</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentProducts.length > 0 ? (
              currentProducts.map((product) => (
                <TableRow key={product.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-3">
                      {product.image_url && (
                        <img
                          src={product.image_url}
                          alt={product.name}
                          className="h-10 w-10 rounded-md object-cover"
                        />
                      )}
                      {product.name}
                    </div>
                  </TableCell>
                  <TableCell>
                    {product.category?.name || "Uncategorized"}
                  </TableCell>
                  <TableCell>
                    ${product.purchase_price?.toFixed(2) || "0.00"}
                  </TableCell>
                  <TableCell>
                    ${getSellingPrice(product.purchase_price || 0).toFixed(2)}
                  </TableCell>
                  <TableCell>{product.quantity}</TableCell>
                  <TableCell>{getStatusBadge(product.quantity)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        icon={<Edit size={16} />}
                        onClick={() => dispatch(openProductModal(product))}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        icon={<Trash size={16} />}
                        onClick={() => handleDelete(product.id)}
                      >
                        Delete
                      </Button>
                    </div>
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
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={(page) => dispatch(setCurrentPage(page))}
          />
        </div>
      )}

      {/* Product Modal */}
      <NewProductModal
        isOpen={isProductModalOpen}
        product={editingProduct}
        onClose={() => dispatch(closeProductModal())}
      />
    </div>
  );
};

export default ProductsPage;
