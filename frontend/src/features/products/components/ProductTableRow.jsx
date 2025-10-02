import React from "react";
import { AlertCircle } from "lucide-react";
import { TableCell, TableRow } from "../../../components/shared/Table";
import ActionMenu from "../../../components/shared/ActionMenu";

const ProductTableRow = ({
  product,
  isSelected,
  onToggleSelection,
  getStatusBadge,
  getActionMenu,
}) => {
  return (
    <TableRow>
      <TableCell>
        <input
          type="checkbox"
          checked={isSelected}
          onChange={() => onToggleSelection(product.id)}
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
  );
};

export default ProductTableRow;
