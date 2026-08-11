import type { Assessment, DevPhase, Urgency, Vitality } from "@/types";

/**
 * Vorschlag fuer das naechste Kontrollintervall in Monaten.
 *
 * Das ist ein Vorschlag, keine Festlegung. Die fachliche Entscheidung trifft der
 * Kontrolleur, und genau so steht es auch im Bericht. Standortfaktoren wie eine hohe
 * Verkehrserwartung verkuerzen das Intervall zusaetzlich.
 */
export function suggestInterval(
  phase: DevPhase,
  assessment: Assessment,
  vitality: Vitality = "0",
): number {
  if (assessment === "nicht_gegeben") return 0; // Sofortmassnahme, danach Neubewertung
  if (assessment === "eingeschraenkt") return 6;

  const basis = phase === "jugend" ? 36 : phase === "reife" ? 24 : 12;

  // Eine deutlich geschwaechte Vitalitaet verkuerzt den Vorschlag, auch wenn die
  // Verkehrssicherheit gegeben ist: Vitalitaet und Sicherheit sind zwei Achsen.
  if (vitality === "3") return Math.min(basis, 12);
  if (vitality === "2") return Math.min(basis, 18);
  return basis;
}

/** Monate auf ein Datum rechnen. Monat 0 bedeutet: heute faellig. */
export function addMonths(from: Date, months: number): Date {
  const d = new Date(from.getTime());
  d.setMonth(d.getMonth() + months);
  return d;
}

const URGENCY_DAYS: Record<Urgency, number> = {
  sofort: 0,
  drei_monate: 90,
  naechste_kontrolle: 365,
};

/** Fristdatum aus der Dringlichkeit. Bei "naechste Kontrolle" zaehlt der Folgetermin. */
export function dueDateFor(urgency: Urgency, from: Date, nextDue?: Date | null): Date {
  if (urgency === "naechste_kontrolle" && nextDue) return new Date(nextDue.getTime());
  const d = new Date(from.getTime());
  d.setDate(d.getDate() + URGENCY_DAYS[urgency]);
  return d;
}

export const URGENCY_LABEL: Record<Urgency, string> = {
  sofort: "sofort",
  drei_monate: "innerhalb 3 Monaten",
  naechste_kontrolle: "bis zur naechsten Kontrolle",
};

/** Ampelfarbe als Token-Name. Wird nur fuer kleine Marker benutzt, nie als Flaeche. */
export const URGENCY_TOKEN: Record<Urgency, "red" | "amber" | "green"> = {
  sofort: "red",
  drei_monate: "amber",
  naechste_kontrolle: "green",
};
