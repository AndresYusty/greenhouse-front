import { useTranslation } from "react-i18next";
import type { CultivoDto, LecturaDto, UmbralDto, ZonaDto } from "../../api/client";
import { buildMetricSnapshots } from "../../dashboard/metrics";
import { formatDate } from "../../dashboard/format";
import type { ZonaSnapshot } from "../../hooks/useZonaSnapshots";
import { KpiStrip } from "./KpiStrip";
import { MetricStatusCard } from "./MetricStatusCard";

type Props = {
  locale: string;
  lecturas: LecturaDto[] | null;
  cultivos: CultivoDto[] | null;
  umbrales: UmbralDto[] | null;
  metaError: string | null;
  zonas: ZonaDto[];
  snapshots: Record<string, ZonaSnapshot>;
  selectedId: string;
  onSelectZone: (id: string) => void;
  onRefresh: () => void;
};

export function OverviewTab({
  locale,
  lecturas,
  cultivos,
  umbrales,
  metaError,
  zonas,
  snapshots,
  selectedId,
  onSelectZone,
  onRefresh,
}: Props) {
  const { t } = useTranslation();

  const loading = lecturas === null || cultivos === null || umbrales === null;
  const metrics =
    lecturas && umbrales ? buildMetricSnapshots(lecturas, umbrales) : [];

  return (
    <div className="tab-sheet__inner">
      <div className="panel-toolbar">
        <div>
          <h3 className="panel-toolbar__title">{t("overview.title")}</h3>
          <p className="overview-lead muted">{t("overview.lead")}</p>
        </div>
        <button type="button" className="btn-ghost" onClick={onRefresh}>
          {t("overview.refreshAll")}
        </button>
      </div>

      {metaError && <p className="error">{metaError}</p>}

      <KpiStrip
        lecturas={lecturas}
        cultivos={cultivos}
        umbrales={umbrales}
        zoneCount={zonas.length}
      />

      {loading && !metaError && <p className="muted">{t("overview.loading")}</p>}

      {!loading && (
        <>
          <h4 className="section-label">{t("overview.metricsTitle")}</h4>
          <div className="metric-grid">
            {metrics.map((m) => (
              <MetricStatusCard key={m.tipo} snapshot={m} locale={locale} />
            ))}
          </div>

          {cultivos && cultivos.length > 0 && (
            <>
              <div className="section-divider" />
              <h4 className="section-label">{t("overview.cropsSnapshot")}</h4>
              <ul className="overview-crop-list">
                {cultivos.slice(0, 4).map((c) => (
                  <li key={c.id} className="overview-crop-list__item">
                    <span className="overview-crop-list__name">{c.nombre}</span>
                    {c.variedad ? <span className="muted"> · {c.variedad}</span> : null}
                  </li>
                ))}
              </ul>
            </>
          )}

          {zonas.length > 1 && (
            <>
              <div className="section-divider" />
              <h4 className="section-label">{t("overview.allZonesTitle")}</h4>
              <p className="muted overview-zones-hint">{t("overview.allZonesHint")}</p>
              <div className="zones-overview-grid">
                {zonas.map((z) => {
                  const snap = snapshots[z.id];
                  const isActive = z.id === selectedId;
                  const temp = snap?.lecturas
                    .filter((l) => l.tipo === "TEMPERATURA_C")
                    .sort((a, b) => new Date(b.registradoEn).getTime() - new Date(a.registradoEn).getTime())[0];
                  const hum = snap?.lecturas
                    .filter((l) => l.tipo === "HUMEDAD_RELATIVA_PCT")
                    .sort((a, b) => new Date(b.registradoEn).getTime() - new Date(a.registradoEn).getTime())[0];

                  return (
                    <button
                      key={z.id}
                      type="button"
                      className={`zone-overview-card ${isActive ? "zone-overview-card--active" : ""}`}
                      onClick={() => onSelectZone(z.id)}
                    >
                      <span className="zone-overview-card__name">{z.nombre}</span>
                      {snap?.loading && <span className="muted small">{t("overview.loading")}</span>}
                      {snap?.error && <span className="error small">{t("zones.error")}</span>}
                      {snap && !snap.loading && !snap.error && (
                        <dl className="zone-overview-card__stats">
                          <div>
                            <dt>{t("metric.TEMPERATURA_C")}</dt>
                            <dd>{temp ? temp.valor : "—"}</dd>
                          </div>
                          <div>
                            <dt>{t("metric.HUMEDAD_RELATIVA_PCT")}</dt>
                            <dd>{hum ? hum.valor : "—"}</dd>
                          </div>
                          <div>
                            <dt>{t("overview.kpiReadings")}</dt>
                            <dd>{snap.lecturas.length}</dd>
                          </div>
                        </dl>
                      )}
                      {temp && (
                        <span className="zone-overview-card__time muted">
                          {formatDate(temp.registradoEn, locale)}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
