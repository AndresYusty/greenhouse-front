import { useTranslation } from "react-i18next";
import type { ZonaDto } from "../../api/client";
import type { DetailTab } from "../../dashboard/constants";
import type { ZonaSnapshot } from "../../hooks/useZonaSnapshots";
import type { useDashboard } from "../../hooks/useDashboard";
import { CropsTab } from "./CropsTab";
import { OverviewTab } from "./OverviewTab";
import { ReadingsTab } from "./ReadingsTab";
import { ThresholdsTab } from "./ThresholdsTab";

type DashboardState = ReturnType<typeof useDashboard>;

type Props = {
  state: DashboardState;
  locale: string;
  zonas: ZonaDto[];
  snapshots: Record<string, ZonaSnapshot>;
};

export function DashboardWorkspace({ state, locale, zonas, snapshots }: Props) {
  const { t } = useTranslation();
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
    handleSaveReading,
    handleSaveCultivo,
    handleSaveUmbral,
  } = state;

  if (zonasState !== null && zonasState.length === 0) {
    return (
      <div className="card workspace-placeholder">
        <p className="workspace-placeholder__text">{t("ui.workspaceEmpty")}</p>
      </div>
    );
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

  const tabs: { id: DetailTab; label: string }[] = [
    { id: "overview", label: t("ui.tab.overview") },
    { id: "readings", label: t("ui.tab.readings") },
    { id: "crops", label: t("ui.tab.crops") },
    { id: "thresholds", label: t("ui.tab.thresholds") },
  ];

  return (
    <>
      <div className="zone-hero">
        <span className="zone-hero__badge">{t("ui.zoneActive")}</span>
        <h2 className="zone-hero__title">{selected.nombre}</h2>
        {selected.descripcion ? <p className="zone-hero__desc muted">{selected.descripcion}</p> : null}
      </div>

      <div className="tab-bar" role="tablist">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={detailTab === tab.id}
            className={`tab-bar__btn ${detailTab === tab.id ? "tab-bar__btn--active" : ""}`}
            onClick={() => setDetailTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="card tab-sheet" role="tabpanel">
        {detailTab === "overview" && (
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
        )}
        {detailTab === "readings" && (
          <ReadingsTab
            locale={locale}
            lecturas={lecturas}
            lecturasError={lecturasError}
            readingTipo={readingTipo}
            readingValor={readingValor}
            readingInputError={readingInputError}
            savingReading={savingReading}
            onRefresh={() => selectedId && loadLecturas(selectedId)}
            onTipoChange={setReadingTipo}
            onValorChange={setReadingValor}
            onClearError={() => setReadingInputError(null)}
            onSubmit={handleSaveReading}
          />
        )}
        {detailTab === "crops" && (
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
        )}
        {detailTab === "thresholds" && (
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
        )}
      </div>
    </>
  );
}
