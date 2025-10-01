import React from "react";
import { useDispatch } from "react-redux";
import { Plus, Download, Upload } from "lucide-react";
import Button from "../../../components/shared/Button";
import { openCreateModal } from "../../../store/slices/customerSlice";
import { exportCustomersToCSV } from "../../../utils/csvUtils";

const CustomerHeader = ({ items, onOpenImportModal }) => {
  const dispatch = useDispatch();

  const handleExportCSV = () => {
    exportCustomersToCSV(items);
  };

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
        Customers
      </h1>
      <div className="flex flex-col sm:flex-row gap-2">
        <Button
          variant="outline"
          size="sm"
          icon={<Download size={16} />}
          onClick={handleExportCSV}
        >
          Export CSV
        </Button>
        <Button
          variant="outline"
          size="sm"
          icon={<Upload size={16} />}
          onClick={onOpenImportModal}
        >
          Import CSV
        </Button>
        <Button
          variant="primary"
          size="sm"
          icon={<Plus size={16} />}
          onClick={() => dispatch(openCreateModal())}
        >
          Add New Customer
        </Button>
      </div>
    </div>
  );
};

export default CustomerHeader;
