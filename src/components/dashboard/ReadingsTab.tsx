import type { FormEvent } from "react";
import { useTranslation } from "react-i18next";
import type { LecturaDto, MetricaTipo } from "../../api/client";
import { METRICAS } from "../../dashboard/constants";
import { formatDate } from "../../dashboard/format";

type Props = {
  locale: string;
  lecturas: LecturaDto[] | null;
  lecturasError: string | null;
  readingTipo: MetricaTipo;
  readingValor: string;
  readingInputError: string | null;
  savingReading: boolean;
  onRefresh: () => void;
  onTipoChange: (t: MetricaTipo) => void;
  onValorChange: (v: string) => void;
  onClearError: () => void;
  onSubmit: (e: FormEvent) => void;
};

export function ReadingsTab({
  locale,
  lecturas,
  lecturasError,
  readingTipo,
  readingValor,
  readingInputError,
  savingReading,
  onRefresh,
  onTipoChange,
  onValorChange,
  onClearError,
  onSubmit,
}: Props) {
  const { t } = useTranslation();

  return (
    <div className="tab-sheet__inner">
      <div className="panel-toolbar">
        <h3 className="panel-toolbar__title">{t("readings.historyTitle")}</h3>
        <button type="button" className="btn-ghost" onClick={onRefresh}>
          {t("readings.refresh")}
        </button>
      </div>
      {lecturas === null && !lecturasError && <p className="muted">{t("readings.loading")}</p>}
      {lecturasError && <p className="error">{lecturasError}</p>}
      {lecturas && lecturas.length === 0 && <p className="muted">{t("readings.none")}</p>}
      {lecturas && lecturas.length > 0 && (
        <div className="table-wrap">
          <table className="data-table data-table--comfortable">
            <thead>
              <tr>
                <th>{t("readings.colTime")}</th>
                <th>{t("readings.colMetric")}</th>
                <th className="col-num">{t("readings.colValue")}</th>
              </tr>
            </thead>
            <tbody>
              {lecturas.map((r) => (
                <tr key={r.id}>
                  <td>{formatDate(r.registradoEn, locale)}</td>
                  <td>{t(`metric.${r.tipo}`)}</td>
                  <td className="col-num">{r.valor}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="section-divider" />
      <h3 className="section-label">{t("readings.newTitle")}</h3>
      <form className="form-grid-reading" onSubmit={onSubmit}>
        <label className="field">
          <span className="field__label">{t("readings.metric")}</span>
          <select className="input" value={readingTipo} onChange={(ev) => onTipoChange(ev.target.value as MetricaTipo)}>
            {METRICAS.map((m) => (
              <option key={m} value={m}>
                {t(`metric.${m}`)}
              </option>
            ))}
          </select>
        </label>
        <label className="field">
          <span className="field__label">{t("readings.value")}</span>
          <input
            className="input"
            type="text"
            inputMode="decimal"
            value={readingValor}
            onChange={(ev) => {
              onValorChange(ev.target.value);
              onClearError();
            }}
            aria-invalid={!!readingInputError}
            aria-describedby={readingInputError ? "reading-err" : undefined}
          />
        </label>
        <div className="form-grid-reading__action">
          {readingInputError ? (
            <p id="reading-err" className="error small form-grid-reading__error">
              {readingInputError}
            </p>
          ) : null}
          <button type="submit" className="btn-primary-solid" disabled={savingReading}>
            {savingReading ? t("readings.saving") : t("readings.submit")}
          </button>
        </div>
      </form>
    </div>
  );
}
