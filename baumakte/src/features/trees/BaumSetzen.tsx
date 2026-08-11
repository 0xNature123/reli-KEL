"use client";

import dynamic from "next/dynamic";
import { useActionState, useEffect, useMemo, useState } from "react";
import { Chip } from "@/components/Badge";
import { Button } from "@/components/Button";
import { Field, Input } from "@/components/Field";
import { baumAnlegen, type TreeFormState } from "@/features/trees/actions";
import { HEIGHT_CLASSES, searchSpecies } from "@/lib/species";
import type { KartenBaum } from "./Karte";

// MapLibre laeuft nur im Browser.
const Karte = dynamic(() => import("./Karte").then((m) => m.Karte), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full grid place-items-center bg-[var(--gray-50)] text-[var(--gray-500)]">
      Karte wird geladen …
    </div>
  ),
});

const LETZTE_ARTEN = "baumakte:letzte-arten";

export function BaumSetzen({
  siteId,
  center,
  trees,
  vorschlagNummer,
}: {
  siteId: string;
  center: [number, number];
  trees: KartenBaum[];
  vorschlagNummer: string;
}) {
  const [state, action, laeuft] = useActionState<TreeFormState, FormData>(baumAnlegen, {});
  const fehler = state.fehler ?? {};

  const [modus, setModus] = useState<"karte" | "formular">("karte");
  const [pos, setPos] = useState<{ lng: number; lat: number; acc: number | null }>({
    lng: center[0],
    lat: center[1],
    acc: null,
  });

  const [art, setArt] = useState("");
  const [artSuche, setArtSuche] = useState("");
  const [hoehe, setHoehe] = useState<string>("10-15");
  const [zuletzt, setZuletzt] = useState<string[]>([]);

  // Jede Kennung entsteht auf dem Geraet - so bleibt ein spaeterer Offline-Upload idempotent.
  const id = useMemo(() => crypto.randomUUID(), []);

  useEffect(() => {
    try {
      const roh = localStorage.getItem(LETZTE_ARTEN);
      if (roh) setZuletzt(JSON.parse(roh) as string[]);
    } catch {
      setZuletzt([]);
    }
  }, []);

  function artWaehlen(name: string) {
    setArt(name);
    setArtSuche("");
    const neu = [name, ...zuletzt.filter((a) => a !== name)].slice(0, 5);
    setZuletzt(neu);
    try {
      localStorage.setItem(LETZTE_ARTEN, JSON.stringify(neu));
    } catch {
      // Privater Modus: dann eben ohne Merkliste.
    }
  }

  function meinePosition() {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (p) =>
        setPos({
          lng: p.coords.longitude,
          lat: p.coords.latitude,
          acc: Math.round(p.coords.accuracy),
        }),
      () => {
        // Fehlermeldung nennt Ursache und Ausweg - siehe Hinweis unter der Karte.
      },
      { enableHighAccuracy: true, timeout: 8000 },
    );
  }

  const treffer = searchSpecies(artSuche);

  if (modus === "karte") {
    return (
      <div className="fixed inset-0 z-40 flex flex-col bg-white">
        <div className="relative flex-1">
          <Karte
            center={[pos.lng, pos.lat]}
            trees={trees}
            onMove={(lng, lat) => setPos((p) => ({ ...p, lng, lat, acc: null }))}
          />
          {/* Fadenkreuz in der Kartenmitte */}
          <div
            aria-hidden
            className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
          >
            <div className="w-8 h-8 rounded-full border-2 border-[var(--violet-600)] bg-[var(--violet-50)] opacity-80" />
          </div>
        </div>

        <div className="border-t border-[var(--gray-200)] p-4 safe-bottom">
          <p className="text-[13px] text-[var(--gray-500)] mb-3 tnum">
            {pos.lat.toFixed(5)} N, {pos.lng.toFixed(5)} E
            {pos.acc !== null ? ` · ±${pos.acc} m` : " · Kartenmitte"}
          </p>
          <div className="flex gap-2">
            <Button type="button" onClick={meinePosition} className="flex-1">
              An meiner Position
            </Button>
            <Button
              type="button"
              variant="primary"
              className="flex-1"
              onClick={() => setModus("formular")}
            >
              Hier setzen
            </Button>
          </div>
          <p className="text-[13px] text-[var(--gray-500)] mt-2">
            Kein GPS-Signal? Verschieben Sie die Karte, bis der Kreis auf dem Baum liegt.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-40 bg-black/30 flex items-end">
      <form
        action={action}
        className="w-full bg-white rounded-t-[10px] p-4 max-h-[92dvh] overflow-y-auto safe-bottom"
      >
        <input type="hidden" name="id" value={id} />
        <input type="hidden" name="site_id" value={siteId} />
        <input type="hidden" name="lat" value={pos.lat} />
        <input type="hidden" name="lng" value={pos.lng} />
        <input type="hidden" name="gps_accuracy_m" value={pos.acc ?? ""} />
        <input type="hidden" name="species" value={art} />
        <input type="hidden" name="height_class" value={hoehe} />

        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Baum aufnehmen</h2>
          <button
            type="button"
            onClick={() => setModus("karte")}
            className="min-h-[48px] px-3 text-[var(--violet-700)] underline"
          >
            Position aendern
          </button>
        </div>

        <Field label="Nummer" htmlFor="number" error={fehler.number}>
          <Input id="number" name="number" defaultValue={vorschlagNummer} className="tnum" required />
        </Field>

        <Field
          label="Baumart"
          htmlFor="art"
          error={fehler.species}
          hint={art ? `Gewaehlt: ${art}` : "Tippen Sie die ersten Buchstaben."}
        >
          {zuletzt.length > 0 && !artSuche && (
            <div className="flex flex-wrap gap-2 mb-2">
              {zuletzt.map((a) => (
                <Chip key={a} selected={art === a} onClick={() => artWaehlen(a)}>
                  {a}
                </Chip>
              ))}
            </div>
          )}
          <Input
            id="art"
            value={artSuche}
            onChange={(e) => setArtSuche(e.target.value)}
            placeholder="Linde, Eiche, Ahorn …"
            autoComplete="off"
          />
          {treffer.length > 0 && (
            <div className="mt-2 border border-[var(--gray-200)] rounded-[10px] overflow-hidden">
              {treffer.map((s) => (
                <button
                  key={s.bot}
                  type="button"
                  onClick={() => artWaehlen(s.de)}
                  className="block w-full text-left min-h-[48px] px-3 py-2 bg-white
                             border-b border-[var(--gray-200)] last:border-b-0 hover:bg-[var(--gray-50)]"
                >
                  <span className="font-medium">{s.de}</span>{" "}
                  <span className="text-[var(--gray-500)] text-sm italic">{s.bot}</span>
                </button>
              ))}
            </div>
          )}
        </Field>

        <fieldset className="mb-4 border-0 p-0 m-0">
          <legend className="block mb-1 text-sm font-medium">Hoehe</legend>
          <div className="flex flex-wrap gap-2">
            {HEIGHT_CLASSES.map((h) => (
              <Chip key={h} selected={hoehe === h} onClick={() => setHoehe(h)}>
                {h} m
              </Chip>
            ))}
          </div>
        </fieldset>

        <Field label="Stammdurchmesser in cm" htmlFor="dbh" hint="Optional, in 1 m Hoehe geschaetzt.">
          <Input id="dbh" name="dbh_cm" type="number" inputMode="numeric" min={1} max={900} className="tnum" />
        </Field>

        <Button type="submit" variant="primary" full disabled={laeuft || !art}>
          {laeuft ? "Wird gespeichert …" : "Speichern und Kontrolle starten"}
        </Button>
      </form>
    </div>
  );
}
