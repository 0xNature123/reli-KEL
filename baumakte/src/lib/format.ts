/** Deutsche Formatierung. Eine Stelle, damit Datum und Uhrzeit ueberall gleich aussehen. */

const TZ = "Europe/Berlin";

export function formatDate(value: string | Date | null | undefined): string {
  if (!value) return "—";
  const d = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(d.getTime())) return "—";
  return new Intl.DateTimeFormat("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: TZ,
  }).format(d);
}

export function formatDateTime(value: string | Date | null | undefined): string {
  if (!value) return "—";
  const d = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(d.getTime())) return "—";
  return new Intl.DateTimeFormat("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: TZ,
  }).format(d);
}

/** Langform fuer Kopfzeilen: "Montag, 11. August 2026". */
export function formatDateLong(value: string | Date): string {
  const d = typeof value === "string" ? new Date(value) : value;
  return new Intl.DateTimeFormat("de-DE", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: TZ,
  }).format(d);
}

/** ISO-Datum ohne Zeitanteil, fuer date-Spalten und Formularfelder. */
export function toIsoDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** "ueberfaellig seit 4 Tagen" / "faellig in 12 Tagen" */
export function dueLabel(dueOn: string, now = new Date()): string {
  const due = new Date(`${dueOn}T00:00:00`);
  const days = Math.round((due.getTime() - now.getTime()) / 86_400_000);
  if (days < 0) return `ueberfaellig seit ${Math.abs(days)} ${Math.abs(days) === 1 ? "Tag" : "Tagen"}`;
  if (days === 0) return "heute faellig";
  if (days === 1) return "morgen faellig";
  return `faellig in ${days} Tagen`;
}

export function formatEuro(cents: number): string {
  return new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" }).format(cents / 100);
}

export function fileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}
