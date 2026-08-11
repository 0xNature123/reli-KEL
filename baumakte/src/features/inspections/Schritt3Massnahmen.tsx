"use client";

import { Badge, Chip } from "@/components/Badge";
import { Field, Input, TextArea } from "@/components/Field";
import { toIsoDate } from "@/lib/format";
import {
  HABITAT_KINDS,
  HABITAT_RELEVANT_MEASURES,
  MEASURE_KINDS,
  measureLabel,
} from "@/lib/fll/catalog";
import { dueDateFor, URGENCY_LABEL, URGENCY_TOKEN } from "@/lib/fll/intervals";
import type { Assessment, HabitatFeature, Urgency } from "@/types";
import type { MeasureEntwurf } from "./state";

const URGENCIES: Urgency[] = ["sofort", "drei_monate", "naechste_kontrolle"];

export function Schritt3Massnahmen({
  assessment,
  nextDueOn,
  measures,
  habitat,
  note,
  onMeasures,
  onHabitat,
  onNote,
}: {
  assessment: Assessment;
  nextDueOn: string;
  measures: MeasureEntwurf[];
  habitat: HabitatFeature[];
  note: string;
  onMeasures: (next: MeasureEntwurf[]) => void;
  onHabitat: (next: HabitatFeature[]) => void;
  onNote: (next: string) => void;
}) {
  const pflicht = assessment !== "gegeben";
  const faellungGeplant = measures.some((m) => HABITAT_RELEVANT_MEASURES.includes(m.kind));

  function hinzufuegen(kind: string) {
    const urgency: Urgency = assessment === "nicht_gegeben" ? "sofort" : "drei_monate";
    onMeasures([
      ...measures,
      {
        id: crypto.randomUUID(),
        kind,
        urgency,
        due_on: toIsoDate(dueDateFor(urgency, new Date(), new Date(`${nextDueOn}T00:00:00`))),
        note: null,
      },
    ]);
  }

  function aendern(id: string, patch: Partial<MeasureEntwurf>) {
    onMeasures(
      measures.map((m) => {
        if (m.id !== id) return m;
        const next = { ...m, ...patch };
        if (patch.urgency) {
          next.due_on = toIsoDate(
            dueDateFor(patch.urgency, new Date(), new Date(`${nextDueOn}T00:00:00`)),
          );
        }
        return next;
      }),
    );
  }

  function habitatUmschalten(kind: HabitatFeature["kind"]) {
    const vorhanden = habitat.some((h) => h.kind === kind);
    onHabitat(
      vorhanden
        ? habitat.filter((h) => h.kind !== kind)
        : [...habitat, { kind, area: null, note: null }],
    );
  }

  return (
    <div className="space-y-4">
      {pflicht && measures.length === 0 && (
        <p
          className="bg-white border border-[var(--amber)] rounded-[10px] p-3 text-[15px]"
          role="alert"
        >
          Die Verkehrssicherheit ist{" "}
          {assessment === "nicht_gegeben" ? "nicht gegeben" : "eingeschraenkt"}. Waehlen Sie
          mindestens eine Massnahme.
        </p>
      )}

      <section className="bg-white rounded-[10px] border border-[var(--gray-200)] p-4">
        <h3 className="font-semibold mb-3">Massnahme hinzufuegen</h3>
        <div className="grid sm:grid-cols-2 gap-2">
          {MEASURE_KINDS.map((m) => (
            <Chip key={m.code} selected={false} onClick={() => hinzufuegen(m.code)}>
              + {m.label}
            </Chip>
          ))}
        </div>
      </section>

      {measures.map((m) => (
        <section key={m.id} className="bg-white rounded-[10px] border border-[var(--gray-200)] p-4">
          <div className="flex items-start justify-between gap-3 mb-3">
            <h3 className="font-semibold">{measureLabel(m.kind)}</h3>
            <button
              type="button"
              onClick={() => onMeasures(measures.filter((x) => x.id !== m.id))}
              className="min-h-[48px] px-2 text-[var(--red)] underline text-[15px]"
            >
              entfernen
            </button>
          </div>

          <div className="flex flex-wrap gap-2 mb-3">
            {URGENCIES.map((u) => (
              <Chip key={u} selected={m.urgency === u} onClick={() => aendern(m.id, { urgency: u })}>
                <Badge tone={URGENCY_TOKEN[u]}>{URGENCY_LABEL[u]}</Badge>
              </Chip>
            ))}
          </div>

          <Field label="Frist" htmlFor={`frist-${m.id}`}>
            <Input
              id={`frist-${m.id}`}
              type="date"
              className="tnum"
              value={m.due_on}
              onChange={(e) => aendern(m.id, { due_on: e.target.value })}
            />
          </Field>

          <TextArea
            placeholder="Bemerkung zur Massnahme (optional)"
            aria-label="Bemerkung zur Massnahme"
            value={m.note ?? ""}
            onChange={(e) => aendern(m.id, { note: e.target.value || null })}
          />
        </section>
      ))}

      {/* Artenschutz */}
      <section className="bg-white rounded-[10px] border border-[var(--gray-200)] p-4">
        <h3 className="font-semibold mb-1">Artenschutz</h3>
        <p className="text-[13px] text-[var(--gray-500)] mb-3">
          Halten Sie fest, was Sie am Baum gesehen haben. Erscheint im Bericht.
        </p>
        <div className="grid sm:grid-cols-2 gap-2">
          {HABITAT_KINDS.map((h) => (
            <Chip
              key={h.code}
              selected={habitat.some((x) => x.kind === h.code)}
              onClick={() => habitatUmschalten(h.code)}
            >
              {h.label}
            </Chip>
          ))}
        </div>

        {faellungGeplant && (
          <p
            className="mt-3 border border-[var(--amber)] rounded-[10px] p-3 text-[15px]"
            role="alert"
          >
            Sie haben einen Eingriff in die Krone oder eine Faellung vorgesehen. Pruefen Sie
            vorher die artenschutzrechtliche Zulaessigkeit nach §§ 39, 44 BNatSchG —
            besonders in der Brut- und Setzzeit und bei Quartierverdacht.
          </p>
        )}
      </section>

      <section className="bg-white rounded-[10px] border border-[var(--gray-200)] p-4">
        <h3 className="font-semibold mb-3">Bemerkung zur Kontrolle</h3>
        <TextArea
          placeholder="Optional. Erscheint im Bericht."
          aria-label="Bemerkung zur Kontrolle"
          value={note}
          onChange={(e) => onNote(e.target.value)}
        />
      </section>

      {measures.length > 0 && (
        <p className="text-[13px] text-[var(--gray-500)]">
          Nach der Ausfuehrung haken Sie die Massnahme am Baum ab. Dabei werden Datum und
          ausfuehrende Person festgehalten.
        </p>
      )}
    </div>
  );
}
