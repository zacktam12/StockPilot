import React from "react";
import NewPurchaseDrawer from "../drawers/NewPurchaseDrawer";

const PurchaseActions = ({ 
  isNewPurchaseOpen, 
  onCloseNewPurchase, 
  onNewPurchaseSuccess
}) => {
  return (
    <>

      {/* New Purchase Drawer */}
      <NewPurchaseDrawer
        isOpen={isNewPurchaseOpen}
        onClose={onCloseNewPurchase}
      />
    </>
  );
};

export default PurchaseActions;
