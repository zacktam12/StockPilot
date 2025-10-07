// src/components/shared/Spinner.jsx

export function BarsSpinner({ color = "#3f51b5" }) {
  return (
    <div className="flex items-center justify-center space-x-2">
      <div
        className="w-2 h-8 animate-bar-fluctuate"
        style={{
          animationDelay: "0s",
          backgroundColor: color,
        }}
      ></div>
      <div
        className="w-2 h-8 animate-bar-fluctuate"
        style={{
          animationDelay: "0.1s",
          backgroundColor: color,
        }}
      ></div>
      <div
        className="w-2 h-8 animate-bar-fluctuate"
        style={{
          animationDelay: "0.2s",
          backgroundColor: color,
        }}
      ></div>
      <div
        className="w-2 h-8 animate-bar-fluctuate"
        style={{
          animationDelay: "0.3s",
          backgroundColor: color,
        }}
      ></div>
      <div
        className="w-2 h-8 animate-bar-fluctuate"
        style={{
          animationDelay: "0.4s",
          backgroundColor: color,
        }}
      ></div>
    </div>
  );
}

export function FullPageSpinner({ message = "Loading..." }) {
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-white/60 dark:bg-black/40 backdrop-blur-sm">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#3f51b5] mb-4" />
        <p className="text-[#3f51b5] text-sm">{message}</p>
      </div>
    </div>
  );
}

export default BarsSpinner;
