// src/hooks/useDebounce.js
import { useState, useEffect } from "react";

/**
 * Custom hook to debounce a value
 * @param {any} value - The value to debounce
 * @param {number} delay - Delay in milliseconds (default: 500ms)
 * @returns {any} The debounced value
 */
export function useDebounce(value, delay = 500) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

// Optional: Redux-connected version if you need to debounce store values
/**
 * Redux-connected debounce hook
 * @param {Function} selector - Redux selector function
 * @param {number} delay - Delay in milliseconds (default: 500ms)
 * @param {Function} dispatch - Redux dispatch function
 * @param {Function} action - Action creator to dispatch when debounced value changes
 * @returns {any} The debounced value
 */
export function useDebounceRedux(selector, delay = 500, dispatch, action) {
  const value = useSelector(selector);
  const debouncedValue = useDebounce(value, delay);

  useEffect(() => {
    if (dispatch && action) {
      dispatch(action(debouncedValue));
    }
  }, [debouncedValue, dispatch, action]);

  return debouncedValue;
}
