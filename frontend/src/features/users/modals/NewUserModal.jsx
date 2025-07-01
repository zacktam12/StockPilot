import React, { useState, useEffect, useRef } from "react";
import { User, Mail, Lock, Phone } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { createUser, updateUser } from "../../../store/slices/userSlice";
import { fetchRoles } from "../../../store/slices/roleSlice";
import Button from "../../../components/shared/Button";
import Input from "../../../components/shared/Input";
import { useOutsideClick } from "../../../hooks/useOutsideClick";

const NewUserModal = ({ isOpen, onClose, onSuccess, editingUser }) => {
  const dispatch = useDispatch();
  const { roles = [] } = useSelector((state) => state.role || {});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    phone: "",
    roleId: "",
    status: "Active",
  });

  const modalRef = useRef(null);

  // Fetch roles on mount
  useEffect(() => {
    if (isOpen && roles.length === 0) {
      dispatch(fetchRoles());
    }
  }, [dispatch, isOpen, roles.length]);

  // Reset form when editing user changes
  useEffect(() => {
    if (editingUser) {
      setFormData({
        firstName: editingUser.firstName || "",
        lastName: editingUser.lastName || "",
        email: editingUser.email || "",
        password: "",
        phone: editingUser.phone || "",
        roleId: editingUser.roleId || "",
        status: editingUser.status || "Active",
      });
    } else {
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        phone: "",
        roleId: "",
        status: "Active",
      });
    }
  }, [editingUser]);

  // Add outside click functionality
  useOutsideClick(modalRef, () => {
    if (isOpen) onClose();
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (editingUser) {
        // Remove password if not provided for updates
        const updateData = { ...formData };
        if (!updateData.password) {
          delete updateData.password;
        }
        // Remove email field when editing since it's disabled
        delete updateData.email;
        await dispatch(
          updateUser({ id: editingUser.id, userData: updateData })
        ).unwrap();
      } else {
        await dispatch(createUser(formData)).unwrap();
      }
      onSuccess();
      onClose();
    } catch (err) {
      setError(err.message || "Failed to save user");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div
        ref={modalRef}
        className="bg-white dark:bg-gray-800 text-gray-800 dark:text-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold">
            {editingUser ? "Edit User" : "Add New User"}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="First Name"
              icon={<User size={18} />}
              value={formData.firstName}
              onChange={(e) =>
                setFormData({ ...formData, firstName: e.target.value })
              }
              required
            />

            <Input
              label="Last Name"
              icon={<User size={18} />}
              value={formData.lastName}
              onChange={(e) =>
                setFormData({ ...formData, lastName: e.target.value })
              }
              required
            />
          </div>

          <Input
            label="Email"
            type="email"
            icon={<Mail size={18} />}
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
            required
            disabled={!!editingUser}
          />

          <Input
            label="Phone"
            type="tel"
            icon={<Phone size={18} />}
            value={formData.phone}
            onChange={(e) =>
              setFormData({ ...formData, phone: e.target.value })
            }
            placeholder="+1234567890"
          />

          {!editingUser && (
            <Input
              label="Password"
              type="password"
              icon={<Lock size={18} />}
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              required
            />
          )}

          {editingUser && (
            <Input
              label="New Password (leave blank to keep current)"
              type="password"
              icon={<Lock size={18} />}
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              placeholder="Enter new password"
            />
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
              Role
            </label>
            <select
              value={formData.roleId}
              onChange={(e) =>
                setFormData({ ...formData, roleId: e.target.value })
              }
              className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-white shadow-sm p-2"
              required
            >
              <option value="">Select a role</option>
              {roles.map((role) => (
                <option key={role.id} value={role.id}>
                  {role.role_type}
                </option>
              ))}
            </select>
          </div>

          {editingUser && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) =>
                  setFormData({ ...formData, status: e.target.value })
                }
                className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-white shadow-sm p-2"
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
                <option value="Deactivated">Deactivated</option>
                <option value="Banned">Banned</option>
              </select>
            </div>
          )}

          {error && (
            <div className="text-red-600 text-sm bg-red-50 p-3 rounded-md">
              {error}
            </div>
          )}

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" isLoading={loading}>
              {editingUser ? "Update User" : "Create User"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewUserModal;
