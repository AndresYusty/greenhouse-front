/**
 * Copyright (c) 2026 — Proyecto académico Invernadero.
 * Prefijo del API REST. En desarrollo suele ser relativo (/api → proxy Vite).
 * En Vercel (u otro host estático): define **VITE_API_PREFIX** como URL absoluta terminada en /api del backend Railway.
 */

const raw = (import.meta.env.VITE_API_PREFIX ?? "/api").trim();

/** Ej. `/api`, `http://localhost:8081/api` o `https://xxx.up.railway.app/api` (sin `/` final). */
export const API_PREFIX = raw.replace(/\/+$/, "") || "/api";

/** Construye la URL para `fetch`; `restPath` debe empezar por `/`. */
export function apiUrl(restPath: string): string {
  const suffix = restPath.startsWith("/") ? restPath : `/${restPath}`;
  return `${API_PREFIX}${suffix}`;
}

/** true si el bundle de producción seguiría llamando solo al mismo origen (SPA) en vez del backend. */
export function prodApiLooksMisconfigured(): boolean {
  return import.meta.env.PROD && !API_PREFIX.startsWith("http");
}

export function logProductionApiMisconfiguration(): void {
  if (!prodApiLooksMisconfigured()) return;
  console.error(
    "[Invernadero] Define en Vercel la variable VITE_API_PREFIX con la URL del backend, p. ej. https://TU-SERVICIO.up.railway.app/api (rebuild del proyecto tras guardarla).",
  );
}
