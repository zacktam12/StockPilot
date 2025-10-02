import React from "react";
import BulkActions from "../../../components/shared/BulkActions";
import NewPurchaseModal from "./NewPurchaseModal";
import QRScannerModal from "../../sales/components/QRScannerModal";
import CSVImportModal from "../../../components/shared/CSVImportModal";
import { validatePurchaseCSV } from "../../../utils/csvUtils";

const PurchaseActions = ({ 
  selectedItems, 
  onBulkDelete, 
  onBulkExport, 
  onBulkImport, 
  isNewPurchaseOpen, 
  onCloseNewPurchase, 
  onNewPurchaseSuccess,
  isQRScannerOpen, 
  onCloseQRScanner, 
  onQRScan,
  isImportModalOpen, 
  onCloseImportModal 
}) => {
  return (
    <>
      {/* Bulk Actions */}
      <BulkActions
        selectedItems={selectedItems}
        onDelete={onBulkDelete}
        onExport={onBulkExport}
        onImport={onBulkImport}
        importConfig={{}}
        showImport={false}
        showExport={true}
        showDelete={true}
        className="mb-4"
      />

      {/* New Purchase Modal */}
      <NewPurchaseModal
        isOpen={isNewPurchaseOpen}
        onClose={onCloseNewPurchase}
        onSuccess={onNewPurchaseSuccess}
      />

      {/* QR Scanner Modal */}
      <QRScannerModal
        isOpen={isQRScannerOpen}
        onClose={onCloseQRScanner}
        onScan={onQRScan}
      />

      {/* CSV Import Modal */}
      <CSVImportModal
        isOpen={isImportModalOpen}
        onClose={onCloseImportModal}
        onImport={onBulkImport}
        config={{
          validate: validatePurchaseCSV,
          templateHeaders: [
            "Purchase Order",
            "Date & Time",
            "Supplier",
            "Total Amount",
            "Status",
          ],
          title: "Import Purchases from CSV",
          importButtonLabel: "Import Purchases",
        }}
      />
    </>
  );
};

export default PurchaseActions;
