import React from "react";
import { Dialog } from "@headlessui/react";
import BulkActions from "../../../components/shared/BulkActions";
import NewSaleDrawer from "../drawers/NewSaleDrawer";
import OrderReceipt from "./OrderReceipt";
import CSVImportModal from "../../../components/shared/CSVImportModal";
import Button from "../../../components/shared/Button";

const SalesActions = ({ 
  selectedRows, 
  onBulkDelete, 
  onBulkExport, 
  onBulkImport, 
  isNewSaleOpen, 
  onCloseNewSale, 
  onNewSaleSuccess,
  selectedSale,
  isReceiptOpen,
  onCloseReceipt,
  editSale,
  isEditModalOpen,
  onCloseEditModal,
  onEditSaleSuccess,
  isDeleteModalOpen,
  onCloseDeleteModal,
  onConfirmDelete,
  isImportModalOpen,
  onCloseImportModal
}) => {
  return (
    <>
      {/* Bulk Actions */}
      {selectedRows.length > 0 && (
        <BulkActions
          selectedItems={selectedRows}
          onDelete={onBulkDelete}
          onExport={onBulkExport}
          onImport={onBulkImport}
          importConfig={{}}
          showImport={false}
          showExport={true}
          showDelete={true}
          className="mb-4"
        />
      )}

      {/* New Sale Drawer */}
      <NewSaleDrawer
        isOpen={isNewSaleOpen}
        onClose={onCloseNewSale}
        onSuccess={onNewSaleSuccess}
        sale={null}
      />

      {/* Edit Sale Drawer */}
      <NewSaleDrawer
        isOpen={isEditModalOpen}
        onClose={onCloseEditModal}
        onSuccess={onEditSaleSuccess}
        sale={editSale}
      />

      {/* Order Receipt Modal */}
      {isReceiptOpen && selectedSale && (
        <Dialog
          open={isReceiptOpen}
          onClose={onCloseReceipt}
          className="relative z-50"
        >
          <div className="fixed inset-0 bg-black/30 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                <h3 className="text-lg font-semibold">Order Receipt</h3>
                <button
                  onClick={onCloseReceipt}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="p-6">
                <OrderReceipt
                  orderId={selectedSale.id}
                  items={selectedSale.items || []}
                  totalAmount={selectedSale.totalPrice || selectedSale.total_amount || 0}
                  date={selectedSale.createdAt || selectedSale.created_at}
                  type="sale"
                  status={selectedSale.status}
                />
              </div>
            </div>
          </div>
        </Dialog>
      )}

      {/* CSV Import Modal */}
      <CSVImportModal
        isOpen={isImportModalOpen}
        onClose={() => onCloseImportModal(false)}
        onImport={onBulkImport}
        config={{
          validate: () => ({ isValid: true, errors: [] }),
          templateHeaders: [
            "Sale ID",
            "Customer",
            "Total Price",
            "Status",
            "Payment Method",
            "Date",
          ],
          title: "Import Sales from CSV",
          importButtonLabel: "Import Sales",
        }}
      />

      {/* Delete confirmation modal */}
      <Dialog
        open={isDeleteModalOpen}
        onClose={onCloseDeleteModal}
      >
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl max-w-sm w-full">
            <Dialog.Title className="text-lg font-semibold mb-2">
              Confirm Delete
            </Dialog.Title>
            <Dialog.Description className="mb-4">
              Are you sure you want to delete this sale?
            </Dialog.Description>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={onCloseDeleteModal}
              >
                Cancel
              </Button>
              <Button variant="danger" onClick={onConfirmDelete}>
                Delete
              </Button>
            </div>
          </div>
        </div>
      </Dialog>
    </>
  );
};

export default SalesActions;
