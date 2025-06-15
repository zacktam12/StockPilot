// src/features/category/modals/NewCategoryModal.jsx
import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Tag } from "lucide-react";
import {
  createCategory,
  updateCategory,
  closeModal,
} from "../../../store/slices/categorySlice";
import Button from "../../../components/shared/Button";
import Input from "../../../components/shared/Input";

const NewCategoryModal = () => {
  const dispatch = useDispatch();
  const {
    modal: { isOpen, mode, currentCategory, isLoading },
    error,
  } = useSelector((state) => state.category);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });

  // Initialize form when editing
  useEffect(() => {
    if (mode === "edit" && currentCategory) {
      setFormData({
        name: currentCategory.name,
        description: currentCategory.description || "",
      });
    } else {
      setFormData({
        name: "",
        description: "",
      });
    }
  }, [mode, currentCategory]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (mode === "edit" && currentCategory) {
        await dispatch(
          updateCategory({
            id: currentCategory.id,
            ...formData,
          })
        ).unwrap();
      } else {
        await dispatch(createCategory(formData)).unwrap();
      }

      dispatch(closeModal());
    } catch {
      // Error is already handled by the slice
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-md">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {mode === "edit" ? "Edit Category" : "Add New Category"}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <Input
            label="Category Name"
            name="name"
            icon={<Tag size={18} />}
            value={formData.name}
            onChange={handleChange}
            placeholder="Enter category name"
            required
          />

          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Description (optional)
            </label>
            <textarea
              name="description"
              id="description"
              value={formData.description}
              onChange={handleChange}
              className="w-full rounded-md border border-gray-300 p-2 shadow-sm min-h-[100px] focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          {error && (
            <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
              {error}
            </div>
          )}

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => dispatch(closeModal())}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={isLoading}>
              {mode === "edit" ? "Update Category" : "Create Category"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewCategoryModal;
