/**
 * Copyright (c) 2026 — Proyecto académico Invernadero.
 * Panel principal: barra lateral de zonas + workspace con resumen y pestañas de detalle.
 */
import { useTranslation } from "react-i18next";
import { DashboardHeader } from "../components/dashboard/DashboardHeader";
import { DashboardWorkspace } from "../components/dashboard/DashboardWorkspace";
import { ZoneSidebar } from "../components/dashboard/ZoneSidebar";
import { useDashboard } from "../hooks/useDashboard";
import { useZonaSnapshots } from "../hooks/useZonaSnapshots";

export function DashboardPage() {
  const { t, i18n } = useTranslation();
  const state = useDashboard();
  const snapshots = useZonaSnapshots(state.zonas);
  const locale = i18n.language.startsWith("es") ? "es" : "en";

  return (
    <div className="dashboard-app">
      <DashboardHeader
        language={i18n.language}
        onLanguageChange={(lang) => void i18n.changeLanguage(lang)}
      />

      {state.flash && (
        <div className="flash-bar" role="status">
          {state.flashMessage}
        </div>
      )}

      <details className="help-banner">
        <summary className="help-banner__summary">{t("ui.quickGuide")}</summary>
        <ol className="help-banner__steps">
          <li>{t("steps.1")}</li>
          <li>{t("steps.2")}</li>
          <li>{t("steps.3")}</li>
        </ol>
      </details>

      <main className="dashboard">
        <ZoneSidebar
          zonas={state.zonas}
          zonasError={state.zonasError}
          selectedId={state.selectedId}
          onSelect={state.setSelectedId}
          onDelete={state.handleDeleteZone}
          newZoneName={state.newZoneName}
          newZoneDesc={state.newZoneDesc}
          creatingZone={state.creatingZone}
          onNameChange={state.setNewZoneName}
          onDescChange={state.setNewZoneDesc}
          onSubmit={state.handleCreateZone}
        />

        <div className="workspace">
          <DashboardWorkspace
            state={state}
            locale={locale}
            zonas={state.zonas ?? []}
            snapshots={snapshots}
          />
        </div>
      </main>

      <footer className="app-footer muted">
        <small>
          {t("metrics.temp")} · {t("metrics.humidity")}
        </small>
      </footer>
    </div>
  );
}
