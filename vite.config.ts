/**
 * Copyright (c) 2026 — Proyecto académico Invernadero.
 * Configuración Vite y proxy hacia la API Spring Boot.
 */
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: "http://localhost:8081",
        changeOrigin: true,
      },
      "/actuator": {
        target: "http://localhost:8081",
        changeOrigin: true,
      },
      "/oauth2": {
        target: "http://localhost:8081",
        changeOrigin: true,
      },
      "/login": {
        target: "http://localhost:8081",
        changeOrigin: true,
      },
      "/logout": {
        target: "http://localhost:8081",
        changeOrigin: true,
      },
    },
  },
});
