import React from "react";
import { Plus, Download, Upload, QrCode } from "lucide-react";
import Button from "../../../components/shared/Button";
import { exportPurchasesToCSV } from "../../../utils/csvUtils";

const PurchaseHeader = ({ 
  filteredPurchases, 
  onOpenImportModal, 
  onOpenQRScanner, 
  onOpenNewPurchase 
}) => {
  const handleExportCSV = () => {
    exportPurchasesToCSV(filteredPurchases);
  };

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <h1 className="text-2xl font-bold">Purchases</h1>
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
          variant="outline"
          size="md"
          icon={<QrCode size={16} />}
          onClick={onOpenQRScanner}
        >
          Scan QR Code
        </Button>
        <Button
          variant="primary"
          size="md"
          icon={<Plus size={16} />}
          onClick={onOpenNewPurchase}
        >
          Create Purchase Order
        </Button>
      </div>
    </div>
  );
};

export default PurchaseHeader;
