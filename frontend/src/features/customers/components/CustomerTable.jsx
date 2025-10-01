import React from "react";
import { useDispatch } from "react-redux";
import { Users, Mail, Phone, Edit, Trash } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../components/shared/Table";
import ActionMenu from "../../../components/shared/ActionMenu";
import { openEditModal, deleteCustomer } from "../../../store/slices/customerSlice";

const CustomerTable = ({ 
  items, 
  selected, 
  onSelect, 
  onSelectAll, 
  onDelete,
  onExport,
  onImport,
  importConfig 
}) => {
  const dispatch = useDispatch();

  const handleDelete = (customerId) => {
    if (window.confirm("Are you sure you want to delete this customer?")) {
      onDelete(customerId);
    }
  };

  const getActionMenu = (customer) => [
    {
      label: "Edit",
      icon: <Edit size={16} />,
      onClick: () => dispatch(openEditModal(customer)),
    },
    {
      label: "Delete",
      icon: <Trash size={16} />,
      onClick: () => handleDelete(customer.id),
      className: "text-red-600 hover:text-red-700 hover:bg-red-50",
    },
  ];

  const CustomerTableHeader = () => (
    <TableHeader>
      <TableRow>
        <TableHead className="w-12">
          <input
            type="checkbox"
            checked={selected.length === items.length && items.length > 0}
            onChange={onSelectAll}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
        </TableHead>
        <TableHead className="min-w-[180px]">Customer</TableHead>
        <TableHead className="min-w-[180px]">Contact</TableHead>
        <TableHead className="min-w-[160px]">Address</TableHead>
        <TableHead className="min-w-[140px]">Created At</TableHead>
        <TableHead className="text-right w-16">Actions</TableHead>
      </TableRow>
    </TableHeader>
  );

  const CustomerTableRow = ({ customer }) => (
    <TableRow>
      <TableCell>
        <input
          type="checkbox"
          checked={selected.includes(customer.id)}
          onChange={() => onSelect(customer.id)}
          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        />
      </TableCell>
      <TableCell className="min-w-[180px]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center">
            {customer.name.charAt(0).toUpperCase()}
          </div>
          <span className="font-medium text-gray-900">
            {customer.name}
          </span>
        </div>
      </TableCell>
      <TableCell className="min-w-[180px]">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-sm">
            <Mail size={14} className="text-gray-400" />
            <span>{customer.email}</span>
          </div>
          {customer.phone && (
            <div className="flex items-center gap-2 text-sm">
              <Phone size={14} className="text-gray-400" />
              <span>{customer.phone}</span>
            </div>
          )}
        </div>
      </TableCell>
      <TableCell className="min-w-[160px]">
        {customer.address}
      </TableCell>
      <TableCell className="min-w-[140px]">
        {new Date(customer.createdAt).toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })}
      </TableCell>
      <TableCell className="text-right w-16">
        <ActionMenu
          actions={getActionMenu(customer)}
          item={customer}
          className="flex justify-end"
        />
      </TableCell>
    </TableRow>
  );

  const CustomerEmptyState = () => (
    <div className="flex flex-col items-center justify-center text-gray-500">
      <Users size={28} className="mb-2" />
      <h3 className="text-lg font-medium">No customers found</h3>
      <p className="text-sm">Try adjusting your search or filters</p>
    </div>
  );

  const CustomerTableBody = () => {
    if (items.length === 0) {
      return (
        <TableBody>
          <TableRow>
            <TableCell colSpan={6} className="h-32 text-center">
              <CustomerEmptyState />
            </TableCell>
          </TableRow>
        </TableBody>
      );
    }

    return (
      <TableBody>
        {items.map((customer) => (
          <CustomerTableRow key={customer.id} customer={customer} />
        ))}
      </TableBody>
    );
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden dark:bg-background-secondary dark:border-background-secondary">
      <Table>
        <CustomerTableHeader />
        <CustomerTableBody />
      </Table>
    </div>
  );
};

export default CustomerTable;
