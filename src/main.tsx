/**
 * Copyright (c) 2026 — Proyecto académico Invernadero.
 * Punto de entrada React + i18n.
 */
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { AuthProvider } from "./context/AuthContext";
import { logProductionApiMisconfiguration } from "./config/api";
import "./i18n";
import "./styles.css";

logProductionApiMisconfiguration();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>,
);
