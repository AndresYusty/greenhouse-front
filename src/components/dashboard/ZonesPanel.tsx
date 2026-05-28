import type { FormEvent } from "react";
import { useTranslation } from "react-i18next";
import type { ZonaDto } from "../../api/client";

type Props = {
  zonas: ZonaDto[] | null;
  zonasError: string | null;
  selectedId: string | null;
  onSelect: (id: string) => void;
  onDelete: (zona: ZonaDto) => void;
  newZoneName: string;
  newZoneDesc: string;
  creatingZone: boolean;
  onNameChange: (v: string) => void;
  onDescChange: (v: string) => void;
  onSubmit: (e: FormEvent) => void;
};

export function ZonesPanel({
  zonas,
  zonasError,
  selectedId,
  onSelect,
  onDelete,
  newZoneName,
  newZoneDesc,
  creatingZone,
  onNameChange,
  onDescChange,
  onSubmit,
}: Props) {
  const { t } = useTranslation();

  return (
    <div className="page-panel">
      <header className="page-panel__header">
        <h2 className="page-panel__title">{t("zones.title")}</h2>
        <p className="page-panel__lead muted">{t("zones.pageLead")}</p>
      </header>

      {zonas === null && !zonasError && <p className="muted">{t("zones.loading")}</p>}
      {zonasError && <p className="error">{zonasError}</p>}

      <div className="zones-layout">
        <section className="zones-layout__list card card--flat">
          <h3 className="section-label">{t("zones.listTitle")}</h3>
          {zonas && zonas.length === 0 && !zonasError && <p className="muted">{t("zones.empty")}</p>}
          <ul className="zone-list zone-list--panel">
            {zonas?.map((z) => (
              <li key={z.id} className="zone-row">
                <button
                  type="button"
                  className={`zone-chip ${selectedId === z.id ? "zone-chip--selected" : ""}`}
                  onClick={() => onSelect(z.id)}
                >
                  <span className="zone-chip__name">{z.nombre}</span>
                  {z.descripcion ? <span className="zone-chip__desc">{z.descripcion}</span> : null}
                </button>
                <button
                  type="button"
                  className="btn-delete-zone"
                  title={t("zones.delete")}
                  aria-label={t("zones.delete")}
                  onClick={(ev) => {
                    ev.preventDefault();
                    ev.stopPropagation();
                    onDelete(z);
                  }}
                >
                  ×
                </button>
              </li>
            ))}
          </ul>
        </section>

        <section className="zones-layout__form card card--flat">
          <h3 className="section-label">{t("zones.newTitle")}</h3>
          <form className="new-zone-form new-zone-form--panel" onSubmit={onSubmit}>
            <label className="field">
              <span className="field__label">{t("zones.namePlaceholder")}</span>
              <input
                className="input"
                value={newZoneName}
                onChange={(ev) => onNameChange(ev.target.value)}
                placeholder={t("zones.namePlaceholder")}
                required
                maxLength={120}
              />
            </label>
            <label className="field">
              <span className="field__label">{t("zones.descPlaceholder")}</span>
              <textarea
                className="input textarea textarea--compact"
                value={newZoneDesc}
                onChange={(ev) => onDescChange(ev.target.value)}
                placeholder={t("zones.descPlaceholder")}
                rows={3}
                maxLength={2000}
              />
            </label>
            <button type="submit" className="btn-primary-solid" disabled={creatingZone || !newZoneName.trim()}>
              {creatingZone ? t("zones.creating") : t("zones.submit")}
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}
