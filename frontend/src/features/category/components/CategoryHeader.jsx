import React from "react";
import { useDispatch } from "react-redux";
import { Plus } from "lucide-react";
import Button from "../../../components/shared/Button";
import { openCategoryModal } from "../../../store/slices/categorySlice";

const CategoryHeader = () => {
  const dispatch = useDispatch();

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
        Categories
      </h1>
      <Button
        variant="primary"
        size="md"
        icon={<Plus size={16} />}
        onClick={() => dispatch(openCategoryModal())}
      >
        Add New Category
      </Button>
    </div>
  );
};

export default CategoryHeader;
