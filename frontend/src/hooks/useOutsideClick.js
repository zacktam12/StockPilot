import { useEffect, useRef } from "react";

// useOutsideClick: Calls handler when a click occurs outside the referenced element
export const useOutsideClick = (ref, callback) => {
  const savedCallback = useRef(callback);

  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (ref.current && !ref.current.contains(event.target)) {
        savedCallback.current();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [ref]);
};

// Also provide default export for backward compatibility
export default useOutsideClick;
