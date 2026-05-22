/**
 * Copyright (c) 2026 — Proyecto académico Invernadero.
 * En producción (Vercel) el SPA y el backend tienen dominios distintos: las rutas
 * `/oauth2/...` y `/logout` deben apuntar al origen del API, no al del frontend.
 */

/** Vacío ⇒ mismo origen (dev con proxy de Vite). */
export function getBackendOrigin(): string {
  const raw = import.meta.env.VITE_API_PREFIX ?? "/api";
  if (!raw.startsWith("http")) {
    return "";
  }
  try {
    const u = new URL(raw);
    return u.origin;
  } catch {
    return "";
  }
}

/** Href absoluto al backend cuando VITE_API_PREFIX es URL absoluta (p. ej. Railway). */
export function toBackendPublicHref(path: string): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  const origin = getBackendOrigin();
  return origin ? `${origin}${normalized}` : normalized;
}
