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
      <TableCell className="min-w-[200px] pl-2 font-medium">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-semibold flex-shrink-0">
            {customer.name.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <div className="font-medium text-gray-900 truncate">{customer.name}</div>
          </div>
        </div>
      </TableCell>
      <TableCell className="min-w-[150px] text-gray-900">
        <div className="flex items-center gap-2">
          <Mail size={14} className="text-gray-400 flex-shrink-0" />
          <span className="truncate">{customer.email || "No email"}</span>
        </div>
      </TableCell>
      <TableCell className="min-w-[120px] text-gray-900">
        <div className="flex items-center gap-2">
          <Phone size={14} className="text-gray-400 flex-shrink-0" />
          <span className="truncate">{customer.phone || "No phone"}</span>
        </div>
      </TableCell>
      <TableCell className="min-w-[150px] text-gray-900">
        <div className="flex items-center gap-2">
          <MapPin size={14} className="text-gray-400 flex-shrink-0" />
          <span className="truncate">{customer.address || "No address"}</span>
        </div>
      </TableCell>
      <TableCell className="min-w-[80px]">
        {getStatusBadge(customer)}
      </TableCell>
    </TableRow>
  );
};

export default CustomerTableRow;
