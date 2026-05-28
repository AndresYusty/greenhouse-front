import type { MetricaTipo } from "../api/client";

export const METRICAS: MetricaTipo[] = [
  "TEMPERATURA_C",
  "HUMEDAD_RELATIVA_PCT",
  "LUZ_LUX",
  "HUMEDAD_SUELO_PCT",
];

export type DetailTab = "overview" | "zones" | "readings" | "crops" | "thresholds";

export const NAV_SECTIONS: DetailTab[] = ["overview", "zones", "readings", "crops", "thresholds"];

export type Flash = null | "zone" | "reading" | "zoneDeleted" | "cultivo" | "umbral";
