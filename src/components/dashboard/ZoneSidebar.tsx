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

export function ZoneSidebar({
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
    <aside className="card sidebar-zone">
      <div className="card-intro">
        <h2 className="card-intro__title">{t("zones.title")}</h2>
        <p className="card-intro__lead">{t("zones.sidebarLead")}</p>
      </div>

      {zonas === null && !zonasError && <p className="muted sidebar-zone__loading">{t("zones.loading")}</p>}
      {zonasError && <p className="error">{zonasError}</p>}
      {zonas && zonas.length === 0 && !zonasError && <p className="muted">{t("zones.empty")}</p>}

      <ul className="zone-list">
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

      <form className="new-zone-form" onSubmit={onSubmit}>
        <h3 className="section-label">{t("zones.newTitle")}</h3>
        <input
          className="input"
          value={newZoneName}
          onChange={(ev) => onNameChange(ev.target.value)}
          placeholder={t("zones.namePlaceholder")}
          required
          maxLength={120}
          aria-label={t("zones.namePlaceholder")}
        />
        <textarea
          className="input textarea textarea--compact"
          value={newZoneDesc}
          onChange={(ev) => onDescChange(ev.target.value)}
          placeholder={t("zones.descPlaceholder")}
          rows={2}
          maxLength={2000}
          aria-label={t("zones.descPlaceholder")}
        />
        <button type="submit" className="btn-primary-solid" disabled={creatingZone || !newZoneName.trim()}>
          {creatingZone ? t("zones.creating") : t("zones.submit")}
        </button>
      </form>
    </aside>
  );
}
