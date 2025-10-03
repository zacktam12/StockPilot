import React from "react";
import { useDispatch, useSelector } from "react-redux";
import NewProductDrawer from "../drawers/NewProductDrawer";
import {
  closeProductModal,
} from "../../../store/slices/productSlice";

const ProductActions = () => {
  const dispatch = useDispatch();
  const {
    isProductModalOpen,
  } = useSelector((state) => state.product);

  return (
    <>
      {/* Product Drawer - Only for creating new products */}
      <NewProductDrawer
        isOpen={isProductModalOpen}
        onClose={() => dispatch(closeProductModal())}
      />
    </>
  );
};

export default ProductActions;
