/**
 * Copyright (c) 2026 — Proyecto académico Invernadero.
 * Panel principal: zonas en barra lateral, detalle por pestañas (mediciones, cultivos, umbrales).
 */
import { useCallback, useEffect, useState, type FormEvent } from "react";
import { useTranslation } from "react-i18next";
import {
  crearCultivo,
  crearZona,
  definirUmbral,
  eliminarZona,
  fetchCultivos,
  fetchLecturas,
  fetchUmbrales,
  fetchZonas,
  registrarLectura,
  type CultivoDto,
  type LecturaDto,
  type MetricaTipo,
  type UmbralDto,
  type ZonaDto,
} from "../api/client";
import { useAuth } from "../context/AuthContext";
import { toBackendPublicHref } from "../api/backendPublicUrl";

const METRICAS: MetricaTipo[] = [
  "TEMPERATURA_C",
  "HUMEDAD_RELATIVA_PCT",
  "LUZ_LUX",
  "HUMEDAD_SUELO_PCT",
];

type DetailTab = "readings" | "crops" | "thresholds";

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

type Flash = null | "zone" | "reading" | "zoneDeleted" | "cultivo" | "umbral";

export function DashboardPage() {
  const { t, i18n } = useTranslation();
  const { auth } = useAuth();

  const [zonas, setZonas] = useState<ZonaDto[] | null>(null);
  const [zonasError, setZonasError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detailTab, setDetailTab] = useState<DetailTab>("readings");

  const [lecturas, setLecturas] = useState<LecturaDto[] | null>(null);
  const [lecturasError, setLecturasError] = useState<string | null>(null);

  const [cultivos, setCultivos] = useState<CultivoDto[] | null>(null);
  const [umbrales, setUmbrales] = useState<UmbralDto[] | null>(null);
  const [metaError, setMetaError] = useState<string | null>(null);

  const [newZoneName, setNewZoneName] = useState("");
  const [newZoneDesc, setNewZoneDesc] = useState("");
  const [creatingZone, setCreatingZone] = useState(false);

  const [readingTipo, setReadingTipo] = useState<MetricaTipo>("TEMPERATURA_C");
  const [readingValor, setReadingValor] = useState<string>("22");
  const [readingInputError, setReadingInputError] = useState<string | null>(null);
  const [savingReading, setSavingReading] = useState(false);

  const [cultivoNombre, setCultivoNombre] = useState("");
  const [cultivoVariedad, setCultivoVariedad] = useState("");
  const [cultivoNotas, setCultivoNotas] = useState("");
  const [savingCultivo, setSavingCultivo] = useState(false);

  const [umbralTipo, setUmbralTipo] = useState<MetricaTipo>("TEMPERATURA_C");
  const [umbralMinStr, setUmbralMinStr] = useState("");
  const [umbralMaxStr, setUmbralMaxStr] = useState("");
  const [umbralInputError, setUmbralInputError] = useState<string | null>(null);
  const [savingUmbral, setSavingUmbral] = useState(false);

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

  useEffect(() => {
    setDetailTab("readings");
  }, [selectedId]);

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

  const loadMeta = useCallback(
    (zonaId: string) => {
      setMetaError(null);
      setCultivos(null);
      setUmbrales(null);
      Promise.all([fetchCultivos(zonaId), fetchUmbrales(zonaId)])
        .then(([c, u]) => {
          setCultivos(c);
          setUmbrales(u);
        })
        .catch(() => setMetaError(t("zones.error")));
    },
    [t],
  );

  useEffect(() => {
    if (!selectedId) {
      setLecturas(null);
      setCultivos(null);
      setUmbrales(null);
      return;
    }
    loadLecturas(selectedId);
    loadMeta(selectedId);
  }, [selectedId, loadLecturas, loadMeta]);

  useEffect(() => {
    if (!flash) return;
    const tmr = window.setTimeout(() => setFlash(null), 3500);
    return () => window.clearTimeout(tmr);
  }, [flash]);

  useEffect(() => {
    setUmbralTipo("TEMPERATURA_C");
    setUmbralMinStr("");
    setUmbralMaxStr("");
    setUmbralInputError(null);
  }, [selectedId]);

  const selected = zonas?.find((z) => z.id === selectedId) ?? null;
  const locale = i18n.language.startsWith("es") ? "es" : "en";

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

  const handleSaveCultivo = (e: FormEvent) => {
    e.preventDefault();
    if (!selectedId || savingCultivo || !cultivoNombre.trim()) return;
    setSavingCultivo(true);
    crearCultivo(selectedId, cultivoNombre, cultivoVariedad, cultivoNotas)
      .then(() => {
        setFlash("cultivo");
        setCultivoNombre("");
        setCultivoVariedad("");
        setCultivoNotas("");
        return fetchCultivos(selectedId);
      })
      .then(setCultivos)
      .catch(() => setMetaError(t("zones.error")))
      .finally(() => setSavingCultivo(false));
  };

  const handleSaveUmbral = (e: FormEvent) => {
    e.preventDefault();
    if (!selectedId || savingUmbral) return;
    const rawMin = umbralMinStr.trim();
    const rawMax = umbralMaxStr.trim();
    let vmin: number | undefined;
    let vmax: number | undefined;
    if (rawMin !== "") {
      vmin = Number(rawMin.replace(",", "."));
      if (Number.isNaN(vmin)) {
        setUmbralInputError(t("reading.invalidValue"));
        return;
      }
    }
    if (rawMax !== "") {
      vmax = Number(rawMax.replace(",", "."));
      if (Number.isNaN(vmax)) {
        setUmbralInputError(t("reading.invalidValue"));
        return;
      }
    }
    if (vmin === undefined && vmax === undefined) {
      setUmbralInputError(t("thresholds.needOne"));
      return;
    }
    setUmbralInputError(null);
    setSavingUmbral(true);
    definirUmbral(selectedId, umbralTipo, vmin, vmax)
      .then(() => {
        setFlash("umbral");
        return fetchUmbrales(selectedId);
      })
      .then(setUmbrales)
      .catch(() => setMetaError(t("zones.error")))
      .finally(() => setSavingUmbral(false));
  };

  const flashMessage =
    flash === "zone"
      ? t("success.zone")
      : flash === "reading"
        ? t("success.reading")
        : flash === "cultivo"
          ? t("success.cultivo")
          : flash === "umbral"
            ? t("success.umbral")
            : flash === "zoneDeleted"
              ? t("success.zoneDeleted")
              : "";

  return (
    <div className="dashboard-app">
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
        <div className="flash-bar" role="status">
          {flashMessage}
        </div>
      )}

      <details className="help-banner">
        <summary className="help-banner__summary">{t("ui.quickGuide")}</summary>
        <ol className="help-banner__steps">
          <li>{t("steps.1")}</li>
          <li>{t("steps.2")}</li>
          <li>{t("steps.3")}</li>
        </ol>
      </details>

      <main className="dashboard">
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
                  onClick={() => setSelectedId(z.id)}
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

          <form className="new-zone-form" onSubmit={handleCreateZone}>
            <h3 className="section-label">{t("zones.newTitle")}</h3>
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
              className="input textarea textarea--compact"
              value={newZoneDesc}
              onChange={(ev) => setNewZoneDesc(ev.target.value)}
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

        <div className="workspace">
          {zonas !== null && zonas.length === 0 ? (
            <div className="card workspace-placeholder">
              <p className="workspace-placeholder__text">{t("ui.workspaceEmpty")}</p>
            </div>
          ) : zonas === null && !zonasError ? (
            <div className="card workspace-placeholder">
              <p className="muted">{t("ui.workspaceLoading")}</p>
            </div>
          ) : selected ? (
            <>
              <div className="zone-hero">
                <span className="zone-hero__badge">{t("ui.zoneActive")}</span>
                <h2 className="zone-hero__title">{selected.nombre}</h2>
                {selected.descripcion ? <p className="zone-hero__desc muted">{selected.descripcion}</p> : null}
              </div>

              <div className="tab-bar" role="tablist">
                <button
                  type="button"
                  role="tab"
                  aria-selected={detailTab === "readings"}
                  className={`tab-bar__btn ${detailTab === "readings" ? "tab-bar__btn--active" : ""}`}
                  onClick={() => setDetailTab("readings")}
                >
                  {t("ui.tab.readings")}
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={detailTab === "crops"}
                  className={`tab-bar__btn ${detailTab === "crops" ? "tab-bar__btn--active" : ""}`}
                  onClick={() => setDetailTab("crops")}
                >
                  {t("ui.tab.crops")}
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={detailTab === "thresholds"}
                  className={`tab-bar__btn ${detailTab === "thresholds" ? "tab-bar__btn--active" : ""}`}
                  onClick={() => setDetailTab("thresholds")}
                >
                  {t("ui.tab.thresholds")}
                </button>
              </div>

              <div className="card tab-sheet" role="tabpanel">
                {detailTab === "readings" && (
                  <div className="tab-sheet__inner">
                    <div className="panel-toolbar">
                      <h3 className="panel-toolbar__title">{t("readings.historyTitle")}</h3>
                      <button type="button" className="btn-ghost" onClick={() => loadLecturas(selected.id)}>
                        {t("readings.refresh")}
                      </button>
                    </div>
                    {lecturas === null && !lecturasError && <p className="muted">{t("readings.loading")}</p>}
                    {lecturasError && <p className="error">{lecturasError}</p>}
                    {lecturas && lecturas.length === 0 && <p className="muted">{t("readings.none")}</p>}
                    {lecturas && lecturas.length > 0 && (
                      <div className="table-wrap">
                        <table className="data-table data-table--comfortable">
                          <thead>
                            <tr>
                              <th>{t("readings.colTime")}</th>
                              <th>{t("readings.colMetric")}</th>
                              <th className="col-num">{t("readings.colValue")}</th>
                            </tr>
                          </thead>
                          <tbody>
                            {lecturas.map((r) => (
                              <tr key={r.id}>
                                <td>{formatDate(r.registradoEn, locale)}</td>
                                <td>{t(`metric.${r.tipo}`)}</td>
                                <td className="col-num">{r.valor}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}

                    <div className="section-divider" />
                    <h3 className="section-label">{t("readings.newTitle")}</h3>
                    <form className="form-grid-reading" onSubmit={handleSaveReading}>
                      <label className="field">
                        <span className="field__label">{t("readings.metric")}</span>
                        <select
                          className="input"
                          value={readingTipo}
                          onChange={(ev) => setReadingTipo(ev.target.value as MetricaTipo)}
                        >
                          {METRICAS.map((m) => (
                            <option key={m} value={m}>
                              {t(`metric.${m}`)}
                            </option>
                          ))}
                        </select>
                      </label>
                      <label className="field">
                        <span className="field__label">{t("readings.value")}</span>
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
                      <div className="form-grid-reading__action">
                        {readingInputError ? (
                          <p id="reading-err" className="error small form-grid-reading__error">
                            {readingInputError}
                          </p>
                        ) : null}
                        <button type="submit" className="btn-primary-solid" disabled={savingReading}>
                          {savingReading ? t("readings.saving") : t("readings.submit")}
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                {detailTab === "crops" && (
                  <div className="tab-sheet__inner">
                    {metaError && <p className="error">{metaError}</p>}
                    <h3 className="panel-toolbar__title panel-toolbar__title--solo">{t("crops.title")}</h3>
                    {cultivos === null && !metaError && <p className="muted">{t("crops.loading")}</p>}
                    {cultivos && cultivos.length === 0 && !metaError && (
                      <p className="muted empty-hint">{t("crops.empty")}</p>
                    )}
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
                    <form className="form-grid-crop" onSubmit={handleSaveCultivo}>
                      <label className="field span-2-md">
                        <span className="field__label">{t("crops.nombre")}</span>
                        <input
                          className="input"
                          value={cultivoNombre}
                          onChange={(ev) => setCultivoNombre(ev.target.value)}
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
                          onChange={(ev) => setCultivoVariedad(ev.target.value)}
                          maxLength={120}
                          aria-label={t("crops.variedad")}
                        />
                      </label>
                      <label className="field">
                        <span className="field__label">{t("crops.notas")}</span>
                        <input
                          className="input"
                          value={cultivoNotas}
                          onChange={(ev) => setCultivoNotas(ev.target.value)}
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
                )}

                {detailTab === "thresholds" && (
                  <div className="tab-sheet__inner">
                    <h3 className="panel-toolbar__title panel-toolbar__title--solo">{t("thresholds.title")}</h3>
                    <p className="threshold-lead muted">{t("thresholds.help")}</p>
                    {metaError && <p className="error">{metaError}</p>}
                    {umbrales === null && !metaError && <p className="muted">{t("thresholds.loading")}</p>}
                    {umbrales && umbrales.length === 0 && !metaError && (
                      <p className="muted empty-hint">{t("thresholds.empty")}</p>
                    )}
                    {umbrales && umbrales.length > 0 && (
                      <div className="table-wrap">
                        <table className="data-table data-table--comfortable">
                          <thead>
                            <tr>
                              <th>{t("thresholds.metric")}</th>
                              <th className="col-num">{t("thresholds.min")}</th>
                              <th className="col-num">{t("thresholds.max")}</th>
                            </tr>
                          </thead>
                          <tbody>
                            {umbrales.map((u) => (
                              <tr key={u.id}>
                                <td>{t(`metric.${u.tipo}`)}</td>
                                <td className="col-num">{u.valorMin != null ? u.valorMin : "—"}</td>
                                <td className="col-num">{u.valorMax != null ? u.valorMax : "—"}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                    <div className="section-divider" />
                    <h3 className="section-label">{t("thresholds.formSection")}</h3>
                    <form className="form-grid-threshold" onSubmit={handleSaveUmbral}>
                      <label className="field">
                        <span className="field__label">{t("thresholds.metric")}</span>
                        <select
                          className="input"
                          value={umbralTipo}
                          onChange={(ev) => setUmbralTipo(ev.target.value as MetricaTipo)}
                        >
                          {METRICAS.map((m) => (
                            <option key={m} value={m}>
                              {t(`metric.${m}`)}
                            </option>
                          ))}
                        </select>
                      </label>
                      <label className="field">
                        <span className="field__label">{t("thresholds.min")}</span>
                        <input
                          className="input"
                          type="text"
                          inputMode="decimal"
                          value={umbralMinStr}
                          onChange={(ev) => {
                            setUmbralMinStr(ev.target.value);
                            setUmbralInputError(null);
                          }}
                        />
                      </label>
                      <label className="field">
                        <span className="field__label">{t("thresholds.max")}</span>
                        <input
                          className="input"
                          type="text"
                          inputMode="decimal"
                          value={umbralMaxStr}
                          onChange={(ev) => {
                            setUmbralMaxStr(ev.target.value);
                            setUmbralInputError(null);
                          }}
                        />
                      </label>
                      <div className="form-grid-reading__action form-grid-threshold__action">
                        {umbralInputError ? (
                          <p id="umbral-err" className="error small">
                            {umbralInputError}
                          </p>
                        ) : null}
                        <button type="submit" className="btn-secondary-outline" disabled={savingUmbral}>
                          {savingUmbral ? t("thresholds.saving") : t("thresholds.submit")}
                        </button>
                      </div>
                    </form>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="card workspace-placeholder">
              <p className="muted">{t("ui.workspaceLoading")}</p>
            </div>
          )}
        </div>
      </main>

      <footer className="app-footer muted">
        <small>
          {t("metrics.temp")} · {t("metrics.humidity")}
        </small>
      </footer>
    </div>
  );
}
