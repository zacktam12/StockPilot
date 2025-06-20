import { BarsSpinner } from "./Spinner";

const CardLoaderOverlay = ({ className = "" }) => (
  <div
    className={`absolute inset-0 flex items-center justify-center bg-black/40 dark:bg-white/20 z-50 rounded-lg ${className}`}
  >
    <BarsSpinner />
  </div>
);

export default CardLoaderOverlay;
