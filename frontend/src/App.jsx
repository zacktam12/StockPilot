// src/App.jsx
import React from "react";
import AppRoutes from "./routes/AppRoutes";
import Spinner from "./components/shared/Spinner";

function App() {
  console.log("✅ App rendered");
  return (
    <div className="min-h-screen bg-gray-100 text-gray-900">
      <AppRoutes />
      <Spinner />
    </div>
  );
}

export default App;
