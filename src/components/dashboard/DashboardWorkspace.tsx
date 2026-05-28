import { useTranslation } from "react-i18next";
import type { ZonaDto } from "../../api/client";
import type { DetailTab } from "../../dashboard/constants";
import type { ZonaSnapshot } from "../../hooks/useZonaSnapshots";
import type { useDashboard } from "../../hooks/useDashboard";
import { CropsTab } from "./CropsTab";
import { OverviewTab } from "./OverviewTab";
import { ReadingsTab } from "./ReadingsTab";
import { ThresholdsTab } from "./ThresholdsTab";
import { ZonesPanel } from "./ZonesPanel";

type DashboardState = ReturnType<typeof useDashboard>;

type Props = {
  state: DashboardState;
  locale: string;
  zonas: ZonaDto[];
  snapshots: Record<string, ZonaSnapshot>;
};

function ZoneRequiredPlaceholder({ onGoZones }: { onGoZones: () => void }) {
  const { t } = useTranslation();
  return (
    <div className="card workspace-placeholder">
      <p className="workspace-placeholder__text">{t("ui.workspaceEmpty")}</p>
      <button type="button" className="btn-primary-solid workspace-placeholder__cta" onClick={onGoZones}>
        {t("nav.goZones")}
      </button>
    </div>
  );
}

export function DashboardWorkspace({ state, locale, zonas, snapshots }: Props) {
  const {
    zonas: zonasState,
    zonasError,
    selected,
    selectedId,
    setSelectedId,
    detailTab,
    setDetailTab,
    lecturas,
    lecturasError,
    cultivos,
    umbrales,
    metaError,
    newZoneName,
    newZoneDesc,
    creatingZone,
    setNewZoneName,
    setNewZoneDesc,
    readingTipo,
    setReadingTipo,
    readingValor,
    setReadingValor,
    readingInputError,
    setReadingInputError,
    savingReading,
    cultivoNombre,
    setCultivoNombre,
    cultivoVariedad,
    setCultivoVariedad,
    cultivoNotas,
    setCultivoNotas,
    savingCultivo,
    umbralTipo,
    setUmbralTipo,
    umbralMinStr,
    setUmbralMinStr,
    umbralMaxStr,
    setUmbralMaxStr,
    umbralInputError,
    setUmbralInputError,
    savingUmbral,
    refreshSelectedZone,
    loadLecturas,
    handleCreateZone,
    handleSaveReading,
    handleSaveCultivo,
    handleSaveUmbral,
    handleDeleteZone,
  } = state;

  const { t } = useTranslation();

  if (detailTab === "zones") {
    return (
      <ZonesPanel
        zonas={zonasState}
        zonasError={zonasError}
        selectedId={selectedId}
        onSelect={setSelectedId}
        onDelete={handleDeleteZone}
        newZoneName={newZoneName}
        newZoneDesc={newZoneDesc}
        creatingZone={creatingZone}
        onNameChange={setNewZoneName}
        onDescChange={setNewZoneDesc}
        onSubmit={handleCreateZone}
      />
    );
  }

  if (zonasState !== null && zonasState.length === 0) {
    return <ZoneRequiredPlaceholder onGoZones={() => setDetailTab("zones")} />;
  }

  if (zonasState === null && !zonasError) {
    return (
      <div className="card workspace-placeholder">
        <p className="muted">{t("ui.workspaceLoading")}</p>
      </div>
    );
  }

  if (!selected || !selectedId) {
    return (
      <div className="card workspace-placeholder">
        <p className="muted">{t("ui.workspaceLoading")}</p>
      </div>
    );
  }

  const panel = (() => {
    switch (detailTab) {
      case "overview":
        return (
          <OverviewTab
            locale={locale}
            lecturas={lecturas}
            cultivos={cultivos}
            umbrales={umbrales}
            metaError={metaError}
            zonas={zonas}
            snapshots={snapshots}
            selectedId={selectedId}
            onSelectZone={(id) => {
              setSelectedId(id);
              setDetailTab("overview");
            }}
            onRefresh={refreshSelectedZone}
          />
        );
      case "readings":
        return (
          <ReadingsTab
            locale={locale}
            lecturas={lecturas}
            lecturasError={lecturasError}
            readingTipo={readingTipo}
            readingValor={readingValor}
            readingInputError={readingInputError}
            savingReading={savingReading}
            onRefresh={() => loadLecturas(selectedId)}
            onTipoChange={setReadingTipo}
            onValorChange={setReadingValor}
            onClearError={() => setReadingInputError(null)}
            onSubmit={handleSaveReading}
          />
        );
      case "crops":
        return (
          <CropsTab
            locale={locale}
            cultivos={cultivos}
            metaError={metaError}
            cultivoNombre={cultivoNombre}
            cultivoVariedad={cultivoVariedad}
            cultivoNotas={cultivoNotas}
            savingCultivo={savingCultivo}
            onNombreChange={setCultivoNombre}
            onVariedadChange={setCultivoVariedad}
            onNotasChange={setCultivoNotas}
            onSubmit={handleSaveCultivo}
          />
        );
      case "thresholds":
        return (
          <ThresholdsTab
            umbrales={umbrales}
            metaError={metaError}
            umbralTipo={umbralTipo}
            umbralMinStr={umbralMinStr}
            umbralMaxStr={umbralMaxStr}
            umbralInputError={umbralInputError}
            savingUmbral={savingUmbral}
            onTipoChange={setUmbralTipo}
            onMinChange={setUmbralMinStr}
            onMaxChange={setUmbralMaxStr}
            onClearError={() => setUmbralInputError(null)}
            onSubmit={handleSaveUmbral}
          />
        );
      default:
        return null;
    }
  })();

  return <div className="card page-content">{panel}</div>;
}
