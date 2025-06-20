// src/features/suppliers/pages/Suppliers.jsx
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Plus,
  Search,
  Filter,
  ArrowUpDown,
  Edit,
  Trash,
  Truck,
  Mail,
  Phone,
  Check,
  Loader2,
} from "lucide-react";
import {
  fetchSuppliers,
  deleteSupplier,
  setSearchTerm,
  setSort,
  togglePhoneFilter,
  toggleAddressFilter,
  openCreateModal,
  openEditModal,
} from "../../../store/slices/supplierSlice";
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
import NewSupplierModal from "../modals/NewSupplierModal";
import LoadingOverlay from "../../../components/shared/LoadingOverlay";
import { BarsSpinner } from "../../../components/shared/Spinner";

const SuppliersPage = () => {
  const dispatch = useDispatch();
  const {
    // items: suppliers,
    filteredItems,
    loading,
    error,
    pagination,
    filters,
  } = useSelector((state) => state.supplier);

  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [showSortMenu, setShowSortMenu] = useState(false);

  useEffect(() => {
    dispatch(fetchSuppliers());
  }, [dispatch]);

  const handleDelete = (supplierId) => {
    if (window.confirm("Are you sure you want to delete this supplier?")) {
      dispatch(deleteSupplier(supplierId));
    }
  };

  const indexOfLastItem = pagination.currentPage * pagination.itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - pagination.itemsPerPage;
  const currentItems = filteredItems.slice(indexOfFirstItem, indexOfLastItem);

  if (loading && filteredItems.length === 0 && !error) {
    return (
      <LoadingOverlay
        title="Suppliers"
        description="Loading supplier data..."
      />
    );
  }

  return (
    <div className="space-y-6 bg-white text-gray-900 dark:bg-background dark:text-text min-h-screen">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Suppliers
        </h1>
        <Button
          variant="primary"
          size="md"
          icon={<Plus size={16} />}
          onClick={() => dispatch(openCreateModal())}
        >
          Add New Supplier
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
            placeholder="Search by name, email, phone or address..."
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
            <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-4 z-50">
              <div className="space-y-4">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={filters.options.hasPhone}
                    onChange={() => dispatch(togglePhoneFilter())}
                    className="rounded border-gray-300 dark:border-gray-600"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-200">
                    Has Phone Number
                  </span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={filters.options.hasAddress}
                    onChange={() => dispatch(toggleAddressFilter())}
                    className="rounded border-gray-300 dark:border-gray-600"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-200">
                    Has Address
                  </span>
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
            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden z-50">
              <button
                className="w-full px-4 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center justify-between text-gray-700 dark:text-gray-200"
                onClick={() => dispatch(setSort({ field: "name" }))}
              >
                <span>Name</span>
                {filters.sortField === "name" && (
                  <Check
                    size={16}
                    className="text-indigo-600 dark:text-indigo-400"
                  />
                )}
              </button>
              <button
                className="w-full px-4 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center justify-between text-gray-700 dark:text-gray-200"
                onClick={() => dispatch(setSort({ field: "email" }))}
              >
                <span>Email</span>
                {filters.sortField === "email" && (
                  <Check
                    size={16}
                    className="text-indigo-600 dark:text-indigo-400"
                  />
                )}
              </button>
              <button
                className="w-full px-4 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center justify-between text-gray-700 dark:text-gray-200"
                onClick={() => dispatch(setSort({ field: "created_at" }))}
              >
                <span>Created Date</span>
                {filters.sortField === "created_at" && (
                  <Check
                    size={16}
                    className="text-indigo-600 dark:text-indigo-400"
                  />
                )}
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="relative bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden dark:bg-background-secondary dark:border-background-secondary">
        {loading && filteredItems.length > 0 && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/40 dark:bg-white/10">
            <BarsSpinner />
          </div>
        )}
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Supplier</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Address</TableHead>
              <TableHead>Created At</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentItems.length > 0 ? (
              currentItems.map((supplier) => (
                <TableRow key={supplier.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-teal-100 text-teal-600 flex items-center justify-center">
                        {supplier.name.charAt(0).toUpperCase()}
                      </div>
                      <span className="font-medium text-gray-900">
                        {supplier.name}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm">
                        <Mail size={14} className="text-gray-400" />
                        <span>{supplier.email}</span>
                      </div>
                      {supplier.phone && (
                        <div className="flex items-center gap-2 text-sm">
                          <Phone size={14} className="text-gray-400" />
                          <span>{supplier.phone}</span>
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{supplier.address || "-"}</TableCell>
                  <TableCell>
                    {new Date(supplier.created_at).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        icon={<Edit size={16} />}
                        className="hover:bg-gray-100"
                        onClick={() =>
                          dispatch(
                            openEditModal({
                              id: supplier.id,
                              name: supplier.name,
                              email: supplier.email,
                              phone: supplier.phone,
                              address: supplier.address,
                            })
                          )
                        }
                      >
                        Edit
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        icon={<Trash size={16} />}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={() => handleDelete(supplier.id)}
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
                    <Truck size={28} className="mb-2" />
                    <h3 className="text-lg font-medium">No suppliers found</h3>
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

      <NewSupplierModal />
    </div>
  );
};

export default SuppliersPage;
