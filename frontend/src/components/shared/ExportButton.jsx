// ExportButton.jsx
import React from "react";
import Button from "./button";
import { Download } from "lucide-react";
import jsPDF from "jspdf";
import { toast } from "react-hot-toast";
import { showSuccess, showError, showWarning } from "../../services/notificationService";

const ExportButton = ({ reportType, reportData, reportTitle, isLoading }) => {
  const exportPDF = () => {
    if (isLoading) {
      showWarning("Please Wait", "Please wait for the report to load before exporting.", 4000);
      return;
    }

    if (!reportType || !reportData) {
      showError("No Report Data", "Please select and view a report before exporting.", 4000);
      return;
    }

    try {
      toast.loading("Generating PDF...", { id: "pdf-generation" });

      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();

      // Add report title
      doc.setFontSize(20);
      doc.text(reportTitle, pageWidth / 2, 15, { align: "center" });

      // Add date
      doc.setFontSize(10);
      const dateStr = new Date().toLocaleString();
      doc.text(`Generated: ${dateStr}`, pageWidth - 10, 10, { align: "right" });

      // Add report data
      doc.setFontSize(12);
      let yPosition = 30;

      // Handle different report types
      switch (reportType) {
        case "sales-overview":
          doc.text(
            `Total Sales: $${reportData.totalSales?.toFixed(2) || "0.00"}`,
            15,
            yPosition
          );
          yPosition += 10;
          doc.text(
            `Avg Order Value: $${
              reportData.avgOrderValue?.toFixed(2) || "0.00"
            }`,
            15,
            yPosition
          );
          yPosition += 10;
          doc.text(
            `Top Product: ${reportData.topProduct?.name || "N/A"}`,
            15,
            yPosition
          );
          yPosition += 15;

          if (reportData.recentOrders?.length > 0) {
            doc.text("Recent Orders:", 15, yPosition);
            yPosition += 10;

            reportData.recentOrders.forEach((order, idx) => {
              if (yPosition > 280) {
                doc.addPage();
                yPosition = 20;
              }

              doc.text(
                `• ${order.customerName || "Guest"}: $${
                  order.amount?.toFixed(2) || "0.00"
                }`,
                20,
                yPosition
              );
              yPosition += 8;
            });
          }
          break;

        case "inventory-status":
          doc.text(
            `Low Stock Items: ${reportData.lowStockItems?.length || 0}`,
            15,
            yPosition
          );
          yPosition += 10;
          doc.text(
            `Out of Stock: ${reportData.outOfStockItems?.length || 0}`,
            15,
            yPosition
          );
          yPosition += 10;
          doc.text(
            `Total Inventory Value: $${
              reportData.totalInventoryValue?.toFixed(2) || "0.00"
            }`,
            15,
            yPosition
          );
          yPosition += 15;

          if (reportData.lowStockItems?.length > 0) {
            doc.text("Low Stock Items:", 15, yPosition);
            yPosition += 10;

            reportData.lowStockItems.forEach((item, idx) => {
              if (yPosition > 280) {
                doc.addPage();
                yPosition = 20;
              }

              doc.text(
                `• ${item.name} (${item.category || "Uncategorized"}): ${
                  item.quantity
                } units`,
                20,
                yPosition
              );
              yPosition += 8;
            });
          }
          break;

        default:
          // Generic output for other reports
          Object.entries(reportData).forEach(([key, value]) => {
            if (yPosition > 280) {
              doc.addPage();
              yPosition = 20;
            }

            if (typeof value === "object") {
              doc.text(`${key}:`, 15, yPosition);
              yPosition += 8;
              Object.entries(value).forEach(([subKey, subValue]) => {
                doc.text(
                  `  • ${subKey}: ${JSON.stringify(subValue)}`,
                  20,
                  yPosition
                );
                yPosition += 8;
              });
            } else {
              doc.text(`${key}: ${value}`, 15, yPosition);
              yPosition += 10;
            }
          });
      }

      // Save PDF
      doc.save(
        `${reportTitle.replace(/\s+/g, "_")}_${new Date()
          .toISOString()
          .slice(0, 10)}.pdf`
      );
      showSuccess("PDF Exported", "PDF has been exported successfully!", 4000);
      toast.success("PDF exported successfully!", { id: "pdf-generation" });
    } catch (error) {
      console.error("PDF export failed:", error);
      showError("Export Failed", `PDF export failed: ${error.message}`, 5000);
      toast.error(`PDF export failed: ${error.message}`, {
        id: "pdf-generation",
      });
    }
  };

  return (
    <Button
      variant="outline"
      onClick={exportPDF}
      className="flex items-center bg-[#3f51b5] hover:bg-[#303f9f] text-white px-4 py-2 rounded-lg transition"
      disabled={isLoading}
    >
      <Download className="mr-2 h-4 w-4" />
      Export PDF
    </Button>
  );
};

export default ExportButton;
