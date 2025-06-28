import { AlertCircle, Clock } from "lucide-react";

export default function LockoutMessage({ lockoutTime, isVisible }) {
  if (!isVisible) return null;

  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-2">
      <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0" />
      <div className="text-sm text-red-800">
        <p className="font-medium">Account temporarily locked</p>
        <p className="flex items-center gap-1 mt-1">
          <Clock className="h-3 w-3" />
          Try again in {lockoutTime} seconds
        </p>
      </div>
    </div>
  );
}
