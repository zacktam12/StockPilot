import React from "react";
import Button from "../../../components/shared/Button";

const SalesErrorState = ({ error, onRetry }) => {
  if (!error) return null;

  return (
    <div className="flex flex-col items-center justify-center h-96 text-red-600">
      <span className="text-2xl font-bold mb-2">Error</span>
      <span className="text-center mb-4">{error}</span>
      <Button variant="primary" onClick={onRetry}>
        Retry
      </Button>
    </div>
  );
};

export default SalesErrorState;
