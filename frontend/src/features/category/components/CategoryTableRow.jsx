import React, { useState, useRef } from "react";
import { useDispatch } from "react-redux";
import { Tag, Edit, Trash, MoreHorizontal } from "lucide-react";
import { TableCell, TableRow } from "../../../components/shared/table";
import Button from "../../../components/shared/Button";
import { openCategoryModal, deleteCategory } from "../../../store/slices/categorySlice";
import { useOutsideClick } from "../../../hooks/useOutsideClick";
import ConfirmationModal from "../../../components/shared/ConfirmationModal";

const CategoryTableRow = ({
  category,
  isSelected,
  onToggleSelection,
}) => {
  const dispatch = useDispatch();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useOutsideClick(dropdownRef, () => {
    if (isDropdownOpen) {
      setIsDropdownOpen(false);
    }
  });

  const handleDelete = (categoryId, e) => {
    e.stopPropagation(); // Prevent any parent event handling
    setIsDropdownOpen(false); // Close dropdown
    setShowDeleteModal(true); // Open custom confirmation modal
  };

  const confirmDelete = () => {
    dispatch(deleteCategory(category.id));
    setShowDeleteModal(false);
  };

  const handleEdit = (category, e) => {
    e.stopPropagation(); // Prevent any parent event handling
    setIsDropdownOpen(false); // Close dropdown
    dispatch(openCategoryModal(category));
  };

  const toggleDropdown = (e) => {
    e.stopPropagation(); // Prevent any parent event handling
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleCheckboxChange = (e) => {
    e.stopPropagation(); // Prevent any parent event handling
    onToggleSelection(category.id);
  };


  return (
    <>
    <TableRow 
      className="border-b border-gray-200 hover:bg-gray-50 bg-white even:bg-gray-50"
    >
      <TableCell className="w-8 pr-2">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={handleCheckboxChange}
          className="rounded-none border-gray-300 text-blue-600 focus:ring-gray-400"
        />
      </TableCell>
      <TableCell className="min-w-[200px] pl-2 font-medium">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-md bg-indigo-100 text-indigo-600 flex items-center justify-center flex-shrink-0">
            <Tag size={16} />
          </div>
          <div className="min-w-0 flex-1">
            <div className="font-medium text-gray-900 truncate">{category.name}</div>
            {category.slug && (
              <div className="text-xs sm:text-sm text-gray-500 truncate">
                Slug: {category.slug}
              </div>
            )}
          </div>
        </div>
      </TableCell>
      <TableCell className="min-w-[150px] text-gray-900">
        <span className="truncate block">{category.description || "-"}</span>
      </TableCell>
      <TableCell className="min-w-[100px] text-gray-900">
        <span className="text-xs sm:text-sm">
          {new Date(category.createdAt || category.created_at).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
          })}
        </span>
      </TableCell>
      <TableCell className="min-w-[100px] text-gray-900">
        <span className="text-xs sm:text-sm">
          {new Date(category.updatedAt || category.updated_at).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
          })}
        </span>
      </TableCell>
      <TableCell className="min-w-[80px]">
        <div className="relative flex justify-center" ref={dropdownRef} data-dropdown>
          <button
            onClick={toggleDropdown}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Category actions"
          >
            <MoreHorizontal size={16} className="text-gray-600" />
          </button>

          {/* Dropdown Menu */}
          {isDropdownOpen && (
            <>
              {/* Background Overlay */}
              <div 
                className="fixed inset-0 bg-black/20 z-[9998]" 
                onClick={() => setIsDropdownOpen(false)} 
              />
              
              {/* Dropdown */}
              <div className="absolute right-0 top-full mt-1 w-52 bg-white border border-gray-200 rounded-lg shadow-lg z-[9999]">
                <div className="py-1">
                  <button
                    onClick={(e) => handleEdit(category, e)}
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                  >
                    <Edit size={14} className="text-blue-600" />
                    Edit Category
                  </button>
                  <button
                    onClick={(e) => handleDelete(category.id, e)}
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                  >
                    <Trash size={14} className="text-red-600" />
                    Delete Category
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </TableCell>
    </TableRow>
    
    {/* Delete Confirmation Modal */}
    <ConfirmationModal
      isOpen={showDeleteModal}
      onClose={() => setShowDeleteModal(false)}
      onConfirm={confirmDelete}
      title="Delete Category"
      message={`Are you sure you want to delete "${category.name}"? This action cannot be undone.`}
      confirmText="Delete"
      cancelText="Cancel"
      variant="danger"
    />
  </>
  );
};

export default CategoryTableRow;
