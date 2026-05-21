/**
 * Copyright (c) 2026 — Proyecto académico Invernadero.
 * Estado global de sesión / OAuth compartido entre rutas.
 */
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { useTranslation } from "react-i18next";
import { fetchAuthStatus, type AuthStatusResponse } from "../api/client";

type AuthContextValue = {
  auth: AuthStatusResponse | null;
  loading: boolean;
  error: string | null;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { t } = useTranslation();
  const [auth, setAuth] = useState<AuthStatusResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    void fetchAuthStatus()
      .then(setAuth)
      .catch(() => setError(t("auth.error")))
      .finally(() => setLoading(false));
  }, [t]);

  return (
    <AuthContext.Provider value={{ auth, loading, error }}>{children}</AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe usarse dentro de AuthProvider");
  return ctx;
}
