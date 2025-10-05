import React from "react";
import { useNavigate } from "react-router-dom";
import { Mail, Phone, MapPin } from "lucide-react";
import { TableCell, TableRow } from "../../../components/shared/table";

const CustomerTableRow = ({
  customer,
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
    
    navigate(`/customers/${customer.id}`);
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
          onChange={() => onToggleSelection(customer.id)}
          className="rounded-none border-gray-300 text-blue-600 focus:ring-gray-400"
        />
      </TableCell>
      <TableCell className="flex-1 pl-2 font-medium">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-semibold">
            {customer.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="font-medium text-gray-900">{customer.name}</div>
          </div>
        </div>
      </TableCell>
      <TableCell className="hidden md:table-cell flex-1 text-gray-900">
        <div className="flex items-center gap-2">
          <Mail size={14} className="text-gray-400" />
          <span>{customer.email || "No email"}</span>
        </div>
      </TableCell>
      <TableCell className="hidden lg:table-cell flex-1 text-gray-900">
        <div className="flex items-center gap-2">
          <Phone size={14} className="text-gray-400" />
          <span>{customer.phone || "No phone"}</span>
        </div>
      </TableCell>
      <TableCell className="hidden xl:table-cell flex-1 text-gray-900">
        <div className="flex items-center gap-2">
          <MapPin size={14} className="text-gray-400" />
          <span className="truncate">{customer.address || "No address"}</span>
        </div>
      </TableCell>
      <TableCell className="hidden sm:table-cell w-24">
        {getStatusBadge(customer)}
      </TableCell>
    </TableRow>
  );
};

export default CustomerTableRow;
