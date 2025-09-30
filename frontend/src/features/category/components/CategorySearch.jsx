import React from "react";
import { Search } from "lucide-react";
import Input from "../../../components/shared/Input";

const CategorySearch = ({ searchTerm, onSearchChange }) => {
  return (
    <div className="relative flex-1">
      <Input
        placeholder="Search categories..."
        icon={<Search size={18} className="text-gray-400" />}
        value={searchTerm}
        onChange={onSearchChange}
        className="w-full"
      />
    </div>
  );
};

export default CategorySearch;
