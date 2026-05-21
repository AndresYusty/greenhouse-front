/**
 * Copyright (c) 2026 — Proyecto académico Invernadero.
 * Panel principal: zonas, lecturas y formularios.
 */
import { useCallback, useEffect, useState, type FormEvent } from "react";
import { useTranslation } from "react-i18next";
import {
  crearZona,
  eliminarZona,
  fetchLecturas,
  fetchZonas,
  registrarLectura,
  type LecturaDto,
  type MetricaTipo,
  type ZonaDto,
} from "../api/client";
import { useAuth } from "../context/AuthContext";

const METRICAS: MetricaTipo[] = [
  "TEMPERATURA_C",
  "HUMEDAD_RELATIVA_PCT",
  "LUZ_LUX",
  "HUMEDAD_SUELO_PCT",
];

function formatDate(iso: string, locale: string): string {
  try {
    return new Date(iso).toLocaleString(locale.startsWith("es") ? "es" : "en", {
      dateStyle: "short",
      timeStyle: "short",
    });
  } catch {
    return iso;
  }
}

type Flash = null | "zone" | "reading" | "zoneDeleted";

export function DashboardPage() {
  const { t, i18n } = useTranslation();
  const { auth } = useAuth();

  const [zonas, setZonas] = useState<ZonaDto[] | null>(null);
  const [zonasError, setZonasError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const [lecturas, setLecturas] = useState<LecturaDto[] | null>(null);
  const [lecturasError, setLecturasError] = useState<string | null>(null);

  const [newZoneName, setNewZoneName] = useState("");
  const [newZoneDesc, setNewZoneDesc] = useState("");
  const [creatingZone, setCreatingZone] = useState(false);

  const [readingTipo, setReadingTipo] = useState<MetricaTipo>("TEMPERATURA_C");
  const [readingValor, setReadingValor] = useState<string>("22");
  const [readingInputError, setReadingInputError] = useState<string | null>(null);
  const [savingReading, setSavingReading] = useState(false);

  const [flash, setFlash] = useState<Flash>(null);

  const reloadZonas = useCallback(() => {
    setZonasError(null);
    return fetchZonas()
      .then(setZonas)
      .catch(() => setZonasError(t("zones.error")));
  }, [t]);

  useEffect(() => {
    void reloadZonas();
  }, [reloadZonas]);

  useEffect(() => {
    if (!zonas || zonas.length === 0) {
      setSelectedId(null);
      return;
    }
    setSelectedId((current) => {
      if (current && zonas.some((z) => z.id === current)) return current;
      return zonas[0].id;
    });
  }, [zonas]);

  const loadLecturas = useCallback(
    (zonaId: string) => {
      setLecturas(null);
      setLecturasError(null);
      fetchLecturas(zonaId)
        .then(setLecturas)
        .catch(() => setLecturasError(t("zones.error")));
    },
    [t],
  );

  useEffect(() => {
    if (selectedId) loadLecturas(selectedId);
    else setLecturas(null);
  }, [selectedId, loadLecturas]);

  useEffect(() => {
    if (!flash) return;
    const tmr = window.setTimeout(() => setFlash(null), 3500);
    return () => window.clearTimeout(tmr);
  }, [flash]);

  const selected = zonas?.find((z) => z.id === selectedId) ?? null;

  const handleCreateZone = (e: FormEvent) => {
    e.preventDefault();
    if (!newZoneName.trim() || creatingZone) return;
    setCreatingZone(true);
    crearZona(newZoneName, newZoneDesc)
      .then((z) => {
        setNewZoneName("");
        setNewZoneDesc("");
        setFlash("zone");
        return fetchZonas().then((list) => {
          setZonas(list);
          setSelectedId(z.id);
        });
      })
      .catch(() => setZonasError(t("zones.error")))
      .finally(() => setCreatingZone(false));
  };

  const handleSaveReading = (e: FormEvent) => {
    e.preventDefault();
    if (!selectedId || savingReading) return;
    const v = Number(readingValor.replace(",", "."));
    if (Number.isNaN(v)) {
      setReadingInputError(t("reading.invalidValue"));
      return;
    }
    setReadingInputError(null);
    setSavingReading(true);
    registrarLectura(selectedId, readingTipo, v)
      .then(() => {
        setFlash("reading");
        loadLecturas(selectedId);
      })
      .catch(() => setLecturasError(t("zones.error")))
      .finally(() => setSavingReading(false));
  };

  const locale = i18n.language.startsWith("es") ? "es" : "en";

  return (
    <div className="layout">
      <header className="header">
        <div>
          <h1>{t("app.title")}</h1>
          <p className="subtitle muted">{t("app.subtitle")}</p>
        </div>
        <div className="header-actions">
          {auth?.oauth2Enabled && auth.authenticated ? (
            <div className="user-session">
              <span className="user-label muted" title={auth.email ?? auth.name ?? undefined}>
                {auth.email ?? auth.name ?? ""}
              </span>
              <a className="secondary logout-link" href="/logout">
                {t("auth.logout")}
              </a>
            </div>
          ) : null}
          <div className="lang">
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

      {flash && (
        <div className="flash-success" role="status">
          {flash === "zone" ? t("success.zone") : flash === "reading" ? t("success.reading") : t("success.zoneDeleted")}
        </div>
      )}

      <section className="card steps-card">
        <h2 className="steps-heading">{t("steps.title")}</h2>
        <ol className="steps-list">
          <li>{t("steps.1")}</li>
          <li>{t("steps.2")}</li>
          <li>{t("steps.3")}</li>
        </ol>
      </section>

      <main className="dashboard">
        <section className="card zone-panel">
          <h2>{t("zones.title")}</h2>
          <p className="panel-hint muted">{t("steps.1")}</p>
          {zonas === null && !zonasError && <p className="muted">{t("zones.loading")}</p>}
          {zonasError && <p className="error">{zonasError}</p>}
          {zonas && zonas.length === 0 && <p className="muted">{t("zones.empty")}</p>}
          <ul className="zone-list">
            {zonas?.map((z) => (
              <li key={z.id} className="zone-row">
                <button
                  type="button"
                  className={`zone-item ${selectedId === z.id ? "selected" : ""}`}
                  onClick={() => setSelectedId(z.id)}
                >
                  <span className="zone-name">{z.nombre}</span>
                  {z.descripcion ? <span className="zone-desc muted">{z.descripcion}</span> : null}
                </button>
                <button
                  type="button"
                  className="btn-delete-zone"
                  title={t("zones.delete")}
                  aria-label={t("zones.delete")}
                  onClick={(ev) => {
                    ev.preventDefault();
                    ev.stopPropagation();
                    if (!window.confirm(t("zones.deleteConfirm", { name: z.nombre }))) return;
                    eliminarZona(z.id)
                      .then(() => {
                        setFlash("zoneDeleted");
                        return fetchZonas();
                      })
                      .then((list) => {
                        setZonas(list);
                        if (selectedId === z.id) setSelectedId(list[0]?.id ?? null);
                      })
                      .catch(() => setZonasError(t("zones.error")));
                  }}
                >
                  ×
                </button>
              </li>
            ))}
          </ul>

          <form className="stack-form" onSubmit={handleCreateZone}>
            <h3 className="form-heading">{t("zones.newTitle")}</h3>
            <input
              className="input"
              value={newZoneName}
              onChange={(ev) => setNewZoneName(ev.target.value)}
              placeholder={t("zones.namePlaceholder")}
              required
              maxLength={120}
              aria-label={t("zones.namePlaceholder")}
            />
            <textarea
              className="input textarea"
              value={newZoneDesc}
              onChange={(ev) => setNewZoneDesc(ev.target.value)}
              placeholder={t("zones.descPlaceholder")}
              rows={2}
              maxLength={2000}
              aria-label={t("zones.descPlaceholder")}
            />
            <button type="submit" className="primary" disabled={creatingZone || !newZoneName.trim()}>
              {creatingZone ? t("zones.creating") : t("zones.submit")}
            </button>
          </form>
        </section>

        <section className="card detail-panel">
          {!selected && zonas !== null && zonas.length === 0 && (
            <div className="empty-detail">
              <p className="muted">{t("zones.empty")}</p>
            </div>
          )}
          {zonas === null && !zonasError && (
            <div className="empty-detail">
              <p className="muted">{t("zones.loading")}</p>
            </div>
          )}
          {selected && (
            <>
              <div className="detail-head">
                <h2>{selected.nombre}</h2>
                {selected.descripcion ? <p className="muted">{selected.descripcion}</p> : null}
              </div>

              <div className="readings-head">
                <h3>{t("readings.title")}</h3>
                <button type="button" className="secondary" onClick={() => loadLecturas(selected.id)}>
                  {t("readings.refresh")}
                </button>
              </div>

              {lecturas === null && !lecturasError && <p className="muted">{t("readings.loading")}</p>}
              {lecturasError && <p className="error">{lecturasError}</p>}
              {lecturas && lecturas.length === 0 && <p className="muted">{t("readings.none")}</p>}
              {lecturas && lecturas.length > 0 && (
                <div className="table-wrap">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>{t("readings.colTime")}</th>
                        <th>{t("readings.colMetric")}</th>
                        <th>{t("readings.colValue")}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {lecturas.map((r) => (
                        <tr key={r.id}>
                          <td>{formatDate(r.registradoEn, locale)}</td>
                          <td>{t(`metric.${r.tipo}`)}</td>
                          <td className="num">{r.valor}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              <form className="stack-form reading-form" onSubmit={handleSaveReading}>
                <h3 className="form-heading">{t("readings.newTitle")}</h3>
                <label className="label-row">
                  <span>{t("readings.metric")}</span>
                  <select className="input" value={readingTipo} onChange={(ev) => setReadingTipo(ev.target.value as MetricaTipo)}>
                    {METRICAS.map((m) => (
                      <option key={m} value={m}>
                        {t(`metric.${m}`)}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="label-row">
                  <span>{t("readings.value")}</span>
                  <input
                    className="input"
                    type="text"
                    inputMode="decimal"
                    value={readingValor}
                    onChange={(ev) => {
                      setReadingValor(ev.target.value);
                      setReadingInputError(null);
                    }}
                    aria-invalid={!!readingInputError}
                    aria-describedby={readingInputError ? "reading-err" : undefined}
                  />
                </label>
                {readingInputError ? (
                  <p id="reading-err" className="error small">
                    {readingInputError}
                  </p>
                ) : null}
                <button type="submit" className="primary" disabled={savingReading}>
                  {savingReading ? t("readings.saving") : t("readings.submit")}
                </button>
              </form>
            </>
          )}
        </section>
      </main>

      <footer className="footer muted">
        <small>
          {t("metrics.temp")} · {t("metrics.humidity")}
        </small>
      </footer>
    </div>
  );
}
