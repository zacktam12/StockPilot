import React from "react";

const UsersErrorState = ({ error }) => {
  if (!error) return null;

  return (
    <div className="flex flex-col items-center justify-center h-96 text-red-600">
      <span className="text-2xl font-bold mb-2">Error</span>
      <span>{error}</span>
    </div>
  );
};

export default UsersErrorState;
