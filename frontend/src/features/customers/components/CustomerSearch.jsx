import React from "react";
import { Search, ArrowUpDown } from "lucide-react";
import { useDispatch } from "react-redux";
import Input from "../../../components/shared/Input";
import Button from "../../../components/shared/Button";
import { setSearchTerm, setSort } from "../../../store/slices/customerSlice";
import CustomerFilters from "./CustomerFilters";

const CustomerSearch = ({ searchTerm, onSearchChange }) => {
  const dispatch = useDispatch();

  return (
    <div className="flex flex-col sm:flex-row gap-4 items-center">
      <div className="relative flex-1">
        <Input
          placeholder="Search customers..."
          icon={<Search size={18} className="text-gray-400" />}
          value={searchTerm}
          onChange={onSearchChange}
          className="w-full"
        />
      </div>
      <CustomerFilters />
      <div className="relative">
        <Button
          variant="outline"
          icon={<ArrowUpDown size={16} />}
          onClick={() => dispatch(setSort({ field: "name" }))}
        >
          Sort by Name
        </Button>
      </div>
    </div>
  );
};

export default CustomerSearch;
