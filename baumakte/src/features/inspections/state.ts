import { AREAS } from "@/lib/fll/catalog";
import type {
  AreaFinding,
  AreaKey,
  Assessment,
  DevPhase,
  Findings,
  HabitatFeature,
  Urgency,
  Vitality,
} from "@/types";

export interface MeasureEntwurf {
  id: string;
  kind: string;
  urgency: Urgency;
  due_on: string;
  note: string | null;
}

export interface FotoEntwurf {
  id: string;
  area: AreaKey | null;
  storage_path: string;
  taken_at: string;
  lat: number | null;
  lng: number | null;
  sha256: string;
  vorschau: string;
}

export interface KontrolleEntwurf {
  id: string;
  treeId: string;
  findings: Findings;
  habitat: HabitatFeature[];
  devPhase: DevPhase;
  vitality: Vitality;
  assessment: Assessment;
  intervalMonths: number;
  nextDueOn: string;
  note: string;
  measures: MeasureEntwurf[];
  photos: FotoEntwurf[];
}

/** Alle Bereiche starten auf "ohne Befund" - ein unauffaelliger Baum ist damit sofort fertig. */
export function leereFindings(): Findings {
  const leer: AreaFinding = { ok: true, codes: [], note: null, not_visible: false };
  return Object.fromEntries(AREAS.map((a) => [a.key, { ...leer }])) as Findings;
}

export function neuerEntwurf(treeId: string, id: string, nextDueOn: string): KontrolleEntwurf {
  return {
    id,
    treeId,
    findings: leereFindings(),
    habitat: [],
    devPhase: "reife",
    vitality: "0",
    assessment: "gegeben",
    intervalMonths: 24,
    nextDueOn,
    note: "",
    measures: [],
    photos: [],
  };
}

export function anzahlBefunde(findings: Findings): number {
  return Object.values(findings).reduce((n, f) => n + (f.ok ? 0 : Math.max(1, f.codes.length)), 0);
}
