// src/hooks/useLoading.js
import { useSelector } from "react-redux";
import Spinner from "../components/shared/Spinner";

export const useLoading = () => {
  const isLoading = useSelector(
    (state) =>
      state.app.loading || state.products.loading || state.sales.loading
    // Add other slice loading states
  );

  const LoadingOverlay = () =>
    isLoading && (
      <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-50">
        <Spinner size="md" />
      </div>
    );

  return { isLoading, LoadingOverlay };
};
