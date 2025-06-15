// src/components/shared/LoadingOverlay.jsx
import Spinner from "./Spinner";

const LoadingOverlay = ({ size = "md" }) => (
  <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-10">
    <Spinner size={size} />
  </div>
);

export default LoadingOverlay;
