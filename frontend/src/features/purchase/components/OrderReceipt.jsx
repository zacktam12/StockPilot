import React, { useRef } from "react";
import { Printer, Download } from "lucide-react";
import { useSelector } from "react-redux";
import Button from "../../../components/shared/Button";
import Badge from "../../../components/shared/Badge";
import { useReactToPrint } from "react-to-print";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

const OrderReceipt = React.forwardRef((props, ref) => {
  const { orderId, items = [], totalAmount, date, type, status } = props;
  const companyInfo = useSelector((state) => state.settings.companyInfo);
  const componentRef = useRef();

  // Merge refs
  React.useImperativeHandle(ref, () => componentRef.current);

  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
    documentTitle: `${type}_receipt_${orderId}`,
    onBeforeGetContent: () => {
      document.body.classList.add("printing");
      return Promise.resolve();
    },
    onAfterPrint: () => {
      document.body.classList.remove("printing");
    },
    removeAfterPrint: true,
    pageStyle: `
      @page { 
        size: auto; 
        margin: 5mm; 
      }
      @media print {
        body { 
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
        .print-container {
          width: 100% !important;
          max-width: 100% !important;
          padding: 0 !important;
          margin: 0 !important;
          box-shadow: none !important;
          border: none !important;
        }
        .no-print {
          display: none !important;
        }
      }
    `,
  });

  const handleDownloadPDF = () => {
    const input = componentRef.current;

    html2canvas(input, {
      scale: 3,
      useCORS: true,
      allowTaint: true,
      logging: false,
      backgroundColor: "#FFFFFF",
    }).then((canvas) => {
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const marginLeft = 10;
      const marginRight = 10;
      const marginTop = 15;
      const marginBottom = 15;
      const contentWidth = pageWidth - marginLeft - marginRight;
      const imgWidth = contentWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      pdf.addImage(imgData, "PNG", marginLeft, marginTop, imgWidth, imgHeight);
      pdf.save(`${type}_receipt_${orderId}.pdf`);
    });
  };

  const formatDate = (dateString) => {
    const options = {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
    return new Date(dateString).toLocaleDateString("en-US", options);
  };

  return (
    <div className="p-6 bg-white rounded-lg">
      <div ref={componentRef} className="print-container">
        {/* Company Header */}
        <div className="text-center mb-6">
          {companyInfo?.logo && (
            <img
              src={companyInfo.logo}
              alt="Company Logo"
              className="h-16 mx-auto mb-2"
            />
          )}
          <h1 className="text-2xl font-bold">
            {companyInfo?.name || "Your Company"}
          </h1>
          <p className="text-sm text-gray-600">
            {companyInfo?.address || "123 Business St, City"}
          </p>
          <p className="text-sm text-gray-600">
            {companyInfo?.contact || "Phone: (123) 456-7890"}
          </p>
        </div>

        {/* Receipt Header */}
        <div className="mb-6 text-center border-b pb-4">
          <h2 className="text-xl font-bold mb-2">
            {type === "sale" ? "SALES RECEIPT" : "PURCHASE ORDER"}
          </h2>
          <div className="flex justify-center items-center gap-4 mb-2">
            <p className="text-sm">Order #: {orderId}</p>
            <Badge variant={status === "completed" ? "success" : "warning"}>
              {status?.toUpperCase() || "PENDING"}
            </Badge>
          </div>
          <p className="text-sm text-gray-600">Date: {formatDate(date)}</p>
        </div>

        {/* Items Table */}
        <table className="w-full mb-6">
          <thead>
            <tr className="border-b">
              <th className="text-left pb-2">Item</th>
              <th className="text-right pb-2">Qty</th>
              <th className="text-right pb-2">Price</th>
              <th className="text-right pb-2">Total</th>
            </tr>
          </thead>
          <tbody>
            {items.length > 0 ? (
              items.map((item, index) => (
                <tr key={index} className="border-b">
                  <td className="py-3">{item.name}</td>
                  <td className="text-right py-3">{item.quantity}</td>
                  <td className="text-right py-3">${item.price?.toFixed(2)}</td>
                  <td className="text-right py-3">
                    ${(item.quantity * item.price)?.toFixed(2)}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="text-center py-4">
                  No items found
                </td>
              </tr>
            )}
          </tbody>
          <tfoot>
            <tr className="font-bold border-t">
              <td colSpan={3} className="text-right py-3">
                Subtotal:
              </td>
              <td className="text-right py-3">${totalAmount?.toFixed(2)}</td>
            </tr>
            <tr className="font-bold">
              <td colSpan={3} className="text-right py-2">
                Tax:
              </td>
              <td className="text-right py-2">$0.00</td>
            </tr>
            <tr className="font-bold border-t-2">
              <td colSpan={3} className="text-right py-2">
                Total:
              </td>
              <td className="text-right py-2">${totalAmount?.toFixed(2)}</td>
            </tr>
          </tfoot>
        </table>

        {/* Footer */}
        <div className="mt-8 pt-4 border-t text-center">
          <p className="text-sm text-gray-600 mb-2">
            Thank you for your business!
          </p>
          <p className="text-xs text-gray-500">
            {companyInfo?.returnPolicy || "All sales are final"}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {companyInfo?.contactEmail || "Email: support@company.com"}
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-4 flex justify-end no-print gap-2">
        <Button
          variant="outline"
          onClick={handlePrint}
          icon={<Printer size={16} />}
        >
          Print
        </Button>
        <Button
          variant="primary"
          onClick={handleDownloadPDF}
          icon={<Download size={16} />}
        >
          Download PDF
        </Button>
      </div>
    </div>
  );
});

OrderReceipt.displayName = "OrderReceipt";

export default OrderReceipt;
