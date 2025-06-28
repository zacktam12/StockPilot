import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { Trash2, Download, X } from "lucide-react";
import Button from "../../../components/shared/Button";
import Badge from "../../../components/shared/Badge";
import {
  bulkDeleteProducts,
  clearSelection,
} from "../../../store/slices/productSlice";
import {
  convertToCSV,
  downloadCSV,
  generateCSVFilename,
  PRODUCT_CSV_HEADERS,
} from "../../../utils/csvUtils";

const BulkActions = () => {
  const dispatch = useDispatch();
  const { selectedItems, items } = useSelector((state) => state.product);

  const selectedProducts = items.filter((item) =>
    selectedItems.includes(item.id)
  );

  const handleBulkDelete = () => {
    if (
      window.confirm(
        `Are you sure you want to delete ${selectedItems.length} products?`
      )
    ) {
      dispatch(bulkDeleteProducts(selectedItems));
    }
  };

  const handleExportSelected = () => {
    const csvContent = convertToCSV(selectedProducts, PRODUCT_CSV_HEADERS);
    const filename = generateCSVFilename("selected-products");
    downloadCSV(csvContent, filename);
  };

  const handleClearSelection = () => {
    dispatch(clearSelection());
  };

  if (selectedItems.length === 0) return null;

  return (
    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Badge variant="primary" className="text-sm">
            {selectedItems.length} selected
          </Badge>
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {selectedItems.length === 1 ? "product" : "products"} selected
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportSelected}
            icon={<Download size={16} />}
          >
            Export Selected
          </Button>

          <Button
            variant="danger"
            size="sm"
            onClick={handleBulkDelete}
            icon={<Trash2 size={16} />}
          >
            Delete Selected
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearSelection}
            icon={<X size={16} />}
          >
            Clear Selection
          </Button>
        </div>
      </div>
    </div>
  );
};

export default BulkActions;
