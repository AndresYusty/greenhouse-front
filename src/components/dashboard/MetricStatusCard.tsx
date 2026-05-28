import { useTranslation } from "react-i18next";
import type { MetricSnapshot } from "../../dashboard/metrics";
import { formatDate } from "../../dashboard/format";

type Props = {
  snapshot: MetricSnapshot;
  locale: string;
};

export function MetricStatusCard({ snapshot, locale }: Props) {
  const { t } = useTranslation();
  const { tipo, latest, umbral, status } = snapshot;

  const statusLabel =
    status === "ok"
      ? t("overview.statusOk")
      : status === "low"
        ? t("overview.statusLow")
        : status === "high"
          ? t("overview.statusHigh")
          : status === "no_data"
            ? t("overview.statusNoData")
            : t("overview.statusUnknown");

  const range =
    umbral && (umbral.valorMin != null || umbral.valorMax != null)
      ? `${umbral.valorMin ?? "—"} … ${umbral.valorMax ?? "—"}`
      : t("overview.noThreshold");

  return (
    <article className={`metric-card metric-card--${status}`}>
      <div className="metric-card__head">
        <h4 className="metric-card__title">{t(`metric.${tipo}`)}</h4>
        <span className={`status-pill status-pill--${status}`}>{statusLabel}</span>
      </div>
      <p className="metric-card__value">
        {latest ? (
          <>
            <strong>{latest.valor}</strong>
            <span className="metric-card__time muted">{formatDate(latest.registradoEn, locale)}</span>
          </>
        ) : (
          <span className="muted">{t("overview.noReading")}</span>
        )}
      </p>
      <p className="metric-card__range muted">
        {t("overview.thresholdRange")}: {range}
      </p>
    </article>
  );
}
