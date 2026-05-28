import { useEffect, useState } from "react";
import {
  fetchCultivos,
  fetchLecturas,
  fetchUmbrales,
  type CultivoDto,
  type LecturaDto,
  type UmbralDto,
  type ZonaDto,
} from "../api/client";

export type ZonaSnapshot = {
  lecturas: LecturaDto[];
  cultivos: CultivoDto[];
  umbrales: UmbralDto[];
  loading: boolean;
  error: boolean;
};

export function useZonaSnapshots(zonas: ZonaDto[] | null): Record<string, ZonaSnapshot> {
  const [snapshots, setSnapshots] = useState<Record<string, ZonaSnapshot>>({});

  useEffect(() => {
    if (!zonas?.length) {
      setSnapshots({});
      return;
    }

    let cancelled = false;
    const loadingState = Object.fromEntries(
      zonas.map((z) => [
        z.id,
        { lecturas: [], cultivos: [], umbrales: [], loading: true, error: false } satisfies ZonaSnapshot,
      ]),
    );
    setSnapshots(loadingState);

    void Promise.all(
      zonas.map(async (z) => {
        try {
          const [lecturas, cultivos, umbrales] = await Promise.all([
            fetchLecturas(z.id, 20),
            fetchCultivos(z.id),
            fetchUmbrales(z.id),
          ]);
          if (cancelled) return;
          setSnapshots((prev) => ({
            ...prev,
            [z.id]: { lecturas, cultivos, umbrales, loading: false, error: false },
          }));
        } catch {
          if (cancelled) return;
          setSnapshots((prev) => ({
            ...prev,
            [z.id]: {
              lecturas: [],
              cultivos: [],
              umbrales: [],
              loading: false,
              error: true,
            },
          }));
        }
      }),
    );

    return () => {
      cancelled = true;
    };
  }, [zonas]);

  return snapshots;
}
