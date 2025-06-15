// src/config.js
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api",
  UPLOAD_URL:
    import.meta.env.VITE_UPLOAD_URL || "http://localhost:5000/uploads",
  TIMEOUT: parseInt(import.meta.env.VITE_API_TIMEOUT) || 10000,
  ENDPOINTS: {
    AUTH: {
      LOGIN: "/auth/login",
      REGISTER: "/auth/register",
    },
    UPLOAD: "/upload",
  },
};
