import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

// Example: Checks for a token in localStorage to determine authentication
const useAuthCheck = () => {
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem("authToken");
      const userRole = localStorage.getItem("userRole");
      const userEmail = localStorage.getItem("userEmail");

      if (!token || !userRole || !userEmail) {
        // Clear any invalid data
        localStorage.removeItem("authToken");
        localStorage.removeItem("userRole");
        localStorage.removeItem("userName");
        localStorage.removeItem("userEmail");
        navigate("/login");
        return;
      }

      // Token exists and user data is present
      setIsLoading(false);
    };

    checkAuth();
  }, [navigate]);

  return { isLoading };
};

export default useAuthCheck;
