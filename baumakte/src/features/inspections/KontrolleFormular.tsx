"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/Button";
import { db } from "@/lib/db/dexie";
import { addMonths, suggestInterval } from "@/lib/fll/intervals";
import { toIsoDate } from "@/lib/format";
import { kontrolleSpeichern } from "./actions";
import { Schritt1Befunde } from "./Schritt1Befunde";
import { Schritt2Beurteilung } from "./Schritt2Beurteilung";
import { Schritt3Massnahmen } from "./Schritt3Massnahmen";
import { anzahlBefunde, neuerEntwurf, type KontrolleEntwurf } from "./state";

const SCHRITTE = ["Befunde", "Beurteilung", "Massnahmen"] as const;

interface BeurteilungPatch {
  assessment?: KontrolleEntwurf["assessment"];
  vitality?: KontrolleEntwurf["vitality"];
  devPhase?: KontrolleEntwurf["devPhase"];
  intervalMonths?: number;
  nextDueOn?: string;
}

export function KontrolleFormular({
  treeId,
  treeNumber,
  species,
  orgId,
  inspectorName,
}: {
  treeId: string;
  treeNumber: string;
  species: string;
  orgId: string;
  inspectorName: string;
}) {
  const router = useRouter();
  const [schritt, setSchritt] = useState(0);
  const [fehler, setFehler] = useState<string | null>(null);
  const [speichert, setSpeichert] = useState(false);

  const standard = useMemo(
    () => neuerEntwurf(treeId, crypto.randomUUID(), toIsoDate(addMonths(new Date(), 24))),
    [treeId],
  );
  const [entwurf, setEntwurf] = useState<KontrolleEntwurf>(standard);
  const [geladen, setGeladen] = useState(false);

  // Entwurf lokal sichern: Wird die App waehrend der Kontrolle beendet, ist die
  // Arbeit beim naechsten Start noch da.
  useEffect(() => {
    let aktiv = true;
    db.drafts
      .get(treeId)
      .then((d) => {
        if (aktiv && d?.data) setEntwurf(d.data as KontrolleEntwurf);
      })
      .catch(() => undefined)
      .finally(() => aktiv && setGeladen(true));
    return () => {
      aktiv = false;
    };
  }, [treeId]);

  useEffect(() => {
    if (!geladen) return;
    db.drafts.put({ treeId, data: entwurf, updatedAt: Date.now() }).catch(() => undefined);
  }, [entwurf, treeId, geladen]);

  // Der Intervallvorschlag folgt der Beurteilung, solange der Nutzer ihn nicht selbst setzt.
  function beurteilungAendern(patch: BeurteilungPatch) {
    setEntwurf((e) => {
      const next = { ...e, ...patch };
      const vorschlagNoetig =
        patch.assessment !== undefined ||
        patch.vitality !== undefined ||
        patch.devPhase !== undefined;

      if (vorschlagNoetig) {
        const monate = suggestInterval(next.devPhase, next.assessment, next.vitality);
        next.intervalMonths = monate;
        next.nextDueOn = toIsoDate(addMonths(new Date(), monate));
      } else if (patch.intervalMonths !== undefined) {
        next.nextDueOn = toIsoDate(addMonths(new Date(), patch.intervalMonths));
      }
      return next;
    });
  }

  async function abschliessen() {
    setFehler(null);

    if (entwurf.assessment !== "gegeben" && entwurf.measures.length === 0) {
      setSchritt(2);
      setFehler(
        "Bei eingeschraenkter oder nicht gegebener Verkehrssicherheit ist mindestens eine Massnahme noetig.",
      );
      return;
    }

    setSpeichert(true);
    const ergebnis = await kontrolleSpeichern({
      id: entwurf.id,
      tree_id: entwurf.treeId,
      inspected_at: new Date().toISOString(),
      dev_phase: entwurf.devPhase,
      vitality: entwurf.vitality,
      assessment: entwurf.assessment,
      findings: entwurf.findings,
      habitat_features: entwurf.habitat,
      next_interval_months: entwurf.intervalMonths,
      next_due_on: entwurf.nextDueOn,
      note: entwurf.note.trim() || null,
      voids_inspection_id: null,
      void_reason: null,
      measures: entwurf.measures,
      photos: entwurf.photos.map(({ vorschau: _vorschau, ...rest }) => rest),
    });

    if (!ergebnis.ok) {
      setSpeichert(false);
      setFehler(ergebnis.fehler ?? "Die Kontrolle konnte nicht gespeichert werden.");
      return;
    }

    await db.drafts.delete(treeId).catch(() => undefined);
    router.push(`/app/baum/${treeId}?gespeichert=1`);
    router.refresh();
  }

  const befunde = anzahlBefunde(entwurf.findings);

  return (
    <div className="pb-28">
      {/* Fortschritt */}
      <div className="mb-4">
        <div className="flex gap-1 mb-2" aria-hidden>
          {SCHRITTE.map((_, i) => (
            <span
              key={i}
              className={[
                "h-1 flex-1 rounded-[999px]",
                i <= schritt ? "bg-[var(--violet-600)]" : "bg-[var(--gray-200)]",
              ].join(" ")}
            />
          ))}
        </div>
        <p className="text-[13px] text-[var(--gray-500)] m-0">
          Schritt {schritt + 1} von 3 · {SCHRITTE[schritt]} · Baum {treeNumber}, {species}
        </p>
      </div>

      {schritt === 0 && (
        <Schritt1Befunde
          findings={entwurf.findings}
          onChange={(findings) => setEntwurf((e) => ({ ...e, findings }))}
          photos={entwurf.photos}
          onPhoto={(f) => setEntwurf((e) => ({ ...e, photos: [...e.photos, f] }))}
          onPhotoRemove={(id) =>
            setEntwurf((e) => ({ ...e, photos: e.photos.filter((p) => p.id !== id) }))
          }
          fotoKontext={{ orgId, treeId, treeNumber, inspectorName }}
        />
      )}

      {schritt === 1 && (
        <Schritt2Beurteilung
          assessment={entwurf.assessment}
          vitality={entwurf.vitality}
          devPhase={entwurf.devPhase}
          intervalMonths={entwurf.intervalMonths}
          nextDueOn={entwurf.nextDueOn}
          onChange={beurteilungAendern}
        />
      )}

      {schritt === 2 && (
        <Schritt3Massnahmen
          assessment={entwurf.assessment}
          nextDueOn={entwurf.nextDueOn}
          measures={entwurf.measures}
          habitat={entwurf.habitat}
          note={entwurf.note}
          onMeasures={(measures) => setEntwurf((e) => ({ ...e, measures }))}
          onHabitat={(habitat) => setEntwurf((e) => ({ ...e, habitat }))}
          onNote={(note) => setEntwurf((e) => ({ ...e, note }))}
        />
      )}

      {fehler && (
        <p className="mt-4 text-[15px] text-[var(--red)]" role="alert">
          {fehler}
        </p>
      )}

      {/* Ein Button, unten fixiert, in Daumenreichweite. */}
      <div className="fixed left-0 right-0 bottom-0 z-30 bg-white border-t border-[var(--gray-200)] p-3 safe-bottom">
        <div className="max-w-[1100px] mx-auto flex items-center gap-3">
          {schritt > 0 && (
            <Button type="button" onClick={() => setSchritt((s) => s - 1)}>
              Zurueck
            </Button>
          )}
          <span className="text-[13px] text-[var(--gray-500)] tnum hidden sm:block">
            {befunde === 0 ? "ohne Befund" : `${befunde} Befunde`}
          </span>
          <div className="flex-1" />
          {schritt < 2 ? (
            <Button type="button" variant="primary" onClick={() => setSchritt((s) => s + 1)}>
              Weiter
            </Button>
          ) : (
            <Button type="button" variant="primary" onClick={abschliessen} disabled={speichert}>
              {speichert ? "Wird gespeichert …" : "Kontrolle abschliessen"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
