import React, { useState, useRef } from "react";
import {
  Upload,
  FileText,
  CheckCircle,
  AlertCircle,
  X,
  Download,
  Eye,
  EyeOff,
} from "lucide-react";
import Button from "./Button";
import { parseCSV, validateUserCSV } from "../../utils/csvUtils";
import { useOutsideClick } from "../../hooks/useOutsideClick";

const CSVImportModal = ({
  isOpen,
  onClose,
  onImport,
  config = {},
  entityType = "users",
  title = "Import from CSV",
  description = "Select a CSV file with data to import",
}) => {
  const fileInputRef = useRef(null);
  const modalRef = useRef(null);

  // Add outside click functionality
  useOutsideClick(modalRef, () => {
    if (isOpen) handleClose();
  });

  const [file, setFile] = useState(null);
  const [csvData, setCsvData] = useState(null);
  const [validationErrors, setValidationErrors] = useState([]);
  const [isValid, setIsValid] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [importedCount, setImportedCount] = useState(0);
  const [error, setError] = useState(null);

  const handleFileSelect = async (event) => {
    const selectedFile = event.target.files[0];
    if (!selectedFile) return;

    if (!selectedFile.name.endsWith(".csv")) {
      setError("Please select a valid CSV file");
      return;
    }

    setFile(selectedFile);
    setError(null);
    setValidationErrors([]);
    setIsValid(false);
    setCsvData(null);

    try {
      const text = await selectedFile.text();
      const parsed = parseCSV(text);
      setCsvData(parsed);

      // Validate the data
      const validation = config.validate
        ? config.validate(parsed.data)
        : validateUserCSV(parsed.data);
      setValidationErrors(validation.errors || []);
      setIsValid(validation.isValid);
    } catch (err) {
      setError(`Error parsing CSV file: ${err.message}`);
    }
  };

  const handleImport = async () => {
    if (!isValid || !csvData) return;

    setLoading(true);
    setError(null);

    try {
      await onImport(csvData.data);
      setImportedCount(csvData.data.length);

      setTimeout(() => {
        handleClose();
      }, 2000);
    } catch (err) {
      setError(err.message || "Failed to import users");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFile(null);
    setCsvData(null);
    setValidationErrors([]);
    setIsValid(false);
    setError(null);
    setImportedCount(0);
    onClose();
  };

  const downloadTemplate = () => {
    let template;
    let filename;

    switch (entityType) {
      case "customers":
        template = [
          "Name,Email,Phone,Address",
          "John Doe,john@example.com,1234567890,123 Main St",
          "Jane Smith,jane@example.com,0987654321,456 Oak Ave",
        ].join("\n");
        filename = "customer-import-template.csv";
        break;
      case "suppliers":
        template = [
          "Name,Contact Name,Email,Phone,Address,Company Name",
          "ABC Corp,John Manager,john@abc.com,1234567890,123 Business St,ABC Corporation",
        ].join("\n");
        filename = "supplier-import-template.csv";
        break;
      default: // users
        template = [
          "First Name,Last Name,Email,Phone,Employee ID,Role,Status",
          "John,Doe,john@example.com,1234567890,EMP001,admin,Active",
        ].join("\n");
        filename = "user-import-template.csv";
        break;
    }

    const blob = new Blob([template], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-lg flex items-center justify-center z-50 p-4">
      <div
        ref={modalRef}
        className="bg-white dark:bg-gray-800 text-gray-800 dark:text-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">{title}</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <X size={20} />
            </Button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Success Message */}
          {importedCount > 0 && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md flex items-center gap-2">
              <CheckCircle size={16} />
              Successfully imported {importedCount} users!
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md flex items-center gap-2">
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          {/* File Upload Section */}
          <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6">
            <div className="text-center">
              <Upload size={48} className="mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Upload CSV File
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {description}
              </p>

              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button
                  variant="primary"
                  onClick={() => fileInputRef.current?.click()}
                  icon={<FileText size={16} />}
                >
                  Choose File
                </Button>
                <Button
                  variant="outline"
                  onClick={downloadTemplate}
                  icon={<Download size={16} />}
                >
                  Download Template
                </Button>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleFileSelect}
                className="hidden"
              />

              {file && (
                <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-md">
                  <div className="flex items-center gap-2">
                    <FileText size={16} className="text-blue-600" />
                    <span className="text-sm font-medium">{file.name}</span>
                    <span className="text-xs text-gray-500">
                      ({(file.size / 1024).toFixed(1)} KB)
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Validation Errors */}
          {validationErrors.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <h4 className="font-medium text-red-800 mb-2">
                Validation Errors:
              </h4>
              <ul className="text-sm text-red-700 space-y-1">
                {validationErrors.map((error, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <AlertCircle size={14} className="mt-0.5 flex-shrink-0" />
                    {error}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Data Preview */}
          {csvData && (
            <div className="border border-gray-200 dark:border-gray-700 rounded-md">
              <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                <h4 className="font-medium text-gray-900 dark:text-white">
                  Data Preview ({csvData.data.length} users)
                </h4>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowPreview(!showPreview)}
                  icon={showPreview ? <EyeOff size={16} /> : <Eye size={16} />}
                >
                  {showPreview ? "Hide" : "Show"} Preview
                </Button>
              </div>

              {showPreview && (
                <div className="p-4  max-h-64 overflow-y-auto">
                  <div className="overflow-x-auto ">
                    <table className="min-w-full text-sm">
                      <thead>
                        <tr className="border-b border-gray-200 dark:border-gray-700">
                          {csvData.headers.map((header, index) => (
                            <th
                              key={index}
                              className="text-left py-2 px-2 font-medium"
                            >
                              {header}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {csvData.data.slice(0, 5).map((row, rowIndex) => (
                          <tr
                            key={rowIndex}
                            className="border-b border-gray-100 dark:border-gray-800"
                          >
                            {csvData.headers.map((header, colIndex) => (
                              <td key={colIndex} className="py-2 px-2">
                                {row[header] || "-"}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {csvData.data.length > 5 && (
                      <p className="text-xs text-gray-500 mt-2">
                        Showing first 5 rows of {csvData.data.length} total rows
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleImport}
              disabled={!isValid || loading}
              isLoading={loading}
            >
              Import Users
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CSVImportModal;
