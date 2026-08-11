"use client";

import { useRef, useState } from "react";
import type { FotoEntwurf } from "@/features/inspections/state";
import { stampPhoto } from "@/lib/image/stamp";
import { createClient } from "@/lib/supabase/client";
import type { AreaKey } from "@/types";

export interface FotoKontext {
  orgId: string;
  treeId: string;
  treeNumber: string;
  inspectorName: string;
}

/** Kamera-Eingabe, Stempel, Upload. Ohne Kamerabibliothek - das Betriebssystem reicht. */
export function FotoAufnahme({
  area,
  kontext,
  fotos,
  onFoto,
  onEntfernen,
}: {
  area: AreaKey | null;
  kontext: FotoKontext;
  fotos: FotoEntwurf[];
  onFoto: (f: FotoEntwurf) => void;
  onEntfernen: (id: string) => void;
}) {
  const eingabe = useRef<HTMLInputElement | null>(null);
  const [laeuft, setLaeuft] = useState(false);
  const [fehler, setFehler] = useState<string | null>(null);

  async function aufnehmen(file: File) {
    setLaeuft(true);
    setFehler(null);

    try {
      const position = await holePosition();
      const takenAt = new Date();

      const gestempelt = await stampPhoto(file, {
        takenAt,
        lat: position?.lat ?? null,
        lng: position?.lng ?? null,
        accuracyM: position?.acc ?? null,
        inspectorName: kontext.inspectorName,
        treeNumber: kontext.treeNumber,
      });

      const id = crypto.randomUUID();
      const pfad = `${kontext.orgId}/${kontext.treeId}/${id}.jpg`;

      const supabase = createClient();
      const { error } = await supabase.storage
        .from("fotos")
        .upload(pfad, gestempelt.blob, { contentType: "image/jpeg", upsert: false });

      if (error) throw new Error(error.message);

      onFoto({
        id,
        area,
        storage_path: pfad,
        taken_at: takenAt.toISOString(),
        lat: position?.lat ?? null,
        lng: position?.lng ?? null,
        sha256: gestempelt.sha256,
        vorschau: URL.createObjectURL(gestempelt.blob),
      });
    } catch {
      setFehler(
        "Das Foto konnte nicht gespeichert werden. Pruefen Sie die Verbindung und versuchen Sie es erneut.",
      );
    } finally {
      setLaeuft(false);
      if (eingabe.current) eingabe.current.value = "";
    }
  }

  return (
    <div>
      <input
        ref={eingabe}
        type="file"
        accept="image/*"
        capture="environment"
        className="sr-only"
        id={`foto-${area ?? "allgemein"}`}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) void aufnehmen(file);
        }}
      />

      <label
        htmlFor={`foto-${area ?? "allgemein"}`}
        className="inline-flex items-center gap-2 min-h-[48px] px-4 rounded-[10px] cursor-pointer
                   border border-[var(--gray-200)] bg-white text-[15px] font-medium
                   hover:border-[var(--gray-500)]"
      >
        {laeuft ? "Foto wird gestempelt …" : "Foto aufnehmen"}
      </label>

      {fehler && (
        <p className="mt-2 text-[13px] text-[var(--red)]" role="alert">
          {fehler}
        </p>
      )}

      {fotos.length > 0 && (
        <ul className="flex flex-wrap gap-2 mt-3 list-none p-0 m-0">
          {fotos.map((f) => (
            <li key={f.id} className="relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={f.vorschau}
                alt={`Foto ${f.area ?? ""}`}
                className="w-[104px] h-[78px] object-cover rounded-[10px] border border-[var(--gray-200)]"
              />
              <button
                type="button"
                onClick={() => onEntfernen(f.id)}
                aria-label="Foto entfernen"
                className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-white
                           border border-[var(--gray-200)] text-[var(--red)] leading-none"
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function holePosition(): Promise<{ lat: number; lng: number; acc: number } | null> {
  if (!navigator.geolocation) return Promise.resolve(null);
  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      (p) => resolve({ lat: p.coords.latitude, lng: p.coords.longitude, acc: p.coords.accuracy }),
      () => resolve(null),
      { enableHighAccuracy: true, timeout: 6000, maximumAge: 30_000 },
    );
  });
}
