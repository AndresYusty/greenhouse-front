/**
 * Copyright (c) 2026 — Proyecto académico Invernadero.
 * Cliente HTTP tipado alineado con docs/modelo-datos.json.
 */
import { apiUrl } from "../config/api";

/** Tipos de métrica (igual que MetricaTipo en el backend). */
export type MetricaTipo =
  | "TEMPERATURA_C"
  | "HUMEDAD_RELATIVA_PCT"
  | "LUZ_LUX"
  | "HUMEDAD_SUELO_PCT";

/** Respuesta de zona según contrato JSON compartido. */
export type ZonaDto = {
  id: string;
  nombre: string;
  descripcion: string;
  creadoEn: string;
};

export type LecturaDto = {
  id: string;
  zonaId: string;
  tipo: MetricaTipo;
  valor: number;
  registradoEn: string;
};

export type CultivoDto = {
  id: string;
  zonaId: string;
  nombre: string;
  variedad: string;
  notas: string;
  plantadoEn: string;
  creadoEn: string;
};

export type UmbralDto = {
  id: string;
  zonaId: string;
  tipo: MetricaTipo;
  valorMin: number | null;
  valorMax: number | null;
  creadoEn: string;
};

export type AuthStatusResponse = {
  authenticated: boolean;
  oauth2Enabled: boolean;
  loginUrl?: string | null;
  email?: string | null;
  name?: string | null;
};

const jsonHeaders = {
  Accept: "application/json",
  "Content-Type": "application/json",
  "Accept-Language": navigator.language,
};

export async function fetchAuthStatus(): Promise<AuthStatusResponse> {
  const res = await fetch(apiUrl("/v1/auth/status"), {
    credentials: "include",
    headers: { Accept: "application/json", "Accept-Language": navigator.language },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return (await res.json()) as AuthStatusResponse;
}

export async function fetchZonas(): Promise<ZonaDto[]> {
  const res = await fetch(apiUrl("/v1/zonas"), {
    credentials: "include",
    headers: { Accept: "application/json", "Accept-Language": navigator.language },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return (await res.json()) as ZonaDto[];
}

export async function crearZona(nombre: string, descripcion: string): Promise<ZonaDto> {
  const res = await fetch(apiUrl("/v1/zonas"), {
    method: "POST",
    credentials: "include",
    headers: jsonHeaders,
    body: JSON.stringify({ nombre: nombre.trim(), descripcion: descripcion.trim() }),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return (await res.json()) as ZonaDto;
}

export async function fetchLecturas(zonaId: string, limite = 50): Promise<LecturaDto[]> {
  const q = new URLSearchParams({ limite: String(limite) });
  const res = await fetch(apiUrl(`/v1/zonas/${zonaId}/lecturas?${q}`), {
    credentials: "include",
    headers: { Accept: "application/json", "Accept-Language": navigator.language },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return (await res.json()) as LecturaDto[];
}

export async function registrarLectura(
  zonaId: string,
  tipo: MetricaTipo,
  valor: number,
): Promise<LecturaDto> {
  const res = await fetch(apiUrl(`/v1/zonas/${zonaId}/lecturas`), {
    method: "POST",
    credentials: "include",
    headers: jsonHeaders,
    body: JSON.stringify({ tipo, valor }),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return (await res.json()) as LecturaDto;
}

export async function eliminarZona(zonaId: string): Promise<void> {
  const res = await fetch(apiUrl(`/v1/zonas/${zonaId}`), {
    method: "DELETE",
    credentials: "include",
    headers: { Accept: "application/json", "Accept-Language": navigator.language },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
}

export async function fetchCultivos(zonaId: string): Promise<CultivoDto[]> {
  const res = await fetch(apiUrl(`/v1/zonas/${zonaId}/cultivos`), {
    credentials: "include",
    headers: { Accept: "application/json", "Accept-Language": navigator.language },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return (await res.json()) as CultivoDto[];
}

export async function crearCultivo(zonaId: string, nombre: string, variedad: string, notas: string): Promise<CultivoDto> {
  const res = await fetch(apiUrl(`/v1/zonas/${zonaId}/cultivos`), {
    method: "POST",
    credentials: "include",
    headers: jsonHeaders,
    body: JSON.stringify({ nombre: nombre.trim(), variedad: variedad.trim() || undefined, notas: notas.trim() || undefined }),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return (await res.json()) as CultivoDto;
}

export async function fetchUmbrales(zonaId: string): Promise<UmbralDto[]> {
  const res = await fetch(apiUrl(`/v1/zonas/${zonaId}/umbrales`), {
    credentials: "include",
    headers: { Accept: "application/json", "Accept-Language": navigator.language },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return (await res.json()) as UmbralDto[];
}

export async function definirUmbral(
  zonaId: string,
  tipo: MetricaTipo,
  valorMin: number | undefined,
  valorMax: number | undefined,
): Promise<UmbralDto> {
  const res = await fetch(apiUrl(`/v1/zonas/${zonaId}/umbrales`), {
    method: "PUT",
    credentials: "include",
    headers: jsonHeaders,
    body: JSON.stringify({
      tipo,
      ...(valorMin !== undefined ? { valorMin } : {}),
      ...(valorMax !== undefined ? { valorMax } : {}),
    }),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return (await res.json()) as UmbralDto;
}

