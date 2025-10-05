import React from "react";
import { format } from "date-fns";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { Download } from "lucide-react";
import Button from "../../../components/shared/Button";

const ReportActions = ({ currentReport, onDownloadPDF }) => {
  if (!currentReport) return null;

  const downloadPDF = () => {
    const doc = new jsPDF();
    const title = currentReport.title;
    const date = format(new Date(), "yyyy-MM-dd HH:mm:ss");

    doc.setFontSize(18);
    doc.text(title, 14, 20);
    doc.setFontSize(12);
    doc.text(`Generated on: ${date}`, 14, 30);

    autoTable(doc, {
      head: [currentReport.columns],
      body: currentReport.data.map((item) => {
        switch (currentReport.title) {
          case "Daily Sales Report":
            return [
              format(new Date(item.created_at), "yyyy-MM-dd"),
              item.id,
              item.customer?.name || item.customer_name || "Unknown",
              `$${Number(item.total_amount).toFixed(2)}`,
              item.status,
            ];
          case "Inventory Status Report":
            return [
              item.name,
              item.category_name || "Uncategorized",
              item.quantity,
              `$${Number(item.price).toFixed(2)}`,
              item.quantity < 10 ? "Low Stock" : "In Stock",
            ];
          case "Purchase Orders Report":
            return [
              format(new Date(item.created_at), "yyyy-MM-dd"),
              item.id,
              item.supplier_name || "Unknown",
              `$${Number(item.total_amount).toFixed(2)}`,
              item.status,
            ];
          case "Monthly Revenue Report":
            return [
              format(new Date(item.month), "yyyy-MM"),
              `$${Number(item.total).toFixed(2)}`,
            ];
          case "Top Selling Products Report":
            return [item.product_name, item.total_sold];
          case "Low Stock Items Report":
            return [
              item.name,
              item.category_name || "Uncategorized",
              item.quantity,
              "Low Stock",
            ];
          case "Inventory Valuation Report":
            return [
              item.name,
              item.category_name || "Uncategorized",
              item.quantity,
              `$${item.price.toFixed(2)}`,
              `$${item.total_value.toFixed(2)}`,
            ];
          case "Supplier Analysis Report":
            return [
              item.supplier_name,
              item.total_orders,
              `$${item.total_spent.toFixed(2)}`,
            ];
          case "Cost Analysis Report":
            return [
              item.product_name,
              item.total_purchased,
              `$${item.total_cost.toFixed(2)}`,
            ];
          default:
            return [];
        }
      }),

      startY: 40,
    });

    doc.save(`${title.toLowerCase().replace(/\s+/g, "-")}-${date}.pdf`);
  };

  return (
    <div className="flex justify-end mb-4">
      <Button
        variant="outline"
        size="sm"
        icon={<Download size={16} />}
        onClick={downloadPDF}
      >
        Download PDF
      </Button>
    </div>
  );
};

export default ReportActions;
