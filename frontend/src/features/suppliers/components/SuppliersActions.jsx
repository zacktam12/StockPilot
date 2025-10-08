import React from "react";
import { useDispatch, useSelector } from "react-redux";
import NewSupplierModal from "../modals/NewSupplierModal";
import NewSupplierDrawer from "../drawers/NewSupplierDrawer";
import CSVImportModal from "../../../components/shared/CSVImportModal";
import UnifiedPagination from "../../../components/shared/UnifiedPagination";
import { validateSupplierCSV } from "../../../utils/csvUtils";
import { closeDrawer } from "../../../store/slices/supplierSlice";

const SuppliersActions = ({ 
  selectedItems, 
  onBulkDelete, 
  onBulkExport, 
  onBulkImport, 
  isImportModalOpen, 
  onCloseImportModal 
}) => {
  const dispatch = useDispatch();
  const {
    isDrawerOpen,
    editingSupplier,
  } = useSelector((state) => state.supplier);

  return (
    <>

      {/* Pagination */}
      <UnifiedPagination
        sliceName="supplier"
        showPageSizeSelector={true}
        showItemCount={true}
        pageSizeOptions={[5, 10, 25, 50, 100]}
      />

      {/* New Supplier Modal */}
      <NewSupplierModal />

      {/* Supplier Drawer */}
      <NewSupplierDrawer
        supplier={editingSupplier}
        isOpen={isDrawerOpen}
        onClose={() => dispatch(closeDrawer())}
      />

      {/* CSV Import Modal */}
      <CSVImportModal
        isOpen={isImportModalOpen}
        onClose={onCloseImportModal}
        onImport={onBulkImport}
        title="Import Suppliers"
        description="Upload a CSV file with supplier data"
      />
    </>
  );
};

export default SuppliersActions;
