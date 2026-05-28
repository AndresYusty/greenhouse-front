import { useTranslation } from "react-i18next";
import type { ZonaDto } from "../../api/client";
import type { DetailTab } from "../../dashboard/constants";

type Props = {
  section: DetailTab;
  selected: ZonaDto | null;
  onOpenMenu: () => void;
};

function sectionTitle(section: DetailTab, t: (k: string) => string): string {
  switch (section) {
    case "overview":
      return t("ui.tab.overview");
    case "zones":
      return t("nav.zones");
    case "readings":
      return t("ui.tab.readings");
    case "crops":
      return t("ui.tab.crops");
    case "thresholds":
      return t("ui.tab.thresholds");
  }
}

export function DashboardTopBar({ section, selected, onOpenMenu }: Props) {
  const { t } = useTranslation();

  return (
    <header className="app-topbar">
      <button type="button" className="app-topbar__menu" onClick={onOpenMenu} aria-label={t("nav.openMenu")}>
        ☰
      </button>
      <div className="app-topbar__titles">
        <h1 className="app-topbar__title">{sectionTitle(section, t)}</h1>
        {selected && section !== "zones" && (
          <p className="app-topbar__subtitle muted">
            {t("ui.zoneActive")}: <strong>{selected.nombre}</strong>
            {selected.descripcion ? ` — ${selected.descripcion}` : ""}
          </p>
        )}
      </div>
    </header>
  );
}
