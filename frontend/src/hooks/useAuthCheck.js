import { useEffect, useState } from "react";

const useAuthCheck = () => {
  // Check localStorage immediately to prevent blink
  const initialToken = localStorage.getItem("authToken");
  const [isLoading, setIsLoading] = useState(false); // Set to false for instant load
  const [isAuthenticated, setIsAuthenticated] = useState(!!initialToken); // Start as true if token exists

  useEffect(() => {
    // Simple token existence check - no API call needed
    // The API interceptors will handle actual auth failures (401)
    const token = localStorage.getItem("authToken");
    setIsAuthenticated(!!token);
    setIsLoading(false);
  }, []);

  return { isLoading, isAuthenticated };
};

export default useAuthCheck;
