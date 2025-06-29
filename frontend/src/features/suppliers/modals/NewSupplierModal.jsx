// src/features/suppliers/modals/NewSupplierModal.jsx
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { Building2, Mail, Phone, MapPin, User } from "lucide-react";
import {
  createSupplier,
  updateSupplier,
  closeModal,
  setFormField,
} from "../../../store/slices/supplierSlice";
import Button from "../../../components/shared/Button";
import Input from "../../../components/shared/Input";
import { useOutsideClick } from "../../../hooks/useOutsideClick";

const NewSupplierModal = () => {
  const dispatch = useDispatch();
  const {
    modal: { isOpen, mode, formData },
    loading: saveLoading,
    error: saveError,
  } = useSelector((state) => state.supplier);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (mode === "edit") {
        await dispatch(updateSupplier(formData)).unwrap();
      } else {
        await dispatch(createSupplier(formData)).unwrap();
      }

      dispatch(closeModal());
    } catch {
      // Error is already handled by the slice
    }
  };

  const modalRef = React.useRef(null);

  useOutsideClick(modalRef, () => {
    if (isOpen) {
      dispatch(closeModal());
    }
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div
        ref={modalRef}
        className="bg-white dark:bg-gray-800 text-gray-800 dark:text-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold">
            {mode === "edit" ? "Edit Supplier" : "Add New Supplier"}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <Input
            label="Supplier Name *"
            icon={<Building2 size={18} />}
            value={formData.name}
            onChange={(e) =>
              dispatch(setFormField({ field: "name", value: e.target.value }))
            }
            placeholder="Enter supplier name"
            required
          />

          <Input
            label="Contact Name"
            icon={<User size={18} />}
            value={formData.contactName}
            onChange={(e) =>
              dispatch(
                setFormField({ field: "contactName", value: e.target.value })
              )
            }
            placeholder="Enter contact person name"
          />

          <Input
            label="Company Name"
            icon={<Building2 size={18} />}
            value={formData.companyName}
            onChange={(e) =>
              dispatch(
                setFormField({ field: "companyName", value: e.target.value })
              )
            }
            placeholder="Enter company name"
          />

          <Input
            label="Email"
            type="email"
            icon={<Mail size={18} />}
            value={formData.email}
            onChange={(e) =>
              dispatch(setFormField({ field: "email", value: e.target.value }))
            }
            placeholder="Enter email address"
          />

          <Input
            label="Phone"
            type="tel"
            icon={<Phone size={18} />}
            value={formData.phone}
            onChange={(e) =>
              dispatch(setFormField({ field: "phone", value: e.target.value }))
            }
            placeholder="Enter phone number"
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
              Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MapPin size={18} className="text-gray-400" />
              </div>
              <textarea
                value={formData.address}
                onChange={(e) =>
                  dispatch(
                    setFormField({ field: "address", value: e.target.value })
                  )
                }
                className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 pl-10 p-2 shadow-sm min-h-[80px]"
                placeholder="Enter physical address"
              />
            </div>
          </div>

          {saveError && (
            <div className="text-red-600 text-sm bg-red-50 p-3 rounded-md">
              {saveError}
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => dispatch(closeModal())}
              disabled={saveLoading}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={saveLoading}>
              {mode === "edit" ? "Update Supplier" : "Create Supplier"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewSupplierModal;
