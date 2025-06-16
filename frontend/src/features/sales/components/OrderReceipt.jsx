// src/features/sales/components/OrderReceipt.jsx
import React, { useRef } from "react";
import { Printer, Download } from "lucide-react";
import Badge from "../../../components/shared/Badge";
import Button from "../../../components/shared/Button";
import { useReactToPrint } from "react-to-print";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { useSelector } from "react-redux";

const OrderReceipt = React.forwardRef((props, ref) => {
	const { orderId, items, totalAmount, date, type, status } = props;
	const componentRef = useRef();
	const companyInfo = useSelector((state) => state.company?.info || {}); // Assuming you have company info in Redux

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
			scale: 3, // Higher quality
			useCORS: true,
			allowTaint: true,
			logging: false,
			backgroundColor: "#FFFFFF",
		}).then((canvas) => {
			const imgData = canvas.toDataURL("image/png");
			const pdf = new jsPDF("p", "mm", "a4"); // A4 size

			// Calculate dimensions with margins
			const pageWidth = pdf.internal.pageSize.getWidth();
			const pageHeight = pdf.internal.pageSize.getHeight();

			// Add 10mm margins on left/right, 15mm top/bottom
			const marginLeft = 10;
			const marginRight = 10;
			const marginTop = 15;
			const marginBottom = 15;

			// Content area dimensions
			const contentWidth = pageWidth - marginLeft - marginRight;
			const contentHeight = pageHeight - marginTop - marginBottom;

			// Calculate image dimensions to fit content area
			const imgWidth = contentWidth;
			const imgHeight = (canvas.height * imgWidth) / canvas.width;

			// Add image with proper margins
			pdf.addImage(imgData, "PNG", marginLeft, marginTop, imgWidth, imgHeight);

			// Save PDF automatically
			pdf.save(`${type}_receipt_${orderId}.pdf`);
		});
	};

	const safeItems = Array.isArray(items) ? items : []; // Fallback for items

	return (
		<div className="p-6 bg-white rounded-lg">
			<div ref={componentRef} className="print-container">
				{/* Receipt Header */}
				<div className="mb-4 text-center">
					<h2 className="text-2xl font-bold mb-2">
						{type === "sale" ? "SALES RECEIPT" : "PURCHASE ORDER"}
					</h2>
					{companyInfo?.name && (
						<p className="text-sm text-gray-600 mb-1">{companyInfo.name}</p>
					)}
					<div className="flex justify-center items-center gap-2 mb-2">
						<p className="text-sm">Order ID: {orderId}</p>
						<Badge
							variant={
								status === "completed"
									? "success"
									: status === "pending"
									? "warning"
									: "danger"
							}
						>
							{status?.toUpperCase() || ""}
						</Badge>
					</div>
					<p className="text-sm text-gray-600">
						{new Date(date).toLocaleDateString("en-US", {
							year: "numeric",
							month: "short",
							day: "numeric",
							hour: "2-digit",
							minute: "2-digit",
						})}
					</p>
				</div>

				{/* Items Table */}
				<table className="w-full mb-4">
					<thead>
						<tr className="border-b">
							<th className="text-left pb-2">Item</th>
							<th className="text-right pb-2">Qty</th>
							<th className="text-right pb-2">Price</th>
							<th className="text-right pb-2">Total</th>
						</tr>
					</thead>
					<tbody>
						{safeItems.length > 0 ? (
							safeItems.map((item, index) => (
								<tr key={index} className="border-b">
									<td className="py-2">{item.name}</td>
									<td className="text-right py-2">{item.quantity}</td>
									<td className="text-right py-2">${item.price?.toFixed(2)}</td>
									<td className="text-right py-2">
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
						<tr className="font-bold">
							<td colSpan={3} className="text-right py-2">
								Total:
							</td>
							<td className="text-right py-2">${totalAmount?.toFixed(2)}</td>
						</tr>
					</tfoot>
				</table>

				{/* Additional receipt information */}
				<div className="mt-8 pt-4 border-t">
					<p className="text-sm text-gray-600">Thank you for your business!</p>
					{companyInfo?.contactEmail && (
						<p className="text-xs text-gray-500 mt-2">
							For any inquiries, please contact {companyInfo.contactEmail}
						</p>
					)}
				</div>
			</div>

			{/* Print and Download Buttons */}
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
