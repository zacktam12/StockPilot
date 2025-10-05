import React from "react";
import { useDispatch, useSelector } from "react-redux";
import BulkActions from "../../../components/shared/BulkActions";
import NewCustomerModal from "../modals/NewCustomerModal";
import NewCustomerDrawer from "../drawers/NewCustomerDrawer";
import CSVImportModal from "../../../components/shared/CSVImportModal";
import { validateCustomerCSV } from "../../../utils/csvUtils";
import { closeDrawer } from "../../../store/slices/customerSlice";

const CustomerActions = ({ 
  selected, 
  onDelete, 
  onExport, 
  onImport, 
  isImportModalOpen, 
  onCloseImportModal 
}) => {
  const dispatch = useDispatch();
  const {
    isDrawerOpen,
    editingCustomer,
  } = useSelector((state) => state.customer);

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

      {/* Customer Drawer */}
      <NewCustomerDrawer
        customer={editingCustomer}
        isOpen={isDrawerOpen}
        onClose={() => dispatch(closeDrawer())}
      />

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
