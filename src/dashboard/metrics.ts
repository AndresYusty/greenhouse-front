import type { LecturaDto, MetricaTipo, UmbralDto } from "../api/client";
import { METRICAS } from "./constants";

export type MetricStatus = "ok" | "low" | "high" | "unknown" | "no_data";

export type MetricSnapshot = {
  tipo: MetricaTipo;
  latest: LecturaDto | null;
  umbral: UmbralDto | null;
  status: MetricStatus;
};

function evaluate(valor: number, umbral: UmbralDto | null): MetricStatus {
  if (!umbral) return "unknown";
  const min = umbral.valorMin;
  const max = umbral.valorMax;
  if (min != null && valor < min) return "low";
  if (max != null && valor > max) return "high";
  if (min != null || max != null) return "ok";
  return "unknown";
}

export function buildMetricSnapshots(lecturas: LecturaDto[], umbrales: UmbralDto[]): MetricSnapshot[] {
  return METRICAS.map((tipo) => {
    const latest =
      lecturas
        .filter((l) => l.tipo === tipo)
        .sort((a, b) => new Date(b.registradoEn).getTime() - new Date(a.registradoEn).getTime())[0] ?? null;
    const umbral = umbrales.find((u) => u.tipo === tipo) ?? null;
    const status: MetricStatus = latest ? evaluate(latest.valor, umbral) : "no_data";
    return { tipo, latest, umbral, status };
  });
}
