// src/App.jsx
import React from "react";
import { useSelector } from "react-redux";
import AppRoutes from "./routes/AppRoutes";
import LoadingOverlay from "./components/shared/LoadingOverlay";

function App() {
  console.log("✅ App rendered");
  // Use only the global loading state
  const isLoading = useSelector((state) => state.loading.isLoading);

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900 relative">
      {isLoading && <LoadingOverlay />}
      <AppRoutes />
    </div>
  );
}

export default App;
