import { useTranslation } from "react-i18next";
import type { ZonaDto } from "../../api/client";
import type { DetailTab } from "../../dashboard/constants";
import { NAV_SECTIONS } from "../../dashboard/constants";
import { useAuth } from "../../context/AuthContext";
import { toBackendPublicHref } from "../../api/backendPublicUrl";

const NAV_ICON: Record<DetailTab, string> = {
  overview: "◫",
  zones: "▦",
  readings: "◎",
  crops: "❧",
  thresholds: "⬚",
};

type Props = {
  active: DetailTab;
  onNavigate: (section: DetailTab) => void;
  zonas: ZonaDto[] | null;
  selectedId: string | null;
  onSelectZone: (id: string) => void;
  language: string;
  onLanguageChange: (lang: "es" | "en") => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
};

export function AppSidebar({
  active,
  onNavigate,
  zonas,
  selectedId,
  onSelectZone,
  language,
  onLanguageChange,
  mobileOpen,
  onCloseMobile,
}: Props) {
  const { t } = useTranslation();
  const { auth } = useAuth();

  const navLabel = (id: DetailTab) => {
    if (id === "overview") return t("ui.tab.overview");
    if (id === "zones") return t("nav.zones");
    if (id === "readings") return t("ui.tab.readings");
    if (id === "crops") return t("ui.tab.crops");
    return t("ui.tab.thresholds");
  };

  return (
    <>
      <div
        className={`sidebar-backdrop ${mobileOpen ? "sidebar-backdrop--visible" : ""}`}
        onClick={onCloseMobile}
        aria-hidden={!mobileOpen}
      />
      <aside className={`app-sidebar ${mobileOpen ? "app-sidebar--open" : ""}`} aria-label={t("nav.main")}>
        <div className="app-sidebar__brand">
          <span className="app-sidebar__logo" aria-hidden>
            🌿
          </span>
          <div>
            <p className="app-sidebar__title">{t("app.title")}</p>
            <p className="app-sidebar__tagline">{t("app.subtitleShort")}</p>
          </div>
        </div>

        <nav className="app-sidebar__nav">
          <p className="app-sidebar__nav-label">{t("nav.menu")}</p>
          <ul className="sidebar-nav-list">
            {NAV_SECTIONS.map((id) => (
              <li key={id}>
                <button
                  type="button"
                  className={`sidebar-nav-item ${active === id ? "sidebar-nav-item--active" : ""}`}
                  onClick={() => {
                    onNavigate(id);
                    onCloseMobile();
                  }}
                >
                  <span className="sidebar-nav-item__icon" aria-hidden>
                    {NAV_ICON[id]}
                  </span>
                  {navLabel(id)}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        {zonas && zonas.length > 0 && active !== "zones" && (
          <div className="app-sidebar__zone">
            <label className="app-sidebar__zone-label" htmlFor="sidebar-zone-select">
              {t("nav.activeZone")}
            </label>
            <select
              id="sidebar-zone-select"
              className="sidebar-zone-select"
              value={selectedId ?? ""}
              onChange={(ev) => onSelectZone(ev.target.value)}
            >
              {zonas.map((z) => (
                <option key={z.id} value={z.id}>
                  {z.nombre}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="app-sidebar__footer">
          {auth?.oauth2Enabled && auth.authenticated ? (
            <p className="app-sidebar__user muted" title={auth.email ?? auth.name ?? undefined}>
              {auth.email ?? auth.name ?? ""}
            </p>
          ) : null}
          <div className="app-sidebar__lang">
            <button
              type="button"
              className={language.startsWith("es") ? "active" : ""}
              onClick={() => onLanguageChange("es")}
            >
              {t("lang.es")}
            </button>
            <button
              type="button"
              className={language.startsWith("en") ? "active" : ""}
              onClick={() => onLanguageChange("en")}
            >
              {t("lang.en")}
            </button>
          </div>
          {auth?.oauth2Enabled && auth.authenticated ? (
            <a className="sidebar-logout" href={toBackendPublicHref("/logout")}>
              {t("auth.logout")}
            </a>
          ) : null}
        </div>
      </aside>
    </>
  );
}
