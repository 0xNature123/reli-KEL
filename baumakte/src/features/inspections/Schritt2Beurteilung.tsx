"use client";

import { Chip } from "@/components/Badge";
import { Field, Input } from "@/components/Field";
import { VITALITY_STUFEN } from "@/lib/fll/catalog";
import type { Assessment, DevPhase, Vitality } from "@/types";

const SICHERHEIT: Array<{ code: Assessment; label: string; hint: string }> = [
  { code: "gegeben", label: "gegeben", hint: "keine Massnahme erforderlich" },
  { code: "eingeschraenkt", label: "eingeschraenkt", hint: "Massnahme mit Frist" },
  { code: "nicht_gegeben", label: "nicht gegeben", hint: "Sofortmassnahme" },
];

const PHASEN: Array<{ code: DevPhase; label: string }> = [
  { code: "jugend", label: "Jugendphase" },
  { code: "reife", label: "Reifephase" },
  { code: "alterung", label: "Alterungsphase" },
];

export function Schritt2Beurteilung({
  assessment,
  vitality,
  devPhase,
  intervalMonths,
  nextDueOn,
  onChange,
}: {
  assessment: Assessment;
  vitality: Vitality;
  devPhase: DevPhase;
  intervalMonths: number;
  nextDueOn: string;
  onChange: (patch: {
    assessment?: Assessment;
    vitality?: Vitality;
    devPhase?: DevPhase;
    intervalMonths?: number;
    nextDueOn?: string;
  }) => void;
}) {
  return (
    <div className="space-y-4">
      <section className="bg-white rounded-[10px] border border-[var(--gray-200)] p-4">
        <h3 className="font-semibold mb-1">Verkehrssicherheit</h3>
        <p className="text-[13px] text-[var(--gray-500)] mb-3">
          Bewertet die Gefahr fuer Personen und Sachen — unabhaengig davon, wie vital der
          Baum ist.
        </p>
        <div className="grid gap-2">
          {SICHERHEIT.map((s) => (
            <button
              key={s.code}
              type="button"
              aria-pressed={assessment === s.code}
              onClick={() => onChange({ assessment: s.code })}
              className={[
                "min-h-[56px] px-4 py-2 rounded-[10px] text-left border",
                assessment === s.code
                  ? "bg-[var(--violet-50)] border-[var(--violet-600)] text-[var(--violet-700)]"
                  : "bg-white border-[var(--gray-200)] hover:border-[var(--gray-500)]",
              ].join(" ")}
            >
              <span className="block font-semibold">{s.label}</span>
              <span className="block text-[13px] text-[var(--gray-500)]">{s.hint}</span>
            </button>
          ))}
        </div>
      </section>

      <section className="bg-white rounded-[10px] border border-[var(--gray-200)] p-4">
        <h3 className="font-semibold mb-1">Vitalitaet</h3>
        <p className="text-[13px] text-[var(--gray-500)] mb-3">
          Bewertet den Zustand des Baums. Ein vitaler Baum kann unsicher sein, ein
          geschwaechter sicher — deshalb steht das hier getrennt.
        </p>
        <div className="grid gap-2">
          {VITALITY_STUFEN.map((v) => (
            <button
              key={v.code}
              type="button"
              aria-pressed={vitality === v.code}
              onClick={() => onChange({ vitality: v.code })}
              className={[
                "min-h-[48px] px-4 py-2 rounded-[10px] text-left border",
                vitality === v.code
                  ? "bg-[var(--violet-50)] border-[var(--violet-600)] text-[var(--violet-700)]"
                  : "bg-white border-[var(--gray-200)] hover:border-[var(--gray-500)]",
              ].join(" ")}
            >
              <span className="block font-medium">{v.label}</span>
              <span className="block text-[13px] text-[var(--gray-500)]">{v.hint}</span>
            </button>
          ))}
        </div>
      </section>

      <section className="bg-white rounded-[10px] border border-[var(--gray-200)] p-4">
        <h3 className="font-semibold mb-3">Entwicklungsphase</h3>
        <div className="flex flex-wrap gap-2">
          {PHASEN.map((p) => (
            <Chip
              key={p.code}
              selected={devPhase === p.code}
              onClick={() => onChange({ devPhase: p.code })}
            >
              {p.label}
            </Chip>
          ))}
        </div>
      </section>

      <section className="bg-white rounded-[10px] border border-[var(--gray-200)] p-4">
        <h3 className="font-semibold mb-1">Naechste Kontrolle</h3>
        <p className="text-[13px] text-[var(--gray-500)] mb-3">
          Vorschlag aus Entwicklungsphase, Vitalitaet und Beurteilung. Die fachliche
          Entscheidung treffen Sie — der Bericht weist das so aus.
        </p>

        <div className="flex flex-wrap gap-2 mb-3">
          {[6, 12, 18, 24, 36].map((m) => (
            <Chip
              key={m}
              selected={intervalMonths === m}
              onClick={() => onChange({ intervalMonths: m })}
            >
              {m} Monate
            </Chip>
          ))}
        </div>

        <Field label="Faelligkeit" htmlFor="next_due">
          <Input
            id="next_due"
            type="date"
            className="tnum"
            value={nextDueOn}
            onChange={(e) => onChange({ nextDueOn: e.target.value })}
          />
        </Field>
      </section>
    </div>
  );
}
