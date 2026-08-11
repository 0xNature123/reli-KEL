/** Zentrale Typen. Werden von Server, Client und Dexie gleichermassen benutzt. */

export type Uuid = string;

export type AreaKey =
  | "umfeld"
  | "stammfuss"
  | "stamm"
  | "kronenansatz"
  | "starkaeste"
  | "krone";

export type Assessment = "gegeben" | "eingeschraenkt" | "nicht_gegeben";

/** Vitalitaet nach Roloff, getrennt von der Verkehrssicherheit bewertet. */
export type Vitality = "0" | "1" | "2" | "3";

export type DevPhase = "jugend" | "reife" | "alterung";

export type Urgency = "sofort" | "drei_monate" | "naechste_kontrolle";

export type MeasureStatus = "offen" | "erledigt";

export interface AreaFinding {
  ok: boolean;
  codes: string[];
  note: string | null;
  /** Bereich war nicht einsehbar (Belaubung, Bewuchs, Bebauung). Fuer die Beweiskette wichtig. */
  not_visible?: boolean;
}

export type Findings = Record<AreaKey, AreaFinding>;

/** Artenschutzbeobachtung nach BNatSchG. Wird bei der Kontrolle miterfasst. */
export interface HabitatFeature {
  kind: "hoehle" | "spalte" | "nest" | "totholz_stehend" | "fledermausquartier";
  area: AreaKey | null;
  note: string | null;
}

export interface Org {
  id: Uuid;
  name: string;
  address: string | null;
  logo_path: string | null;
  inspector_name: string | null;
  certificate_no: string | null;
  plan: PlanKey | null;
  subscription_status: SubscriptionStatus;
  trial_ends_at: string | null;
  current_period_end: string | null;
  stripe_customer_id: string | null;
  created_at: string;
}

export interface Profile {
  id: Uuid;
  org_id: Uuid;
  full_name: string;
  created_at: string;
}

export interface Site {
  id: Uuid;
  org_id: Uuid;
  name: string;
  address: string | null;
  lat: number | null;
  lng: number | null;
  client_name: string | null;
  created_at: string;
}

export interface Tree {
  id: Uuid;
  org_id: Uuid;
  site_id: Uuid;
  number: string;
  species: string;
  height_class: string | null;
  dbh_cm: number | null;
  lat: number;
  lng: number;
  gps_accuracy_m: number | null;
  removed_at: string | null;
  created_at: string;
}

export interface Inspection {
  id: Uuid;
  org_id: Uuid;
  tree_id: Uuid;
  inspector_id: Uuid;
  inspector_name: string;
  inspected_at: string;
  method: string;
  dev_phase: DevPhase;
  vitality: Vitality;
  findings: Findings;
  habitat_features: HabitatFeature[];
  assessment: Assessment;
  next_interval_months: number;
  next_due_on: string;
  note: string | null;
  voids_inspection_id: Uuid | null;
  void_reason: string | null;
  prev_hash: string | null;
  hash: string;
  created_at: string;
}

export interface Measure {
  id: Uuid;
  org_id: Uuid;
  tree_id: Uuid;
  inspection_id: Uuid;
  kind: string;
  urgency: Urgency;
  due_on: string;
  note: string | null;
  status: MeasureStatus;
  /** Durchfuehrungsnachweis: wann, von wem, mit welcher Bemerkung ausgefuehrt. */
  done_at: string | null;
  done_by_name: string | null;
  done_note: string | null;
  created_at: string;
}

export interface Photo {
  id: Uuid;
  org_id: Uuid;
  inspection_id: Uuid;
  tree_id: Uuid;
  area: string | null;
  storage_path: string;
  taken_at: string;
  lat: number | null;
  lng: number | null;
  sha256: string;
  created_at: string;
}

export interface Report {
  id: Uuid;
  org_id: Uuid;
  site_id: Uuid;
  created_by: Uuid;
  title: string;
  period_from: string | null;
  period_to: string | null;
  tree_count: number;
  storage_path: string;
  sha256: string;
  share_token: string | null;
  /** Zeitpunkt der Erzeugung, von der App gesetzt - erscheint im PDF und in der Liste. */
  generated_at: string;
  created_at: string;
}

/* ---------- Abonnement ---------- */

export type PlanKey = "kontrolleur" | "betrieb" | "eigentuemer";

export type SubscriptionStatus =
  | "trial"
  | "active"
  | "past_due"
  | "canceled"
  | "incomplete"
  | "none";
