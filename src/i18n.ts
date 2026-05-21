/**
 * Copyright (c) 2026 — Proyecto académico Invernadero.
 * Configuración i18next (es/en) alineada con mensajes del backend.
 */
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import en from "./locales/en.json";
import es from "./locales/es.json";

void i18n.use(initReactI18next).init({
  resources: {
    es: { translation: es },
    en: { translation: en },
  },
  lng: typeof navigator !== "undefined" ? navigator.language.split("-")[0] : "es",
  fallbackLng: "es",
  interpolation: { escapeValue: false },
});

export default i18n;
