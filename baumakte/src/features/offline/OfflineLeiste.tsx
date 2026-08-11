"use client";

import { useEffect, useState } from "react";
import { outboxAnzahl } from "@/lib/db/outbox";

/**
 * Schmale Leiste unter dem Header. Sichtbar nur, wenn es etwas zu sagen gibt:
 * offline oder noch nicht uebertragene Datensaetze. Bei Erfolg verschwindet sie
 * ohne Meldung.
 */
export function OfflineLeiste() {
  const [online, setOnline] = useState(true);
  const [wartend, setWartend] = useState(0);

  useEffect(() => {
    setOnline(navigator.onLine);

    const aktualisieren = () => {
      setOnline(navigator.onLine);
      outboxAnzahl()
        .then(setWartend)
        .catch(() => setWartend(0));
    };

    aktualisieren();
    const timer = window.setInterval(aktualisieren, 5000);
    window.addEventListener("online", aktualisieren);
    window.addEventListener("offline", aktualisieren);
    window.addEventListener("focus", aktualisieren);

    return () => {
      window.clearInterval(timer);
      window.removeEventListener("online", aktualisieren);
      window.removeEventListener("offline", aktualisieren);
      window.removeEventListener("focus", aktualisieren);
    };
  }, []);

  if (online && wartend === 0) return null;

  const text = !online
    ? wartend > 0
      ? `Offline. ${wartend} ${wartend === 1 ? "Eintrag wartet" : "Eintraege warten"} auf Uebertragung.`
      : "Offline. Ihre Eingaben werden auf dem Geraet gespeichert."
    : `${wartend} ${wartend === 1 ? "Eintrag wird" : "Eintraege werden"} uebertragen …`;

  return (
    <div className="bg-[var(--navy-700)] text-white text-[13px] px-4 py-1.5" role="status">
      <div className="max-w-[1100px] mx-auto">{text}</div>
    </div>
  );
}
