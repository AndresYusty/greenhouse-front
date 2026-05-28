/**
 * Copyright (c) 2026 — Proyecto académico Invernadero.
 * Panel con menú lateral y área principal de contenido.
 */
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { AppSidebar } from "../components/dashboard/AppSidebar";
import { DashboardTopBar } from "../components/dashboard/DashboardTopBar";
import { DashboardWorkspace } from "../components/dashboard/DashboardWorkspace";
import { useDashboard } from "../hooks/useDashboard";
import { useZonaSnapshots } from "../hooks/useZonaSnapshots";

export function DashboardPage() {
  const { t, i18n } = useTranslation();
  const state = useDashboard();
  const snapshots = useZonaSnapshots(state.zonas);
  const locale = i18n.language.startsWith("es") ? "es" : "en";
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const selected = state.zonas?.find((z) => z.id === state.selectedId) ?? null;

  return (
    <div className="dashboard-shell">
      <AppSidebar
        active={state.detailTab}
        onNavigate={state.setDetailTab}
        zonas={state.zonas}
        selectedId={state.selectedId}
        onSelectZone={state.setSelectedId}
        language={i18n.language}
        onLanguageChange={(lang) => void i18n.changeLanguage(lang)}
        mobileOpen={mobileNavOpen}
        onCloseMobile={() => setMobileNavOpen(false)}
      />

      <div className="app-main">
        <DashboardTopBar
          section={state.detailTab}
          selected={selected}
          onOpenMenu={() => setMobileNavOpen(true)}
        />

        {state.flash && (
          <div className="flash-bar flash-bar--inline" role="status">
            {state.flashMessage}
          </div>
        )}

        <DashboardWorkspace
          state={state}
          locale={locale}
          zonas={state.zonas ?? []}
          snapshots={snapshots}
        />
      </div>
    </div>
  );
}
