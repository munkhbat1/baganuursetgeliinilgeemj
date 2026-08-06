import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: "baganuursetgeliinilgeemj-production.up.railway.app",
        changeOrigin: true,
      },
      "/uploads": {
        target: "baganuursetgeliinilgeemj-production.up.railway.app",
        changeOrigin: true,
      },
    },
  },
  preview: {
    port: 5173,
    proxy: {
      "/api": {
        target: "baganuursetgeliinilgeemj-production.up.railway.app",
        changeOrigin: true,
      },
      "/uploads": {
        target: "baganuursetgeliinilgeemj-production.up.railway.app",
        changeOrigin: true,
      },
    },
  },
});
