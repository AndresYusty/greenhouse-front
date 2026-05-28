import { useTranslation } from "react-i18next";
import { useAuth } from "../../context/AuthContext";
import { toBackendPublicHref } from "../../api/backendPublicUrl";

type Props = {
  onLanguageChange: (lang: "es" | "en") => void;
  language: string;
};

export function DashboardHeader({ onLanguageChange, language }: Props) {
  const { t } = useTranslation();
  const { auth } = useAuth();

  return (
    <header className="app-header">
      <div className="app-header__brand">
        <h1 className="app-header__title">{t("app.title")}</h1>
        <p className="app-header__subtitle">{t("app.subtitle")}</p>
      </div>
      <div className="app-header__actions">
        {auth?.oauth2Enabled && auth.authenticated ? (
          <div className="user-session">
            <span className="user-label muted" title={auth.email ?? auth.name ?? undefined}>
              {auth.email ?? auth.name ?? ""}
            </span>
            <a className="secondary logout-link" href={toBackendPublicHref("/logout")}>
              {t("auth.logout")}
            </a>
          </div>
        ) : null}
        <div className="lang lang--header" aria-label={t("steps.title")}>
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
      </div>
    </header>
  );
}
