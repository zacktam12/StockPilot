import React from "react";
import { useDispatch, useSelector } from "react-redux";
import BulkActions from "../../../components/shared/BulkActions";
import NewProductModal from "../modals/NewProductModal";
import CSVImportModal from "../modals/CSVImportModal";
import {
  closeProductModal,
  closeCSVImportModal,
  deleteProduct,
} from "../../../store/slices/productSlice";
import { exportProductsToCSV, validateProductCSV } from "../../../utils/csvUtils";

const ProductActions = () => {
  const dispatch = useDispatch();
  const {
    selectedItems,
    filteredItems,
    isProductModalOpen,
    isCSVImportModalOpen,
    editingProduct,
  } = useSelector((state) => state.product);

  // Handle product deletion
  const handleDelete = (productId) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      dispatch(deleteProduct(productId));
    }
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

  return (
    <>
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
    </>
  );
};

export default ProductActions;
