import React, { useState } from "react";
import { Download, Upload, Trash, MoreHorizontal } from "lucide-react";
import Button from "./Button";
import CSVImportModal from "./CSVImportModal";

const BulkActions = ({
  selectedItems,
  onDelete,
  onExport,
  onImport,
  importConfig,
  showImport = true,
  showExport = true,
  showDelete = true,
  className = "",
}) => {
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    if (!selectedItems || !selectedItems.length) {
      alert("Please select items to export");
      return;
    }

    setIsExporting(true);
    try {
      await onExport(selectedItems);
    } catch (error) {
      console.error("Export failed:", error);
    } finally {
      setIsExporting(false);
    }
  };

  const handleDelete = () => {
    if (!selectedItems || !selectedItems.length) {
      alert("Please select items to delete");
      return;
    }

    if (
      window.confirm(
        `Are you sure you want to delete ${selectedItems.length} selected item(s)?`
      )
    ) {
      onDelete(selectedItems);
    }
  };

  const handleImport = (data) => {
    onImport(data);
    setIsImportModalOpen(false);
  };

  if (!selectedItems || selectedItems.length === 0) {
    return null;
  }

  return (
    <>
      <div
        className={`bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 ${className}`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
              {selectedItems?.length || 0} item(s) selected
            </span>
          </div>

          <div className="flex flex-wrap gap-2">
            {showExport && (
              <Button
                variant="outline"
                size="sm"
                icon={<Download size={16} />}
                onClick={handleExport}
                isLoading={isExporting}
                disabled={isExporting}
              >
                Export CSV
              </Button>
            )}

            {showImport && (
              <Button
                variant="outline"
                size="sm"
                icon={<Upload size={16} />}
                onClick={() => setIsImportModalOpen(true)}
              >
                Import CSV
              </Button>
            )}

            {showDelete && (
              <Button
                variant="outline"
                size="sm"
                icon={<Trash size={16} />}
                onClick={handleDelete}
                className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-300"
              >
                Delete Selected
              </Button>
            )}
          </div>
        </div>
      </div>

      {showImport && (
        <CSVImportModal
          isOpen={isImportModalOpen}
          onClose={() => setIsImportModalOpen(false)}
          onImport={handleImport}
          config={importConfig}
        />
      )}
    </>
  );
};

export default BulkActions;
