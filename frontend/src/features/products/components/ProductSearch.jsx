import React from "react";
import { Search } from "lucide-react";
import Input from "../../../components/shared/Input";
import ProductFilters from "./ProductFilters";

const ProductSearch = ({ searchTerm, onSearchChange }) => {
  return (
    <div className="flex flex-col sm:flex-row gap-4 items-center">
      <div className="relative flex-1">
        <Input
          placeholder="Search products..."
          icon={<Search size={18} className="text-gray-400" />}
          value={searchTerm}
          onChange={onSearchChange}
          className="w-full"
        />
      </div>
      <ProductFilters />
    </div>
  );
};

export default ProductSearch;
