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
import type { DetailTab, Flash } from "../dashboard/constants";

export function useDashboard() {
  const { t } = useTranslation();

  const [zonas, setZonas] = useState<ZonaDto[] | null>(null);
  const [zonasError, setZonasError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detailTab, setDetailTab] = useState<DetailTab>("overview");

  const [lecturas, setLecturas] = useState<LecturaDto[] | null>(null);
  const [lecturasError, setLecturasError] = useState<string | null>(null);

  const [cultivos, setCultivos] = useState<CultivoDto[] | null>(null);
  const [umbrales, setUmbrales] = useState<UmbralDto[] | null>(null);
  const [metaError, setMetaError] = useState<string | null>(null);

  const [newZoneName, setNewZoneName] = useState("");
  const [newZoneDesc, setNewZoneDesc] = useState("");
  const [creatingZone, setCreatingZone] = useState(false);

  const [readingTipo, setReadingTipo] = useState<MetricaTipo>("TEMPERATURA_C");
  const [readingValor, setReadingValor] = useState("22");
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

  const refreshSelectedZone = useCallback(() => {
    if (!selectedId) return;
    loadLecturas(selectedId);
    loadMeta(selectedId);
  }, [selectedId, loadLecturas, loadMeta]);

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
          setDetailTab("zones");
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

  const handleDeleteZone = (z: ZonaDto) => {
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

  return {
    zonas,
    zonasError,
    selectedId,
    setSelectedId,
    detailTab,
    setDetailTab,
    selected,
    lecturas,
    lecturasError,
    cultivos,
    umbrales,
    metaError,
    newZoneName,
    setNewZoneName,
    newZoneDesc,
    setNewZoneDesc,
    creatingZone,
    readingTipo,
    setReadingTipo,
    readingValor,
    setReadingValor,
    readingInputError,
    setReadingInputError,
    savingReading,
    cultivoNombre,
    setCultivoNombre,
    cultivoVariedad,
    setCultivoVariedad,
    cultivoNotas,
    setCultivoNotas,
    savingCultivo,
    umbralTipo,
    setUmbralTipo,
    umbralMinStr,
    setUmbralMinStr,
    umbralMaxStr,
    setUmbralMaxStr,
    umbralInputError,
    setUmbralInputError,
    savingUmbral,
    flash,
    flashMessage,
    reloadZonas,
    refreshSelectedZone,
    loadLecturas,
    handleCreateZone,
    handleSaveReading,
    handleSaveCultivo,
    handleSaveUmbral,
    handleDeleteZone,
  };
}
