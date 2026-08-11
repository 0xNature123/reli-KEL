/** Nur eigene Pfade als Rueckleitungsziel zulassen - sonst waere das eine offene Weiterleitung. */
export function safeNext(value: string | undefined | null, fallback = "/app"): string {
  if (!value) return fallback;
  if (!value.startsWith("/")) return fallback;
  if (value.startsWith("//") || value.startsWith("/\\")) return fallback;
  return value;
}
