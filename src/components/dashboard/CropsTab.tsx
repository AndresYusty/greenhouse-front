import type { FormEvent } from "react";
import { useTranslation } from "react-i18next";
import type { CultivoDto } from "../../api/client";
import { formatDate } from "../../dashboard/format";

type Props = {
  locale: string;
  cultivos: CultivoDto[] | null;
  metaError: string | null;
  cultivoNombre: string;
  cultivoVariedad: string;
  cultivoNotas: string;
  savingCultivo: boolean;
  onNombreChange: (v: string) => void;
  onVariedadChange: (v: string) => void;
  onNotasChange: (v: string) => void;
  onSubmit: (e: FormEvent) => void;
};

export function CropsTab({
  locale,
  cultivos,
  metaError,
  cultivoNombre,
  cultivoVariedad,
  cultivoNotas,
  savingCultivo,
  onNombreChange,
  onVariedadChange,
  onNotasChange,
  onSubmit,
}: Props) {
  const { t } = useTranslation();

  return (
    <div className="tab-sheet__inner">
      {metaError && <p className="error">{metaError}</p>}
      <h3 className="panel-toolbar__title panel-toolbar__title--solo">{t("crops.title")}</h3>
      {cultivos === null && !metaError && <p className="muted">{t("crops.loading")}</p>}
      {cultivos && cultivos.length === 0 && !metaError && <p className="muted empty-hint">{t("crops.empty")}</p>}
      {cultivos && cultivos.length > 0 && (
        <ul className="crop-card-list">
          {cultivos.map((c) => (
            <li key={c.id} className="crop-card">
              <div className="crop-card__top">
                <span className="crop-card__name">{c.nombre}</span>
                {c.variedad ? <span className="crop-card__badge">{c.variedad}</span> : null}
              </div>
              {c.notas ? <p className="crop-card__notes muted">{c.notas}</p> : null}
              <p className="crop-card__meta muted">{formatDate(c.plantadoEn, locale)}</p>
            </li>
          ))}
        </ul>
      )}

      <div className="section-divider" />
      <h3 className="section-label">{t("crops.formSection")}</h3>
      <form className="form-grid-crop" onSubmit={onSubmit}>
        <label className="field span-2-md">
          <span className="field__label">{t("crops.nombre")}</span>
          <input
            className="input"
            value={cultivoNombre}
            onChange={(ev) => onNombreChange(ev.target.value)}
            maxLength={200}
            required
            aria-label={t("crops.nombre")}
          />
        </label>
        <label className="field">
          <span className="field__label">{t("crops.variedad")}</span>
          <input
            className="input"
            value={cultivoVariedad}
            onChange={(ev) => onVariedadChange(ev.target.value)}
            maxLength={120}
            aria-label={t("crops.variedad")}
          />
        </label>
        <label className="field">
          <span className="field__label">{t("crops.notas")}</span>
          <input
            className="input"
            value={cultivoNotas}
            onChange={(ev) => onNotasChange(ev.target.value)}
            maxLength={2000}
            aria-label={t("crops.notas")}
          />
        </label>
        <div className="form-grid-reading__action span-2-md">
          <button type="submit" className="btn-secondary-outline" disabled={savingCultivo}>
            {savingCultivo ? t("crops.saving") : t("crops.submit")}
          </button>
        </div>
      </form>
    </div>
  );
}
