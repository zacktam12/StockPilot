// src/store/loadingMiddleware.js
import { startLoading, stopLoading } from "../slices/loadingSlice";

export const loadingMiddleware = (store) => (next) => (action) => {
  if (action.meta?.loadingMessage) {
    if (action.type.endsWith("/pending")) {
      store.dispatch(startLoading({ message: action.meta.loadingMessage }));
    } else if (
      action.type.endsWith("/fulfilled") ||
      action.type.endsWith("/rejected")
    ) {
      store.dispatch(stopLoading());
    }
  }

  return next(action);
};
