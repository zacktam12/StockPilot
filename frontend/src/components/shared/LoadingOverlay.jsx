// src/components/shared/LoadingOverlay.jsx

import { BarsSpinner } from "./Spinner";

const LoadingOverlay = ({ title = "Loading...", description = "" }) => {
  return (
    <div
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center
      bg-white/80 dark:bg-black/60 text-[#3f51b5] dark:text-[#3f51b5] transition-colors"
    >
      <h1 className="text-2xl font-semibold mb-2 text-[#3f51b5] dark:text-[#3f51b5]">
        {title}
      </h1>
      {description && (
        <p className="text-sm mb-6 text-[#3f51b5] dark:text-[#3f51b5]">
          {description}
        </p>
      )}
      <BarsSpinner color="#3f51b5" />
    </div>
  );
};

export default LoadingOverlay;
