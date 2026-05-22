/**
 * Copyright (c) 2026 — Proyecto académico Invernadero.
 * Aviso cuando en producción no hay VITE_API_PREFIX absoluta — las llamadas van al dominio de Vercel y fallan.
 */
import { useTranslation } from "react-i18next";
import { prodApiLooksMisconfigured } from "../config/api";

export function DeployApiHint() {
  const { t } = useTranslation();
  if (!prodApiLooksMisconfigured()) return null;
  return <p className="muted small deploy-api-hint">{t("auth.deployHint")}</p>;
}
