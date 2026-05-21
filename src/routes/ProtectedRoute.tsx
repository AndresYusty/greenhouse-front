/**
 * Copyright (c) 2026 — Proyecto académico Invernadero.
 * Protege el panel: exige OAuth activado con sesión, o modo sin OAuth.
 */
import { Navigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../context/AuthContext";

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { t } = useTranslation();
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

  if (auth?.oauth2Enabled && !auth.authenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
