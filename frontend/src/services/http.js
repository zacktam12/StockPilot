// src/services/http.js
import axios from "axios";
import store from "../store";
import { setLoading, addError } from "../store/slices/appSlice";

const http = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  headers: {
    "Content-Type": "application/json",
  },
  timeout: parseInt(import.meta.env.VITE_API_TIMEOUT) || 10000,
});

// Request interceptor
http.interceptors.request.use(
  (config) => {
    // Set loading state for the specific endpoint
    const endpointKey = config.url.replace(/\//g, "_");
    store.dispatch(setLoading({ key: endpointKey, value: true }));

    // Add auth token if exists
    const token = localStorage.getItem("authToken"); // <-- use "authToken" everywhere
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    store.dispatch(setLoading({ key: "global", value: false }));
    return Promise.reject(error);
  }
);

// Response interceptor
http.interceptors.response.use(
  (response) => {
    const endpointKey = response.config.url.replace(/\//g, "_");
    store.dispatch(setLoading({ key: endpointKey, value: false }));
    return response.data;
  },
  (error) => {
    const endpointKey = error.config?.url?.replace(/\//g, "_") || "global";
    store.dispatch(setLoading({ key: endpointKey, value: false }));

    const status = error.response?.status;
    const errorMessage =
      error.response?.data?.message ||
      error.message ||
      "An unexpected error occurred";

    // Handle specific error cases
    switch (status) {
      case 401:
        handleUnauthorized();
        break;
      case 403:
        store.dispatch(addError("You don't have permission for this action"));
        break;
      case 429:
        store.dispatch(addError("Too many requests. Please try again later"));
        break;
      default:
        store.dispatch(addError(errorMessage));
    }

    return Promise.reject({
      status,
      message: errorMessage,
      data: error.response?.data,
      code: error.code,
      config: error.config,
    });
  }
);

const handleUnauthorized = () => {
  localStorage.removeItem("token");
  delete http.defaults.headers.common["Authorization"];
  if (window.location.pathname !== "/login") {
    window.location.href =
      "/login?redirect=" + encodeURIComponent(window.location.pathname);
  }
};

// Enhanced file upload with abort capability
export const uploadFile = (file, onProgress, endpoint = "/upload") => {
  const controller = new AbortController();
  const formData = new FormData();
  formData.append("file", file);

  const uploadPromise = http.post(endpoint, formData, {
    baseURL: import.meta.env.VITE_UPLOAD_URL || "http://localhost:5000/api", // <-- use /api as base
    headers: {
      "Content-Type": "multipart/form-data",
    },
    signal: controller.signal,
    onUploadProgress: (progressEvent) => {
      if (onProgress) {
        const percentCompleted = Math.round(
          (progressEvent.loaded * 100) / progressEvent.total
        );
        onProgress(percentCompleted, progressEvent);
      }
    },
  });

  return {
    promise: uploadPromise,
    abort: () => controller.abort(),
  };
};

// Enhanced auth token management
export const setAuthToken = (token) => {
  if (token) {
    localStorage.setItem("token", token);
    http.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    handleUnauthorized();
  }
};

// API status check
export const checkApiHealth = async () => {
  try {
    await http.get("/health");
    return true;
  } catch {
    return false;
  }
};

export default http;
