import React from "react";
import QRScanner from "../../../components/scanner/QRScanner";

const QRScannerModal = ({ isOpen, onClose, onScan }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl max-w-lg w-full">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Scan Product QR Code</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ×
          </button>
        </div>

        <QRScanner
          onScanSuccess={(result) => {
            onScan(result);
            onClose();
          }}
          onScanError={(error) => {
            console.error("QR Scan Error:", error);
          }}
        />
      </div>
    </div>
  );
};

export default QRScannerModal;
