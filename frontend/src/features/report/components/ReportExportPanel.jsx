import React, { useState } from "react";
import { 
  Download, 
  FileText, 
  FileSpreadsheet, 
  Clock
} from "lucide-react";
import { format } from "date-fns";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import Button from "../../../components/shared/Button";

const ReportExportPanel = ({ report, data }) => {
  const [isExporting, setIsExporting] = useState(false);
  const [exportFormat, setExportFormat] = useState("pdf");
  const [includeCharts, setIncludeCharts] = useState(true);
  const [includeInsights, setIncludeInsights] = useState(true);

  const exportFormats = [
    { id: "pdf", label: "PDF", icon: FileText },
    { id: "excel", label: "Excel", icon: FileSpreadsheet },
    { id: "csv", label: "CSV", icon: FileText }
  ];

  const exportToPDF = async () => {
    setIsExporting(true);
    try {
      const doc = new jsPDF();
      const title = report.title;
      
      // Add title
      doc.setFontSize(16);
      doc.text(title, 14, 22);
      
      // Add generation date
      doc.setFontSize(10);
      doc.text(`Generated: ${format(report.generatedAt, 'MMM dd, yyyy HH:mm')}`, 14, 30);
      
      // Add table
      const columns = report.columns || Object.keys(data[0] || {});
      const rows = data.map(item => columns.map(col => {
        // Handle different field name mappings
        const value = item[col] || item[col.toLowerCase().replace(/\s+/g, '_')] || item[col.toLowerCase().replace(/\s+/g, '')] || '';
        return typeof value === 'object' ? JSON.stringify(value) : String(value);
      }));
      
      autoTable(doc, {
        head: [columns],
        body: rows,
        startY: 40,
        styles: { fontSize: 8 },
        headStyles: { fillColor: [66, 139, 202] }
      });
      
      doc.save(`${title.replace(/\s+/g, '_')}.pdf`);
    } catch (error) {
      console.error("Error generating PDF:", error);
    } finally {
      setIsExporting(false);
    }
  };

  const exportToExcel = async () => {
    setIsExporting(true);
    try {
      const columns = report.columns || Object.keys(data[0] || {});
      
      // Map data to ensure proper field names
      const mappedData = data.map(item => {
        const mappedItem = {};
        columns.forEach(col => {
          const value = item[col] || item[col.toLowerCase().replace(/\s+/g, '_')] || item[col.toLowerCase().replace(/\s+/g, '')] || '';
          mappedItem[col] = typeof value === 'object' ? JSON.stringify(value) : String(value);
        });
        return mappedItem;
      });
      
      const worksheet = XLSX.utils.json_to_sheet(mappedData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Report");
      XLSX.writeFile(workbook, `${report.title.replace(/\s+/g, '_')}.xlsx`);
    } catch (error) {
      console.error("Error generating Excel:", error);
    } finally {
      setIsExporting(false);
    }
  };

  const exportToCSV = async () => {
    setIsExporting(true);
    try {
      const columns = report.columns || Object.keys(data[0] || {});
      const csvContent = [
        columns.join(','),
        ...data.map(row => columns.map(col => {
          // Handle different field name mappings
          const value = row[col] || row[col.toLowerCase().replace(/\s+/g, '_')] || row[col.toLowerCase().replace(/\s+/g, '')] || '';
          const stringValue = typeof value === 'object' ? JSON.stringify(value) : String(value);
          return `"${stringValue.replace(/"/g, '""')}"`;
        }).join(','))
      ].join('\n');
      
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${report.title.replace(/\s+/g, '_')}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error generating CSV:", error);
    } finally {
      setIsExporting(false);
    }
  };

  const handleExport = async () => {
    switch (exportFormat) {
      case "pdf":
        await exportToPDF();
        break;
      case "excel":
        await exportToExcel();
        break;
      case "csv":
        await exportToCSV();
        break;
      default:
        break;
    }
  };

  if (!report || !data) return null;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
      <div className="p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Download className="w-4 h-4 text-blue-600" />
            <h3 className="text-base font-semibold text-gray-900 dark:text-white">Export Report</h3>
          </div>
          <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
            <Clock size={12} />
            <span>{format(report.generatedAt, 'MMM dd, HH:mm')}</span>
          </div>
        </div>

        {/* Export Format Selection */}
        <div className="mb-3">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 block">
            Format
          </label>
          <div className="flex gap-1.5">
            {exportFormats.map((format) => {
              const Icon = format.icon;
              return (
                <button
                  key={format.id}
                  onClick={() => setExportFormat(format.id)}
                  className={`flex items-center gap-1 px-2 py-1.5 rounded-md text-xs font-medium transition-colors ${
                    exportFormat === format.id
                      ? 'bg-blue-100 text-blue-700 border border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-700'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                  }`}
                >
                  <Icon size={12} />
                  {format.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Export Options */}
        <div className="mb-3">
          <div className="flex gap-4">
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={includeCharts}
                onChange={(e) => setIncludeCharts(e.target.checked)}
                className="w-3 h-3 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-xs text-gray-700 dark:text-gray-300">Charts</span>
            </label>
            
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={includeInsights}
                onChange={(e) => setIncludeInsights(e.target.checked)}
                className="w-3 h-3 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-xs text-gray-700 dark:text-gray-300">Insights</span>
            </label>
          </div>
        </div>

        {/* Action Button */}
        <div>
          <button
            onClick={handleExport}
            disabled={isExporting}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-sm font-medium rounded-lg transition-colors"
          >
            {isExporting ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <Download size={14} />
            )}
            {isExporting ? 'Exporting...' : `Export ${exportFormat.toUpperCase()}`}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReportExportPanel;