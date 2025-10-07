import React from "react";
import { useNavigate } from "react-router-dom";
import { AlertCircle } from "lucide-react";
import { TableCell, TableRow } from "../../../components/shared/table";

const ProductTableRow = ({
  product,
  isSelected,
  onToggleSelection,
  getStatusBadge,
}) => {
  const navigate = useNavigate();

  const handleRowClick = (e) => {
    // Don't navigate if clicking on checkbox
    if (e.target.type === 'checkbox') {
      return;
    }
    
    navigate(`/products/${product.id}`);
  };

  return (
    <TableRow 
      onClick={handleRowClick}
      className="border-b border-gray-200 hover:bg-gray-50 cursor-pointer bg-white even:bg-gray-50"
    >
      <TableCell className="w-8 pr-2">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={() => onToggleSelection(product.id)}
          className="rounded-none border-gray-300 text-blue-600 focus:ring-gray-400"
        />
      </TableCell>
      <TableCell className="min-w-[200px] pl-2 font-medium">
        <div className="flex items-center gap-3">
          {product.image_url && (
            <img
              src={product.image_url}
              alt={product.name}
              className="h-8 w-8 sm:h-10 sm:w-10 rounded-lg object-cover flex-shrink-0"
            />
          )}
          <div className="min-w-0 flex-1">
            <div className="font-medium text-gray-900 truncate">{product.name}</div>
            {product.sku && (
              <div className="text-xs sm:text-sm text-gray-500 truncate">
                SKU: {product.sku}
              </div>
            )}
          </div>
        </div>
      </TableCell>
      <TableCell className="min-w-[120px] text-gray-900">
        <span className="truncate block">{product.category?.name || "Uncategorized"}</span>
      </TableCell>
      <TableCell className="min-w-[80px] text-gray-900">
        <span className="font-medium">${product.price?.toFixed(2) || "0.00"}</span>
      </TableCell>
      <TableCell className="min-w-[80px] text-gray-900">
        <span className="font-medium">${product.cost?.toFixed(2) || "0.00"}</span>
      </TableCell>
      <TableCell className="min-w-[80px] text-gray-900">
        <div className="flex items-center gap-1">
          <span className="font-medium">{product.quantity}</span>
          {product.quantity <= (product.minStock || 10) && (
            <AlertCircle size={12} className="text-yellow-500 flex-shrink-0" />
          )}
        </div>
      </TableCell>
      <TableCell className="min-w-[80px]">
        {getStatusBadge(product.quantity, product.minStock)}
      </TableCell>
    </TableRow>
  );
};

export default ProductTableRow;
