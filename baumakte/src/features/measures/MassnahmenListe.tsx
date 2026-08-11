"use client";

import { useState } from "react";
import { Badge } from "@/components/Badge";
import { Button } from "@/components/Button";
import { Field, Input, TextArea } from "@/components/Field";
import { SectionTitle } from "@/components/Card";
import { massnahmeErledigen } from "@/features/inspections/actions";
import { measureLabel } from "@/lib/fll/catalog";
import { URGENCY_LABEL, URGENCY_TOKEN } from "@/lib/fll/intervals";
import { dueLabel, formatDate, formatDateTime } from "@/lib/format";
import type { Measure } from "@/types";

export function MassnahmenListe({
  massnahmen,
  erledigte,
  standardName,
}: {
  massnahmen: Measure[];
  erledigte: Measure[];
  standardName: string;
}) {
  const [offenId, setOffenId] = useState<string | null>(null);
  const [name, setName] = useState(standardName);
  const [bemerkung, setBemerkung] = useState("");
  const [fehler, setFehler] = useState<string | null>(null);
  const [laeuft, setLaeuft] = useState(false);

  async function abschliessen(id: string) {
    setLaeuft(true);
    setFehler(null);
    const ergebnis = await massnahmeErledigen(id, name, bemerkung || null);
    setLaeuft(false);
    if (!ergebnis.ok) {
      setFehler(ergebnis.fehler ?? "Nicht moeglich.");
      return;
    }
    setOffenId(null);
    setBemerkung("");
  }

  if (massnahmen.length === 0 && erledigte.length === 0) return null;

  return (
    <section className="mb-8">
      <SectionTitle>Massnahmen</SectionTitle>

      {massnahmen.length === 0 ? (
        <p className="text-[var(--gray-500)] mb-4">Keine offene Massnahme.</p>
      ) : (
        <div className="bg-white rounded-[10px] border border-[var(--gray-200)] overflow-hidden mb-4">
          {massnahmen.map((m) => (
            <div key={m.id} className="px-4 py-3 border-b border-[var(--gray-200)] last:border-b-0">
              <div className="flex items-start gap-3">
                <span className="flex-1 min-w-0">
                  <span className="block font-semibold">{measureLabel(m.kind)}</span>
                  <span className="block text-[13px] text-[var(--gray-500)] tnum">
                    {URGENCY_LABEL[m.urgency]} · Frist {formatDate(m.due_on)} ·{" "}
                    {dueLabel(m.due_on)}
                  </span>
                  {m.note && <span className="block text-[15px] mt-1">{m.note}</span>}
                </span>
                <Badge tone={URGENCY_TOKEN[m.urgency]}>{URGENCY_LABEL[m.urgency]}</Badge>
              </div>

              {offenId === m.id ? (
                <div className="mt-3 border-t border-[var(--gray-200)] pt-3">
                  <p className="text-[13px] text-[var(--gray-500)] mb-2">
                    Der Nachweis haelt fest, wann und von wem die Massnahme ausgefuehrt wurde.
                  </p>
                  <Field label="Ausgefuehrt von" htmlFor={`von-${m.id}`} error={fehler}>
                    <Input
                      id={`von-${m.id}`}
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </Field>
                  <TextArea
                    placeholder="Bemerkung zur Ausfuehrung (optional)"
                    aria-label="Bemerkung zur Ausfuehrung"
                    value={bemerkung}
                    onChange={(e) => setBemerkung(e.target.value)}
                  />
                  <div className="flex gap-2 mt-2">
                    <Button type="button" onClick={() => setOffenId(null)}>
                      Abbrechen
                    </Button>
                    <Button
                      type="button"
                      variant="primary"
                      disabled={laeuft}
                      onClick={() => abschliessen(m.id)}
                    >
                      {laeuft ? "Wird gespeichert …" : "Ausfuehrung bestaetigen"}
                    </Button>
                  </div>
                </div>
              ) : (
                <Button
                  type="button"
                  className="mt-2"
                  onClick={() => {
                    setOffenId(m.id);
                    setFehler(null);
                  }}
                >
                  Als ausgefuehrt eintragen
                </Button>
              )}
            </div>
          ))}
        </div>
      )}

      {erledigte.length > 0 && (
        <details className="bg-white rounded-[10px] border border-[var(--gray-200)] overflow-hidden">
          <summary className="min-h-[48px] px-4 py-3 cursor-pointer font-medium">
            {erledigte.length} ausgefuehrte {erledigte.length === 1 ? "Massnahme" : "Massnahmen"}
          </summary>
          <div className="border-t border-[var(--gray-200)]">
            {erledigte.map((m) => (
              <div key={m.id} className="px-4 py-3 border-b border-[var(--gray-200)] last:border-b-0">
                <span className="block font-medium">{measureLabel(m.kind)}</span>
                <span className="block text-[13px] text-[var(--gray-500)] tnum">
                  ausgefuehrt {formatDateTime(m.done_at)} Uhr von {m.done_by_name ?? "—"}
                </span>
                {m.done_note && <span className="block text-[15px] mt-1">{m.done_note}</span>}
              </div>
            ))}
          </div>
        </details>
      )}
    </section>
  );
}
