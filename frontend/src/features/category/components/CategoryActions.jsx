import React from "react";
import { useDispatch, useSelector } from "react-redux";
import NewCategoryDrawer from "../drawers/NewCategoryDrawer";
import {
  closeModal,
} from "../../../store/slices/categorySlice";

const CategoryActions = () => {
  const dispatch = useDispatch();
  const {
    modal,
  } = useSelector((state) => state.category);

  // Safely destructure modal properties with fallbacks
  const {
    isOpen = false,
    mode = "create",
    currentCategory = null,
  } = modal || {};

  return (
    <>
      {/* Category Drawer */}
      <NewCategoryDrawer
        category={currentCategory}
        isOpen={isOpen}
        onClose={() => dispatch(closeModal())}
      />
    </>
  );
};

export default CategoryActions;
