// src/features/customers/pages/Customers.jsx
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Plus,
  Search,
  Filter,
  ArrowUpDown,
  Edit,
  Trash,
  Users,
  Mail,
  Phone,
  Check,
} from "lucide-react";
import {
  fetchCustomers,
  deleteCustomer,
  setSearchTerm,
  setSort,
  togglePhoneFilter,
  toggleAddressFilter,
  openCreateModal,
  openEditModal,
} from "../../../store/slices/customerSlice";
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
import NewCustomerModal from "../modals/NewCustomerModal";

const CustomersPage = () => {
  const dispatch = useDispatch();
  const {
    // items: customers,
    filteredItems,
    loading,
    error,
    pagination,
    filters,
    // modal,
  } = useSelector((state) => state.customer);

  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [showSortMenu, setShowSortMenu] = useState(false);

  useEffect(() => {
    dispatch(fetchCustomers());
  }, [dispatch]);

  const handleDelete = (customerId) => {
    if (window.confirm("Are you sure you want to delete this customer?")) {
      dispatch(deleteCustomer(customerId));
    }
  };

  const indexOfLastItem = pagination.currentPage * pagination.itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - pagination.itemsPerPage;
  const currentItems = filteredItems.slice(indexOfFirstItem, indexOfLastItem);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Customers</h1>
        <Button
          variant="primary"
          size="md"
          icon={<Plus size={16} />}
          onClick={() => dispatch(openCreateModal())}
        >
          Add New Customer
        </Button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md flex items-center gap-2">
          <AlertCircle size={16} />
          {error}
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Input
            placeholder="Search customers..."
            icon={<Search size={18} className="text-gray-400" />}
            value={filters.searchTerm}
            onChange={(e) => dispatch(setSearchTerm(e.target.value))}
            className="w-full"
          />
        </div>

        <div className="relative">
          <Button
            variant="outline"
            icon={<Filter size={16} />}
            onClick={() => setShowFilterMenu(!showFilterMenu)}
          >
            Filter
          </Button>
          {showFilterMenu && (
            <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 p-4 z-50">
              <div className="space-y-4">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={filters.options.hasPhone}
                    onChange={() => dispatch(togglePhoneFilter())}
                    className="rounded border-gray-300"
                  />
                  <span className="text-sm">Has Phone Number</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={filters.options.hasAddress}
                    onChange={() => dispatch(toggleAddressFilter())}
                    className="rounded border-gray-300"
                  />
                  <span className="text-sm">Has Address</span>
                </label>
              </div>
            </div>
          )}
        </div>

        <div className="relative">
          <Button
            variant="outline"
            icon={<ArrowUpDown size={16} />}
            onClick={() => setShowSortMenu(!showSortMenu)}
          >
            Sort
          </Button>
          {showSortMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden z-50">
              <button
                className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center justify-between"
                onClick={() => dispatch(setSort({ field: "name" }))}
              >
                <span>Name</span>
                {filters.sortField === "name" && (
                  <Check size={16} className="text-indigo-600" />
                )}
              </button>
              <button
                className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center justify-between"
                onClick={() => dispatch(setSort({ field: "email" }))}
              >
                <span>Email</span>
                {filters.sortField === "email" && (
                  <Check size={16} className="text-indigo-600" />
                )}
              </button>
              <button
                className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center justify-between"
                onClick={() => dispatch(setSort({ field: "created_at" }))}
              >
                <span>Created Date</span>
                {filters.sortField === "created_at" && (
                  <Check size={16} className="text-indigo-600" />
                )}
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Customer</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Address</TableHead>
              <TableHead>Created At</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8">
                  Loading customers...
                </TableCell>
              </TableRow>
            ) : currentItems.length > 0 ? (
              currentItems.map((customer) => (
                <TableRow key={customer.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center">
                        {customer.name.charAt(0).toUpperCase()}
                      </div>
                      <span className="font-medium text-gray-900">
                        {customer.name}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
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
                  <TableCell>{customer.address}</TableCell>
                  <TableCell>
                    {new Date(customer.created_at).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        icon={<Edit size={16} />}
                        onClick={() => dispatch(openEditModal(customer))}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        icon={<Trash size={16} />}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={() => handleDelete(customer.id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="h-32 text-center">
                  <div className="flex flex-col items-center justify-center text-gray-500">
                    <Users size={28} className="mb-2" />
                    <h3 className="text-lg font-medium">No customers found</h3>
                    <p className="text-sm">
                      Try adjusting your search or filters
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <NewCustomerModal />
    </div>
  );
};

export default CustomersPage;
