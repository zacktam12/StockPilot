import React from "react";
import { useDispatch } from "react-redux";
import { Tag, Edit, Trash } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../components/shared/Table";
import Button from "../../../components/shared/Button";
import { openCategoryModal, deleteCategory } from "../../../store/slices/categorySlice";

const CategoryTable = ({ currentItems }) => {
  const dispatch = useDispatch();

  const handleDelete = (categoryId) => {
    if (window.confirm("Are you sure you want to delete this category?")) {
      dispatch(deleteCategory(categoryId));
    }
  };

  const CategoryTableHeader = () => (
    <TableHeader>
      <TableRow>
        <TableHead>Category</TableHead>
        <TableHead>Description</TableHead>
        <TableHead>Created At</TableHead>
        <TableHead className="text-right">Actions</TableHead>
      </TableRow>
    </TableHeader>
  );

  const CategoryTableRow = ({ category }) => (
    <TableRow>
      <TableCell>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-md bg-indigo-100 text-indigo-600 flex items-center justify-center">
            <Tag size={16} />
          </div>
          <span className="font-medium text-gray-900">
            {category.name}
          </span>
        </div>
      </TableCell>
      <TableCell>{category.description || "-"}</TableCell>
      <TableCell>
        {new Date(category.created_at).toLocaleDateString("en-US", {
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
            onClick={() => dispatch(openCategoryModal(category))}
          >
            Edit
          </Button>
          <Button
            variant="ghost"
            size="sm"
            icon={<Trash size={16} />}
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
            onClick={() => handleDelete(category.id)}
          >
            Delete
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );

  const CategoryEmptyState = () => (
    <div className="flex flex-col items-center justify-center text-gray-500">
      <Tag size={28} className="mb-2" />
      <h3 className="text-lg font-medium">No categories found</h3>
      <p className="text-sm">Try adjusting your search or filters</p>
    </div>
  );

  const CategoryTableBody = () => {
    if (currentItems.length === 0) {
      return (
        <TableBody>
          <TableRow>
            <TableCell colSpan={4} className="h-32 text-center">
              <CategoryEmptyState />
            </TableCell>
          </TableRow>
        </TableBody>
      );
    }

    return (
      <TableBody>
        {currentItems.map((category) => (
          <CategoryTableRow key={category.id} category={category} />
        ))}
      </TableBody>
    );
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden dark:bg-background-secondary dark:border-background-secondary">
      <Table>
        <CategoryTableHeader />
        <CategoryTableBody />
      </Table>
    </div>
  );
};

export default CategoryTable;
