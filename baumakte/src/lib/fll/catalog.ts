import type { AreaKey } from "@/types";

/**
 * Befundkatalog der Regelkontrolle (Sichtkontrolle vom Boden).
 *
 * Der Katalog liegt bewusst im Code und nicht in der Datenbank: er aendert sich nur
 * mit einem Deployment, und ein Katalog in der DB verlangt sofort eine Pflegeoberflaeche.
 *
 * Rechtlicher Hinweis: Die Systematik folgt der Gliederung einer Baumkontrolle in
 * Baumbereiche. Die Bezeichnungen sind eigenstaendig formuliert und uebernehmen keine
 * Formulierungen aus der FLL-Baumkontrollrichtlinie. Im Bericht heisst es
 * "in Anlehnung an die FLL-Baumkontrollrichtlinie", nicht "FLL-zertifiziert".
 *
 * severityHint steuert nur die Reihenfolge im Bericht und einen Hinweis in der UI.
 * Die fachliche Bewertung trifft immer der Kontrolleur.
 */

export type SeverityHint = "gering" | "mittel" | "hoch";

export interface FindingDef {
  readonly code: string;
  readonly label: string;
  readonly severityHint: SeverityHint;
}

export interface AreaDef {
  readonly key: AreaKey;
  readonly label: string;
  readonly hint: string;
  readonly findings: readonly FindingDef[];
}

export const AREAS = [
  {
    key: "umfeld",
    label: "Baumumfeld und Wurzelbereich",
    hint: "Standort, Bodenoberflaeche, Eingriffe im Wurzelraum",
    findings: [
      { code: "grabungsarbeiten", label: "Grabung oder Leitungsbau im Wurzelbereich", severityHint: "hoch" },
      { code: "bodenverdichtung", label: "Bodenverdichtung, befahrene Flaeche", severityHint: "mittel" },
      { code: "versiegelung", label: "Versiegelung bis an den Stamm", severityHint: "mittel" },
      { code: "aufschuettung", label: "Aufschuettung ueber dem Wurzelanlauf", severityHint: "mittel" },
      { code: "abgrabung", label: "Abgrabung, freiliegende Wurzeln", severityHint: "hoch" },
      { code: "wurzeln_beschaedigt", label: "Wurzeln sichtbar beschaedigt oder gekappt", severityHint: "hoch" },
      { code: "pilz_wurzelbereich", label: "Pilzfruchtkoerper im Wurzelbereich", severityHint: "hoch" },
      { code: "bodenaufwoelbung", label: "Bodenaufwoelbung, Hinweis auf Wurzelteller-Bewegung", severityHint: "hoch" },
      { code: "trockenstandort", label: "Anhaltender Wassermangel am Standort", severityHint: "gering" },
      { code: "salzeintrag", label: "Streusalz- oder Schadstoffeintrag", severityHint: "gering" },
      { code: "bewuchs_sichtbehinderung", label: "Bewuchs behindert die Sicht auf den Stammfuss", severityHint: "gering" },
    ],
  },
  {
    key: "stammfuss",
    label: "Stammfuss",
    hint: "Wurzelanlaeufe, Uebergang Boden zu Stamm",
    findings: [
      { code: "pilzfruchtkoerper", label: "Pilzfruchtkoerper am Stammfuss", severityHint: "hoch" },
      { code: "wurzelanlauf_fehlend", label: "Wurzelanlauf einseitig fehlend oder schwach", severityHint: "hoch" },
      { code: "wurzelanlauf_beschaedigt", label: "Wurzelanlauf verletzt oder ueberfahren", severityHint: "mittel" },
      { code: "hohlraum", label: "Hoehlung oder Ausfaulung erkennbar", severityHint: "hoch" },
      { code: "rindenschaden_fuss", label: "Rindenverletzung am Stammfuss", severityHint: "mittel" },
      { code: "wuergewurzel", label: "Wuergewurzel oder Einschnuerung", severityHint: "mittel" },
      { code: "mykorrhiza_pilz_harmlos", label: "Pilzbewuchs ohne holzzersetzende Wirkung", severityHint: "gering" },
      { code: "bodenriss", label: "Riss im Boden entlang des Wurzeltellers", severityHint: "hoch" },
      { code: "stammfuss_verdeckt", label: "Stammfuss durch Bewuchs oder Belag verdeckt", severityHint: "gering" },
    ],
  },
  {
    key: "stamm",
    label: "Stamm",
    hint: "Stammachse bis zum Kronenansatz",
    findings: [
      { code: "laengsriss", label: "Laengsriss im Stamm", severityHint: "hoch" },
      { code: "hoehlung_stamm", label: "Hoehlung, Ausfaulung oder Loch", severityHint: "hoch" },
      { code: "rindenschaden", label: "Rindenverletzung, abgeloeste Rinde", severityHint: "mittel" },
      { code: "pilz_stamm", label: "Pilzfruchtkoerper am Stamm", severityHint: "hoch" },
      { code: "wulstbildung", label: "Wulst- oder Rippenbildung als Ueberwallungsreaktion", severityHint: "mittel" },
      { code: "neigung_zunehmend", label: "Neigung, Hinweis auf Zunahme", severityHint: "hoch" },
      { code: "blitzschaden", label: "Blitzrinne oder Brandschaden", severityHint: "hoch" },
      { code: "stammaustrieb", label: "Starker Stammaustrieb", severityHint: "gering" },
      { code: "schleimfluss", label: "Schleimfluss oder Nassbereich", severityHint: "mittel" },
      { code: "insektenbefall", label: "Bohrloecher, Insektenbefall", severityHint: "mittel" },
      { code: "fremdkoerper", label: "Fremdkoerper im Stamm, Beschilderung, Leitung", severityHint: "gering" },
    ],
  },
  {
    key: "kronenansatz",
    label: "Kronenansatz",
    hint: "Uebergang Stamm zu Starkaesten, Zwiesel",
    findings: [
      { code: "zwiesel_eingewachsen", label: "Zwiesel mit eingewachsener Rinde", severityHint: "hoch" },
      { code: "zwiesel_riss", label: "Riss in der Zwieselgabel", severityHint: "hoch" },
      { code: "faeule_ansatz", label: "Faeule im Kronenansatz", severityHint: "hoch" },
      { code: "hoehlung_ansatz", label: "Hoehlung im Kronenansatz", severityHint: "hoch" },
      { code: "wasserreiser", label: "Dichte Wasserreiser am Kronenansatz", severityHint: "gering" },
      { code: "kappungsstelle", label: "Alte Kappungsstelle mit Ueberwallungsproblem", severityHint: "mittel" },
      { code: "kronensicherung_vorhanden", label: "Kronensicherung vorhanden, Zustand pruefen", severityHint: "mittel" },
      { code: "ansatz_nicht_einsehbar", label: "Kronenansatz nicht einsehbar", severityHint: "gering" },
    ],
  },
  {
    key: "starkaeste",
    label: "Starkaeste",
    hint: "Aeste ab etwa 10 cm Durchmesser",
    findings: [
      { code: "totholz_stark", label: "Starkes Totholz ueber 5 cm Durchmesser", severityHint: "hoch" },
      { code: "astbruch", label: "Angebrochener oder haengender Ast", severityHint: "hoch" },
      { code: "riss_starkast", label: "Riss am Astansatz", severityHint: "hoch" },
      { code: "faeule_starkast", label: "Faeule oder Hoehlung im Starkast", severityHint: "hoch" },
      { code: "pilz_starkast", label: "Pilzfruchtkoerper am Starkast", severityHint: "hoch" },
      { code: "ueberlaenge", label: "Ueberlanger Ast mit unguenstiger Hebelwirkung", severityHint: "mittel" },
      { code: "lichtraumprofil", label: "Lichtraumprofil ueber Weg oder Fahrbahn unterschritten", severityHint: "mittel" },
      { code: "reibestelle", label: "Reibestelle zwischen Aesten", severityHint: "gering" },
      { code: "kappungsfolge", label: "Staendige Neuaustriebe nach Kappung, schwach angebunden", severityHint: "mittel" },
    ],
  },
  {
    key: "krone",
    label: "Krone und Feinaeste",
    hint: "Belaubung, Feinastbereich, Gesamtbild",
    findings: [
      { code: "totholz_fein", label: "Feintotholz in der Krone", severityHint: "gering" },
      { code: "lichte_krone", label: "Lichte Krone, verringerte Blattdichte", severityHint: "mittel" },
      { code: "kleines_blatt", label: "Verkleinertes Blatt, kurzer Zuwachs", severityHint: "mittel" },
      { code: "kronenverlichtung_stark", label: "Starke Kronenverlichtung ueber die Haelfte", severityHint: "hoch" },
      { code: "wipfelduerre", label: "Absterben im oberen Kronenbereich", severityHint: "hoch" },
      { code: "einseitige_krone", label: "Einseitiger Kronenaufbau, Ungleichgewicht", severityHint: "mittel" },
      { code: "pilzbefall_blatt", label: "Blattkrankheit oder Pilzbefall im Laub", severityHint: "gering" },
      { code: "schaedling_krone", label: "Auffaelliger Schaedlingsbefall", severityHint: "mittel" },
      { code: "misteln", label: "Starker Mistelbesatz", severityHint: "mittel" },
      { code: "krone_nicht_einsehbar", label: "Krone wegen Belaubung nur eingeschraenkt einsehbar", severityHint: "gering" },
    ],
  },
] as const satisfies readonly AreaDef[];

export type FindingCode = (typeof AREAS)[number]["findings"][number]["code"];

export const AREA_KEYS = AREAS.map((a) => a.key) as readonly AreaKey[];

const LABELS: Record<string, string> = Object.fromEntries(
  AREAS.flatMap((a) => a.findings.map((f) => [f.code, f.label])),
);

export function findingLabel(code: string): string {
  return LABELS[code] ?? code;
}

export function areaLabel(key: AreaKey): string {
  return AREAS.find((a) => a.key === key)?.label ?? key;
}

/* ---------- Massnahmen ---------- */

export const MEASURE_KINDS = [
  { code: "totholz", label: "Totholz entnehmen" },
  { code: "kronenpflege", label: "Kronenpflege" },
  { code: "einkuerzung", label: "Kroneneinkuerzung" },
  { code: "stammaustrieb", label: "Stammaustrieb entfernen" },
  { code: "lichtraum", label: "Lichtraumprofil herstellen" },
  { code: "sicherung", label: "Kronensicherung einbauen oder pruefen" },
  { code: "eingehende_untersuchung", label: "Eingehende Untersuchung veranlassen" },
  { code: "kontrollintervall_kuerzen", label: "Kontrollintervall verkuerzen" },
  { code: "faellung", label: "Faellung" },
  { code: "sonstiges", label: "Sonstiges" },
] as const;

export type MeasureKind = (typeof MEASURE_KINDS)[number]["code"];

export function measureLabel(code: string): string {
  return MEASURE_KINDS.find((m) => m.code === code)?.label ?? code;
}

/** Massnahmen, die eine artenschutzrechtliche Pruefung ausloesen. */
export const HABITAT_RELEVANT_MEASURES: readonly string[] = ["faellung", "einkuerzung", "totholz"];

/* ---------- Artenschutz ---------- */

export const HABITAT_KINDS = [
  { code: "hoehle", label: "Baumhoehle" },
  { code: "spalte", label: "Spalte oder Rissquartier" },
  { code: "nest", label: "Nest oder Horst" },
  { code: "totholz_stehend", label: "Stehendes Totholz als Lebensraum" },
  { code: "fledermausquartier", label: "Hinweis auf Fledermausquartier" },
] as const;

export function habitatLabel(code: string): string {
  return HABITAT_KINDS.find((h) => h.code === code)?.label ?? code;
}

/* ---------- Vitalitaet ---------- */

export const VITALITY_STUFEN = [
  { code: "0", label: "0 — ohne Auffaelligkeit", hint: "Zuwachs und Belaubung altersgemaess" },
  { code: "1", label: "1 — leicht geschwaecht", hint: "beginnende Verlichtung, kuerzerer Zuwachs" },
  { code: "2", label: "2 — deutlich geschwaecht", hint: "erkennbare Verlichtung, Totholzbildung" },
  { code: "3", label: "3 — stark geschwaecht", hint: "absterbende Bereiche, kaum Zuwachs" },
] as const;
