/**
 * Copyright (c) 2026 — Proyecto académico Invernadero.
 * Pantalla de inicio de sesión con Google (ruta dedicada).
 */
import { Navigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../context/AuthContext";
import { toBackendPublicHref } from "../api/backendPublicUrl";

function GoogleGMark() {
  return (
    <svg className="google-g" width="18" height="18" viewBox="0 0 18 18" aria-hidden>
      <path
        fill="#4285F4"
        d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z"
      />
      <path
        fill="#34A853"
        d="M9 18c2.43 0 4.467-.806 5.959-2.184l-2.908-2.258c-.806.54-1.837.86-3.051.86-2.347 0-4.33-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z"
      />
      <path
        fill="#FBBC05"
        d="M3.964 10.707c-.18-.54-.282-1.117-.282-1.707s.102-1.167.282-1.707V4.961H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.039l3.007-2.332z"
      />
      <path
        fill="#EA4335"
        d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.961L3.964 7.293C4.67 5.163 6.653 3.58 9 3.58z"
      />
    </svg>
  );
}

export function LoginPage() {
  const { t, i18n } = useTranslation();
  const { auth, loading, error } = useAuth();

  if (loading) {
    return (
      <div className="layout">
        <p className="muted">{t("auth.loading")}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="layout">
        <p className="error">{error}</p>
      </div>
    );
  }

  const sessionReady = Boolean(auth && (!auth.oauth2Enabled || auth.authenticated));
  if (sessionReady) {
    return <Navigate to="/panel" replace />;
  }

  const loginHref = toBackendPublicHref(auth?.loginUrl ?? "/oauth2/authorization/google");

  return (
    <div className="login-page">
      <header className="login-topbar">
        <div className="login-topbar-inner">
          <div className="lang lang-compact">
            <button
              type="button"
              className={i18n.language.startsWith("es") ? "active" : ""}
              onClick={() => void i18n.changeLanguage("es")}
            >
              {t("lang.es")}
            </button>
            <button
              type="button"
              className={i18n.language.startsWith("en") ? "active" : ""}
              onClick={() => void i18n.changeLanguage("en")}
            >
              {t("lang.en")}
            </button>
          </div>
        </div>
      </header>

      <main className="login-center">
        <div className="login-panel">
          <p className="login-app-name">{t("app.title")}</p>
          <h1 className="login-title">{t("auth.title")}</h1>
          <p className="login-lead">{t("auth.body")}</p>
          <a className="google-signin-btn" href={loginHref} aria-label={t("auth.google")}>
            <GoogleGMark />
            <span>{t("auth.google")}</span>
          </a>
        </div>
      </main>
    </div>
  );
}
