// src/components/shared/LoadingContainer.jsx

import PropTypes from "prop-types";
import LoadingOverlay from "./LoadingOverlay";

const LoadingContainer = ({
  children,
  isLoading = false,
  title = "Loading...",
  description = "",
}) => {
  if (isLoading) {
    return (
      <div
        className="fixed inset-0 z-[9999] flex flex-col items-center justify-center
        bg-white/80 dark:bg-black/60 text-gray-900 dark:text-gray-200 transition-colors"
      >
        <h1 className="text-2xl font-semibold mb-2">{title}</h1>
        {description && (
          <p className="text-sm mb-6 text-gray-500 dark:text-gray-300">
            {description}
          </p>
        )}
        <BarsSpinner />
      </div>
    );
  }

  return <>{children}</>;
};

LoadingContainer.propTypes = {
  children: PropTypes.node.isRequired,
  isLoading: PropTypes.bool,
  title: PropTypes.string,
  description: PropTypes.string,
};

export default LoadingContainer;
