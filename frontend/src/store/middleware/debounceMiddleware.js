// src/store/middleware/debounceMiddleware.js
const debounceMiddleware = (store) => (next) => (action) => {
  if (!action.meta?.debounce) {
    return next(action);
  }

  const { key, delay } = action.meta.debounce;

  // Clear previous timer if exists
  store.dispatch(clearDebounceTimer({ key }));

  const timerId = setTimeout(() => {
    store.dispatch(clearDebounceTimer({ key }));
    next(action);
  }, delay);

  store.dispatch(setDebounceTimer({ key, timerId }));
};

export default debounceMiddleware;
