import type { FormEvent } from "react";
import { useTranslation } from "react-i18next";
import type { MetricaTipo, UmbralDto } from "../../api/client";
import { METRICAS } from "../../dashboard/constants";

type Props = {
  umbrales: UmbralDto[] | null;
  metaError: string | null;
  umbralTipo: MetricaTipo;
  umbralMinStr: string;
  umbralMaxStr: string;
  umbralInputError: string | null;
  savingUmbral: boolean;
  onTipoChange: (t: MetricaTipo) => void;
  onMinChange: (v: string) => void;
  onMaxChange: (v: string) => void;
  onClearError: () => void;
  onSubmit: (e: FormEvent) => void;
};

export function ThresholdsTab({
  umbrales,
  metaError,
  umbralTipo,
  umbralMinStr,
  umbralMaxStr,
  umbralInputError,
  savingUmbral,
  onTipoChange,
  onMinChange,
  onMaxChange,
  onClearError,
  onSubmit,
}: Props) {
  const { t } = useTranslation();

  return (
    <div className="tab-sheet__inner">
      <h3 className="panel-toolbar__title panel-toolbar__title--solo">{t("thresholds.title")}</h3>
      <p className="threshold-lead muted">{t("thresholds.help")}</p>
      {metaError && <p className="error">{metaError}</p>}
      {umbrales === null && !metaError && <p className="muted">{t("thresholds.loading")}</p>}
      {umbrales && umbrales.length === 0 && !metaError && (
        <p className="muted empty-hint">{t("thresholds.empty")}</p>
      )}
      {umbrales && umbrales.length > 0 && (
        <div className="table-wrap">
          <table className="data-table data-table--comfortable">
            <thead>
              <tr>
                <th>{t("thresholds.metric")}</th>
                <th className="col-num">{t("thresholds.min")}</th>
                <th className="col-num">{t("thresholds.max")}</th>
              </tr>
            </thead>
            <tbody>
              {umbrales.map((u) => (
                <tr key={u.id}>
                  <td>{t(`metric.${u.tipo}`)}</td>
                  <td className="col-num">{u.valorMin != null ? u.valorMin : "—"}</td>
                  <td className="col-num">{u.valorMax != null ? u.valorMax : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <div className="section-divider" />
      <h3 className="section-label">{t("thresholds.formSection")}</h3>
      <form className="form-grid-threshold" onSubmit={onSubmit}>
        <label className="field">
          <span className="field__label">{t("thresholds.metric")}</span>
          <select className="input" value={umbralTipo} onChange={(ev) => onTipoChange(ev.target.value as MetricaTipo)}>
            {METRICAS.map((m) => (
              <option key={m} value={m}>
                {t(`metric.${m}`)}
              </option>
            ))}
          </select>
        </label>
        <label className="field">
          <span className="field__label">{t("thresholds.min")}</span>
          <input
            className="input"
            type="text"
            inputMode="decimal"
            value={umbralMinStr}
            onChange={(ev) => {
              onMinChange(ev.target.value);
              onClearError();
            }}
          />
        </label>
        <label className="field">
          <span className="field__label">{t("thresholds.max")}</span>
          <input
            className="input"
            type="text"
            inputMode="decimal"
            value={umbralMaxStr}
            onChange={(ev) => {
              onMaxChange(ev.target.value);
              onClearError();
            }}
          />
        </label>
        <div className="form-grid-reading__action form-grid-threshold__action">
          {umbralInputError ? (
            <p id="umbral-err" className="error small">
              {umbralInputError}
            </p>
          ) : null}
          <button type="submit" className="btn-secondary-outline" disabled={savingUmbral}>
            {savingUmbral ? t("thresholds.saving") : t("thresholds.submit")}
          </button>
        </div>
      </form>
    </div>
  );
}
