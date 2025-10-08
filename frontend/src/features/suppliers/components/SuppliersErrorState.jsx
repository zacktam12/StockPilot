import React from "react";
import { AlertCircle } from "lucide-react";

const SuppliersErrorState = ({ error }) => {
  if (!error) return null;

  return (
    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md flex items-center gap-2">
      <AlertCircle size={16} />
      {error}
    </div>
  );
};

export default SuppliersErrorState;
