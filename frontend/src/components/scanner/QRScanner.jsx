import React, { useEffect, useRef } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import { useDispatch } from "react-redux";
import { setScannedData } from "../../store/slices/qrScannerSlice";

const QRScanner = ({ onScanSuccess, onScanError }) => {
  const scannerRef = useRef(null);
  const dispatch = useDispatch();

  useEffect(() => {
    const scanner = new Html5QrcodeScanner(
      "qr-reader",
      { fps: 10, qrbox: { width: 250, height: 250 } },
      false
    );

    scannerRef.current = scanner;

    scanner.render(
      (decodedText) => {
        dispatch(setScannedData(decodedText)); // Redux update
        onScanSuccess?.(decodedText); // still call prop if passed
        scanner.clear();
      },
      (error) => {
        if (onScanError) {
          onScanError(error);
        }
      }
    );

    return () => {
      scanner
        .clear()
        .catch((err) => console.error("Scanner cleanup error:", err));
    };
  }, [dispatch, onScanSuccess, onScanError]);

  return (
    <div className="qr-scanner">
      <div id="qr-reader" className="w-full max-w-md mx-auto"></div>
      <p className="text-center mt-4 text-gray-600">
        Position the QR code within the frame to scan
      </p>
    </div>
  );
};

export default QRScanner;
