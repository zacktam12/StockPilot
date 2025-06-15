// src/components/shared/spinner.jsx
import { useSelector } from "react-redux";

export default function Spinner() {
  const { isLoading, loadingMessage } = useSelector((state) => state.loading);

  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-[9999] flex items-center justify-center">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl flex flex-col items-center min-w-[200px]">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary-500 mb-3"></div>
        {loadingMessage && (
          <p className="text-gray-700 dark:text-gray-300 text-sm">
            {loadingMessage}
          </p>
        )}
      </div>
    </div>
  );
}
