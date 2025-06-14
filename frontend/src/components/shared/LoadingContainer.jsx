// src/components/shared/LoadingContainer.jsx
import PropTypes from "prop-types";
import Spinner from "./Spinner";

const LoadingContainer = ({
  children,
  isLoading = false,
  minHeight = "200px",
  background = "bg-white/80",
  zIndex = "z-10",
  spinnerSize = "md",
  className = "",
}) => (
  <div
    className={`relative ${
      minHeight ? `min-h-[${minHeight}]` : ""
    } ${className}`}
    data-testid="loading-container"
  >
    {isLoading && (
      <div
        className={`absolute inset-0 flex items-center justify-center ${background} ${zIndex}`}
        aria-live="polite"
        aria-busy={isLoading}
      >
        <Spinner size={spinnerSize} />
      </div>
    )}
    {children}
  </div>
);

LoadingContainer.propTypes = {
  children: PropTypes.node.isRequired,
  isLoading: PropTypes.bool,
  minHeight: PropTypes.string,
  background: PropTypes.string,
  zIndex: PropTypes.string,
  spinnerSize: PropTypes.oneOf(["sm", "md", "lg"]),
  className: PropTypes.string,
};

export default LoadingContainer;
