import { useTranslation } from "react-i18next";
import type { CultivoDto, LecturaDto, UmbralDto } from "../../api/client";

type Props = {
  lecturas: LecturaDto[] | null;
  cultivos: CultivoDto[] | null;
  umbrales: UmbralDto[] | null;
  zoneCount: number;
};

export function KpiStrip({ lecturas, cultivos, umbrales, zoneCount }: Props) {
  const { t } = useTranslation();

  const readingCount = lecturas?.length ?? 0;
  const cropCount = cultivos?.length ?? 0;
  const thresholdCount = umbrales?.length ?? 0;
  const alerts =
    lecturas && umbrales
      ? umbrales.filter((u) => {
          const latest = lecturas
            .filter((l) => l.tipo === u.tipo)
            .sort((a, b) => new Date(b.registradoEn).getTime() - new Date(a.registradoEn).getTime())[0];
          if (!latest) return false;
          if (u.valorMin != null && latest.valor < u.valorMin) return true;
          if (u.valorMax != null && latest.valor > u.valorMax) return true;
          return false;
        }).length
      : 0;

  return (
    <div className="kpi-strip" role="group" aria-label={t("overview.kpiLabel")}>
      <div className="kpi-card">
        <span className="kpi-card__value">{zoneCount}</span>
        <span className="kpi-card__label">{t("overview.kpiZones")}</span>
      </div>
      <div className="kpi-card">
        <span className="kpi-card__value">{readingCount}</span>
        <span className="kpi-card__label">{t("overview.kpiReadings")}</span>
      </div>
      <div className="kpi-card">
        <span className="kpi-card__value">{cropCount}</span>
        <span className="kpi-card__label">{t("overview.kpiCrops")}</span>
      </div>
      <div className="kpi-card">
        <span className="kpi-card__value">{thresholdCount}</span>
        <span className="kpi-card__label">{t("overview.kpiThresholds")}</span>
      </div>
      <div className={`kpi-card kpi-card--${alerts > 0 ? "warn" : "ok"}`}>
        <span className="kpi-card__value">{alerts}</span>
        <span className="kpi-card__label">{t("overview.kpiAlerts")}</span>
      </div>
    </div>
  );
}
