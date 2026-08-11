import type { PlanKey } from "@/types";

export type Billing = "monat" | "jahr";

export interface PlanDef {
  readonly key: PlanKey;
  readonly name: string;
  readonly monthlyCents: number;
  readonly yearlyCents: number | null;
  /** Grenzen werden serverseitig durchgesetzt, nicht nur angezeigt. */
  readonly maxTrees: number;
  readonly maxUsers: number;
  readonly features: readonly string[];
  /** Kein Selbstabschluss: Angebot auf Anfrage. */
  readonly selfService: boolean;
}

export const PLANS: Record<PlanKey, PlanDef> = {
  kontrolleur: {
    key: "kontrolleur",
    name: "Kontrolleur",
    monthlyCents: 3900,
    yearlyCents: 46800,
    maxTrees: 750,
    maxUsers: 1,
    features: ["1 Nutzer", "bis 750 Baeume", "Bericht mit eigenem Logo", "Offline-Betrieb"],
    selfService: true,
  },
  betrieb: {
    key: "betrieb",
    name: "Betrieb",
    monthlyCents: 7900,
    yearlyCents: 94800,
    maxTrees: 5000,
    maxUsers: 5,
    features: [
      "5 Nutzer",
      "bis 5.000 Baeume",
      "unbegrenzte Objekte",
      "Artenschutz-Bericht",
      "Eigentuemer-Portal, sobald verfuegbar",
    ],
    selfService: true,
  },
  eigentuemer: {
    key: "eigentuemer",
    name: "Eigentuemer",
    monthlyCents: 19900,
    yearlyCents: null,
    maxTrees: Number.MAX_SAFE_INTEGER,
    maxUsers: 25,
    features: [
      "unbegrenzte Baeume",
      "mehrere Liegenschaften",
      "Zugaenge fuer Dienstleister",
      "Vollexport des Bestands",
    ],
    selfService: false,
  },
};

export function isPlanKey(value: unknown): value is PlanKey {
  return typeof value === "string" && value in PLANS;
}

/**
 * Preis-ID aus der Umgebung. Preise werden nie aus dem Browser uebernommen -
 * der Client schickt nur Paket und Zahlungsweise, den Betrag bestimmt Stripe.
 */
export function priceIdFor(plan: PlanKey, billing: Billing): string | null {
  const env: Record<string, string | undefined> = {
    "kontrolleur:monat": process.env.STRIPE_PRICE_KONTROLLEUR_MONAT,
    "kontrolleur:jahr": process.env.STRIPE_PRICE_KONTROLLEUR_JAHR,
    "betrieb:monat": process.env.STRIPE_PRICE_BETRIEB_MONAT,
    "betrieb:jahr": process.env.STRIPE_PRICE_BETRIEB_JAHR,
  };
  return env[`${plan}:${billing}`] ?? null;
}

/** Grenzen des Pakets. Ohne Paket gilt die Testphase mit kleiner Obergrenze. */
export function limitsFor(plan: PlanKey | null): { maxTrees: number; maxUsers: number } {
  if (!plan) return { maxTrees: 100, maxUsers: 1 };
  const def = PLANS[plan];
  return { maxTrees: def.maxTrees, maxUsers: def.maxUsers };
}
