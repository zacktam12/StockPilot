import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

// Example: Checks for a token in localStorage to determine authentication
const useAuthCheck = () => {
  const [isAuthChecked, setIsAuthChecked] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      navigate("/login");
    } else {
      setIsAuthChecked(true);
    }
  }, [navigate]);

  return isAuthChecked;
};

export default useAuthCheck;
