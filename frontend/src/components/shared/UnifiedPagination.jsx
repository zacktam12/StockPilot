import React from "react";
import { useDispatch, useSelector } from "react-redux";
import EnhancedPagination from "./EnhancedPagination";
import MobilePagination from "./MobilePagination";
import useIsMobile from "../../hooks/useIsMobile";
import {
  setCurrentPage as setProductCurrentPage,
  setItemsPerPage as setProductItemsPerPage,
} from "../../store/slices/productSlice";
import {
  setCurrentPage as setUserCurrentPage,
  setItemsPerPage as setUserItemsPerPage,
} from "../../store/slices/userSlice";
import {
  setCurrentPage as setCategoryCurrentPage,
  setItemsPerPage as setCategoryItemsPerPage,
} from "../../store/slices/categorySlice";
import {
  setCurrentPage as setSupplierCurrentPage,
  setItemsPerPage as setSupplierItemsPerPage,
} from "../../store/slices/supplierSlice";
import {
  setCurrentPage as setSaleCurrentPage,
  setItemsPerPage as setSaleItemsPerPage,
} from "../../store/slices/salesSlice";
import {
  setCurrentPage as setPurchaseCurrentPage,
  setItemsPerPage as setPurchaseItemsPerPage,
} from "../../store/slices/purchaseSlice";
import {
  setCurrentPage as setCustomerCurrentPage,
  setItemsPerPage as setCustomerItemsPerPage,
} from "../../store/slices/customerSlice";

const UnifiedPagination = ({ 
  sliceName = "product", 
  showPageSizeSelector = true,
  showItemCount = true,
  pageSizeOptions = [5, 10, 25, 50, 100],
  className = "",
}) => {
  const dispatch = useDispatch();
  const { isMobile } = useIsMobile();

  // Get the appropriate slice state based on sliceName
  const getSliceState = (state) => {
    switch (sliceName) {
      case "staff":
        return state.user;
      case "category":
        return state.category;
      case "supplier":
        return state.supplier;
      case "sale":
        return state.sales;
      case "purchase":
        return state.purchase;
      case "customer":
        return state.customer;
      default:
        return state.product;
    }
  };

  // Get the appropriate actions based on sliceName
  const getActions = () => {
    switch (sliceName) {
      case "staff":
        return {
          setCurrentPage: setUserCurrentPage,
          setItemsPerPage: setUserItemsPerPage,
        };
      case "category":
        return {
          setCurrentPage: setCategoryCurrentPage,
          setItemsPerPage: setCategoryItemsPerPage,
        };
      case "supplier":
        return {
          setCurrentPage: setSupplierCurrentPage,
          setItemsPerPage: setSupplierItemsPerPage,
        };
      case "sale":
        return {
          setCurrentPage: setSaleCurrentPage,
          setItemsPerPage: setSaleItemsPerPage,
        };
      case "purchase":
        return {
          setCurrentPage: setPurchaseCurrentPage,
          setItemsPerPage: setPurchaseItemsPerPage,
        };
      case "customer":
        return {
          setCurrentPage: setCustomerCurrentPage,
          setItemsPerPage: setCustomerItemsPerPage,
        };
      default:
        return {
          setCurrentPage: setProductCurrentPage,
          setItemsPerPage: setProductItemsPerPage,
        };
    }
  };

  const sliceState = useSelector(getSliceState);
  const { setCurrentPage, setItemsPerPage } = getActions();

  // Handle different slice structures
  let currentPage, totalPages, totalItems, itemsPerPage;

  if (sliceName === "sale") {
    // Sales slice has pagination nested under pagination object
    currentPage = sliceState.pagination?.currentPage || 1;
    totalPages = sliceState.pagination?.totalPages || 0;
    totalItems = sliceState.pagination?.totalItems || 0;
    itemsPerPage = sliceState.pagination?.itemsPerPage || 10;
  } else {
    // Other slices have pagination properties directly on the state
    currentPage = sliceState.currentPage || 1;
    totalPages = sliceState.totalPages || 0;
    totalItems = sliceState.totalItems || 0;
    itemsPerPage = sliceState.itemsPerPage || 10;
  }

  const handlePageChange = (page) => {
    dispatch(setCurrentPage(page));
  };

  const handlePageSizeChange = (newPageSize) => {
    dispatch(setItemsPerPage(newPageSize));
  };

  // Always show pagination if there are items, even if only one page
  if (totalItems === 0) return null;

  // Use mobile pagination for small screens
  if (isMobile) {
    return (
      <MobilePagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
        totalItems={totalItems}
        itemsPerPage={itemsPerPage}
        className={className}
      />
    );
  }

  // Use enhanced pagination for larger screens
  return (
    <EnhancedPagination
      currentPage={currentPage}
      totalPages={totalPages}
      onPageChange={handlePageChange}
      totalItems={totalItems}
      itemsPerPage={itemsPerPage}
      onPageSizeChange={handlePageSizeChange}
      pageSizeOptions={pageSizeOptions}
      showPageSizeSelector={showPageSizeSelector}
      showItemCount={showItemCount}
      className={className}
    />
  );
};

export default UnifiedPagination;
