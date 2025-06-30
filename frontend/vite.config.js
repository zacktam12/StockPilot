import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { fileURLToPath, URL } from "url";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(path.dirname(fileURLToPath(import.meta.url)), "./src"),
    },
  },
  server: {
    port: 5500, // Changed from 3001 to 5500
    host: true, // optional: allows LAN access
    proxy: {
      "/api": {
        target: "http://localhost:8000", // or 5000, depending on your backend
        changeOrigin: true,
        secure: false,
      },
    },
  },
  build: {
    sourcemap: true,
    commonjsOptions: {
      transformMixedEsModules: true,
    },
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("sentry")) {
            return "sentry";
          }
        },
      },
    },
  },
});
