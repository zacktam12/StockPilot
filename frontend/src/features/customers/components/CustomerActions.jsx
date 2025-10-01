import React from "react";
import BulkActions from "../../../components/shared/BulkActions";
import NewCustomerModal from "../modals/NewCustomerModal";
import CSVImportModal from "../../../components/shared/CSVImportModal";
import { validateCustomerCSV } from "../../../utils/csvUtils";

const CustomerActions = ({ 
  selected, 
  onDelete, 
  onExport, 
  onImport, 
  isImportModalOpen, 
  onCloseImportModal 
}) => {
  return (
    <>
      {/* Bulk Actions */}
      <BulkActions
        selectedItems={selected}
        onDelete={(ids) => ids.forEach(onDelete)}
        onExport={onExport}
        onImport={onImport}
        importConfig={{ validate: validateCustomerCSV }}
        showImport={false}
        showExport={true}
        showDelete={true}
      />

      {/* Customer Modal */}
      <NewCustomerModal />

      {/* CSV Import Modal */}
      <CSVImportModal
        isOpen={isImportModalOpen}
        onClose={onCloseImportModal}
        onImport={onImport}
        config={{ validate: validateCustomerCSV }}
      />
    </>
  );
};

export default CustomerActions;
