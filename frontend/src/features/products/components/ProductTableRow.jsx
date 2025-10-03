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
      <TableCell className="flex-1 pl-2 font-medium">
        <div className="flex items-center gap-3">
          {product.image_url && (
            <img
              src={product.image_url}
              alt={product.name}
              className="h-10 w-10 rounded-lg object-cover"
            />
          )}
          <div>
            <div className="font-medium text-gray-900">{product.name}</div>
            {product.sku && (
              <div className="text-sm text-gray-500">
                SKU: {product.sku}
              </div>
            )}
          </div>
        </div>
      </TableCell>
      <TableCell className="hidden md:table-cell flex-1 text-gray-900">
        {product.category?.name || "Uncategorized"}
      </TableCell>
      <TableCell className="flex-1 text-gray-900">${product.price?.toFixed(2) || "0.00"}</TableCell>
      <TableCell className="hidden lg:table-cell flex-1 text-gray-900">
        ${product.cost?.toFixed(2) || "0.00"}
      </TableCell>
      <TableCell className="flex-1 text-gray-900">
        <div className="flex items-center gap-2">
          <span>{product.quantity}</span>
          {product.quantity <= (product.minStock || 10) && (
            <AlertCircle size={14} className="text-yellow-500" />
          )}
        </div>
      </TableCell>
      <TableCell className="hidden sm:table-cell w-24">
        {getStatusBadge(product.quantity, product.minStock)}
      </TableCell>
    </TableRow>
  );
};

export default ProductTableRow;
