// ThemeProvider.jsx

import React, { createContext, useContext, useEffect, useState } from "react";
import { useSelector } from "react-redux";

// Create context with default values
const ThemeContext = createContext({
  theme: "light",
  toggleTheme: () => {},
});

// Custom hook for consuming context
export const useTheme = () => useContext(ThemeContext);

// Theme provider component
export const ThemeProvider = ({ children }) => {
  const settingsTheme = useSelector((state) => state.settings.settings?.theme);
  
  const [theme, setTheme] = useState(() => {
    // Get stored theme or use system preference
    const storedTheme = localStorage.getItem("theme");
    if (storedTheme) return storedTheme;
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  });

  // Sync theme from settings
  useEffect(() => {
    if (settingsTheme && settingsTheme !== theme) {
      setTheme(settingsTheme);
      localStorage.setItem("theme", settingsTheme);
    }
  }, [settingsTheme, theme]);

  // Apply theme class to root element
  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
      root.classList.remove("light");
    } else {
      root.classList.remove("dark");
      root.classList.add("light");
    }
  }, [theme]);

  // Toggle theme function
  const toggleTheme = () => {
    setTheme((prevTheme) => {
      const newTheme = prevTheme === "dark" ? "light" : "dark";
      localStorage.setItem("theme", newTheme);
      return newTheme;
    });
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
