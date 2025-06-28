// src/config.js
export const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000";
export const API_URL = `${API_BASE_URL}/api`;
export const UPLOAD_URL = `${API_URL}/upload`;

export const API_CONFIG = {
  BASE_URL: API_BASE_URL,
  UPLOAD_URL: UPLOAD_URL,
  TIMEOUT: parseInt(import.meta.env.VITE_API_TIMEOUT) || 10000,
  ENDPOINTS: {
    AUTH: {
      LOGIN: "/auth/login",
      REGISTER: "/auth/register",
    },
    UPLOAD: "/upload",
  },
};
